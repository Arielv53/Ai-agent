from flask import request, jsonify
from ..extensions import db
from ..models import Like, Comment, Notification, User, Follower, Catch
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import case, func

def register_routes(app):
    @app.route("/catches/<int:catch_id>/post", methods=["GET"])
    @jwt_required(optional=True)
    def get_catch_post(catch_id):
        catch = db.get_or_404(Catch, catch_id)
        identity = get_jwt_identity()
        viewer_id = int(identity) if identity else None
        if not catch.is_public and catch.user_id != viewer_id:
            return jsonify({"error": "Catch not found"}), 404
        post = catch.to_dict(include_notes=catch.user_id == viewer_id)
        post["is_public"] = catch.is_public
        post["liked"] = Like.query.filter_by(user_id=viewer_id, catch_id=catch_id).first() is not None if viewer_id else False
        return jsonify(post), 200

    @app.route("/users/search", methods=["GET"])
    @jwt_required()
    def search_users():
        query = request.args.get("q", "").strip()
        if not query:
            return jsonify([]), 200
        if len(query) > 100:
            return jsonify({"error": "Search must be 100 characters or fewer"}), 400

        # Treat SQL wildcard characters as literal username characters.
        escaped = query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        users = (
            User.query.filter(User.username.ilike(f"%{escaped}%", escape="\\"))
            .order_by(
                case((func.lower(User.username) == query.lower(), 0), else_=1),
                func.lower(User.username), User.id,
            )
            .limit(50)
            .all()
        )
        return jsonify([
            {"id": user.id, "username": user.username, "profile_photo": user.profile_photo}
            for user in users
        ]), 200

    # ❤️ Like a catch
    @app.route("/catches/<int:catch_id>/like", methods=["POST"])
    @jwt_required()
    def like_catch(catch_id):
        user_id = int(get_jwt_identity())

        catch = db.get_or_404(Catch, catch_id)
        if not catch.is_public and catch.user_id != user_id:
            return jsonify({"error": "Catch not found"}), 404

        existing_like = Like.query.filter_by(user_id=user_id, catch_id=catch_id).first()
        if existing_like:
            return jsonify({"message": "Already liked"}), 200

        like = Like(user_id=user_id, catch_id=catch_id)
        db.session.add(like)
        if catch.user_id != user_id:
            db.session.add(Notification(recipient_id=catch.user_id, actor_id=user_id,
                                        catch_id=catch_id, type="like"))
        db.session.commit()

        return jsonify({"message": "Catch liked successfully"}), 201

    # 💔 Unlike a catch
    @app.route("/catches/<int:catch_id>/unlike", methods=["DELETE"])
    @jwt_required()
    def unlike_catch(catch_id):
        user_id = int(get_jwt_identity())

        like = Like.query.filter_by(user_id=user_id, catch_id=catch_id).first()
        if not like:
            return jsonify({"error": "Like not found"}), 404

        Notification.query.filter_by(actor_id=user_id, catch_id=catch_id, type="like").delete()
        db.session.delete(like)
        db.session.commit()

        return jsonify({"message": "Catch unliked successfully"}), 200

    # 💬 Post a comment
    @app.route("/catches/<int:catch_id>/comments", methods=["POST"])
    @jwt_required()
    def post_comment(catch_id):
        data = request.get_json(silent=True) or {}
        user_id = int(get_jwt_identity())
        content = data.get("content") if isinstance(data, dict) else None

        if not isinstance(content, str) or not content.strip():
            return jsonify({"error": "content is required"}), 400
        content = content.strip()
        if len(content) > 2000:
            return jsonify({"error": "Comments must be 2000 characters or fewer"}), 400
        catch = db.get_or_404(Catch, catch_id)
        if not catch.is_public and catch.user_id != user_id:
            return jsonify({"error": "Catch not found"}), 404

        comment = Comment(user_id=user_id, catch_id=catch_id, content=content)
        db.session.add(comment)
        if catch.user_id != user_id:
            db.session.add(Notification(recipient_id=catch.user_id, actor_id=user_id,
                                        catch_id=catch_id, type="comment"))
        db.session.commit()

        return jsonify(comment.to_dict()), 201

    # 🧾 Get comments for a catch
    @app.route("/catches/<int:catch_id>/comments", methods=["GET"])
    @jwt_required(optional=True)
    def get_comments(catch_id):
        catch = db.get_or_404(Catch, catch_id)
        identity = get_jwt_identity()
        if not catch.is_public and (not identity or catch.user_id != int(identity)):
            return jsonify({"error": "Catch not found"}), 404
        from ..feed import page_args, before_cursor, encode_cursor
        from sqlalchemy.orm import joinedload
        try:
            limit, cursor = page_args(request.args)
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        query = Comment.query.filter_by(catch_id=catch_id)
        total = query.count()
        if cursor:
            query = query.filter(before_cursor(Comment.timestamp, Comment.id, cursor))
        rows = query.options(joinedload(Comment.user)).order_by(
            Comment.timestamp.desc(), Comment.id.desc()
        ).limit(limit + 1).all()
        has_more = len(rows) > limit
        rows = rows[:limit]
        items = [comment.to_dict() for comment in rows]
        page = {"items": items, "total": total, "next_cursor":
                encode_cursor(rows[-1].timestamp, rows[-1].id) if has_more else None}
        return jsonify(page if "limit" in request.args or "cursor" in request.args else items), 200

    # 🔔 Get unread notification count
    @app.route("/notifications/unread-count", methods=["GET"])
    @jwt_required()
    def get_unread_notification_count():
        user_id = int(get_jwt_identity())

        count = Notification.query.filter_by(
            recipient_id=user_id,
            is_read=False
        ).count()

        return jsonify({"count": count}), 200
    
        # 📬 Get notifications for user
    @app.route("/notifications", methods=["GET"])
    @jwt_required()
    def get_notifications():
        user_id = int(get_jwt_identity())

        notifications = (
            db.session.query(
                Notification.id,
                Notification.type,
                Notification.catch_id,
                Notification.actor_id,
                Notification.is_read,
                Notification.created_at,
                User.username.label("actor_username"),
                User.profile_photo.label("actor_profile_photo"),
            )
            .outerjoin(User, User.id == Notification.actor_id)
            .filter(Notification.recipient_id == user_id)
            .order_by(Notification.created_at.desc())
            .all()
        )

        return jsonify([
            {
                "id": n.id,
                "type": n.type,
                "catch_id": n.catch_id,
                "actor_id": n.actor_id,
                "actor_username": n.actor_username,
                "actor_avatar_url": n.actor_profile_photo,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat() + "Z",
            }
            for n in notifications
        ]), 200
    
        # ✅ Mark all notifications as read
    @app.route("/notifications/mark-read", methods=["POST"])
    @jwt_required()
    def mark_notifications_read():
        user_id = int(get_jwt_identity())

        Notification.query.filter_by(
            recipient_id=user_id,
            is_read=False
        ).update({"is_read": True})

        db.session.commit()

        return jsonify({"success": True}), 200
    
    @app.route("/follow", methods=["POST"])
    @jwt_required()
    def follow_user():        
        data = request.json
        follower_id = int(get_jwt_identity())  # Get follower_id from JWT
        following_id = data["following_id"]

        # 🚫 Guard: prevent self-follow
        if follower_id == following_id:
            return jsonify({"error": "Cannot follow yourself"}), 400
        
        # Prevent duplicates
        existing = Follower.query.filter_by(
            follower_id=follower_id,
            following_id=following_id
        ).first()

        if existing:
            return jsonify({"error": "Already following"}), 400

        # ➕ Create follow relationship
        follow = Follower(
            follower_id=follower_id,
            following_id=following_id
        )
        db.session.add(follow)

        # prevent duplicate FOLLOW notifications
        existing_notification = Notification.query.filter_by(
            recipient_id=following_id,
            actor_id=follower_id,
            type="follow"
        ).first() 

        # 🔔 only create notification if one does not already exist
        if not existing_notification:
            notification = Notification(
                recipient_id=following_id,
                actor_id=follower_id,
                type="follow",
            )
            db.session.add(notification)
        db.session.commit()

        return jsonify({"success": True}), 201
    
    @app.route("/unfollow", methods=["POST"])
    @jwt_required()
    def unfollow_user():
        data = request.json
        follower_id = int(get_jwt_identity())
        following_id = data["following_id"]

        # 🔍 Find the follow relationship
        follow = Follower.query.filter_by(
            follower_id=follower_id,
            following_id=following_id
        ).first()

        if not follow:
            return jsonify({"error": "Not following"}), 400
        
        # ➖ Remove the follow relationship
        db.session.delete(follow)
        
        # Auto-delete the FOLLOW notification on unfollow
        follow_notification = Notification.query.filter_by(
            recipient_id=following_id, # user being unfollowed
            actor_id=follower_id, # user who unfollowed
            type="follow"
        ).first()

        if follow_notification:
            db.session.delete(follow_notification)

        db.session.commit()

        return jsonify({"success": True}), 200
