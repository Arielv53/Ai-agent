"""Bounded feed queries and shared keyset pagination."""
import base64
import json
from datetime import datetime
from sqlalchemy import and_, or_, func, select
from sqlalchemy.orm import joinedload
from .extensions import db
from .models import Catch, Comment, Like, Follower


def encode_cursor(timestamp, row_id):
    return base64.urlsafe_b64encode(json.dumps(
        [timestamp.isoformat() if timestamp else None, row_id]
    ).encode()).decode().rstrip("=")


def page_args(args, default=20):
    try:
        limit = int(args.get("limit", default))
        if not 1 <= limit <= 50:
            raise ValueError()
        raw = args.get("cursor")
        cursor = None
        if raw:
            if len(raw) > 512:
                raise ValueError()
            stamp, row_id = json.loads(base64.b64decode(
                raw + "=" * (-len(raw) % 4), altchars=b"-_", validate=True
            ))
            if type(row_id) is not int or row_id < 1:
                raise ValueError()
            stamp = datetime.fromisoformat(stamp) if stamp is not None else None
            if stamp is not None and stamp.tzinfo is not None:
                raise ValueError()
            cursor = (stamp, row_id)
        return limit, cursor
    except (ValueError, TypeError, UnicodeError, OverflowError) as exc:
        raise ValueError("Invalid limit or cursor") from exc


def before_cursor(column, id_column, cursor):
    stamp, row_id = cursor
    if stamp is None:
        return and_(column.is_(None), id_column < row_id)
    return or_(column < stamp, and_(column == stamp, id_column < row_id),
               column.is_(None))


def feed_page(viewer_id, limit, cursor):
    like_count = select(func.count(Like.id)).where(Like.catch_id == Catch.id).scalar_subquery()
    comment_count = select(func.count(Comment.id)).where(Comment.catch_id == Catch.id).scalar_subquery()
    liked = select(Like.id).where(Like.catch_id == Catch.id, Like.user_id == viewer_id).exists()
    following = select(Follower.id).where(
        Follower.follower_id == viewer_id, Follower.following_id == Catch.user_id
    ).exists()
    query = db.session.query(Catch, like_count, comment_count, liked, following).options(
        joinedload(Catch.user)
    ).filter(Catch.is_public.is_(True))
    if cursor:
        query = query.filter(before_cursor(Catch.created_at, Catch.id, cursor))
    rows = query.order_by(Catch.created_at.desc().nullslast(), Catch.id.desc()).limit(limit + 1).all()
    has_more = len(rows) > limit
    rows = rows[:limit]
    ids = [row[0].id for row in rows]
    previews = {row_id: [] for row_id in ids}
    if ids:
        ranked = select(
            Comment.id,
            func.row_number().over(
                partition_by=Comment.catch_id,
                order_by=(Comment.timestamp.desc(), Comment.id.desc())
            ).label("position")
        ).where(Comment.catch_id.in_(ids)).subquery()
        comments = Comment.query.join(ranked, Comment.id == ranked.c.id).filter(
            ranked.c.position <= 3
        ).options(joinedload(Comment.user)).order_by(
            Comment.timestamp.desc(), Comment.id.desc()
        ).all()
        for comment in comments:
            previews[comment.catch_id].append(comment.to_dict())
    items = []
    for catch, likes, comments, is_liked, is_following in rows:
        preview = previews[catch.id]
        items.append({
            "id": catch.id, "image_url": catch.image_url, "caption": catch.caption,
            "species": catch.species, "location": catch.location,
            "date_caught": catch.date_caught.isoformat() if catch.date_caught else None,
            "created_at": catch.created_at.isoformat() + "Z" if catch.created_at else None,
            "is_public": True, "user_id": catch.user_id,
            "user_name": catch.user.username if catch.user else None,
            "user_avatar": catch.user.profile_photo if catch.user else None,
            "like_count": likes, "likes_count": likes, "liked": bool(is_liked),
            "comment_count": comments, "comments_count": comments,
            "is_following": bool(is_following), "comments_preview": preview,
            "comments_next_cursor": encode_cursor(
                datetime.fromisoformat(preview[-1]["timestamp"]), preview[-1]["id"]
            ) if comments > len(preview) and preview else None,
        })
    last = rows[-1][0] if rows else None
    return {"items": items, "next_cursor": encode_cursor(last.created_at, last.id)
            if has_more and last else None}
