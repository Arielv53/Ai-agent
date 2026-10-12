from flask import jsonify, request

from ..extensions import db
from ..location_service import (
    activate_location,
    find_or_create_location,
    serialize_location,
)
from ..models import (
    FishingLocation,
    Notification,
    SpotGroup,
    SpotGroupMember,
    SpotGroupMessage,
)
from ..premium import admin_required, premium_required


NOTIFICATION_LEVELS = {"all", "mentions", "muted"}


def serialize_message(message):
    return {
        "id": message.id,
        "content": message.content,
        "created_at": message.created_at.isoformat() + "Z",
        "user": {
            "id": message.user.id,
            "username": message.user.username,
            "profile_photo": message.user.profile_photo,
        },
    }


def serialize_group(group, membership=None):
    latest_message = (
        SpotGroupMessage.query
        .filter_by(group_id=group.id)
        .order_by(
            SpotGroupMessage.created_at.desc(),
            SpotGroupMessage.id.desc(),
        )
        .first()
    )

    return {
        "id": group.id,
        "location_id": group.location_id,
        "name": group.location.name if group.location else group.name,
        "city": (
            group.location.city
            if group.location and group.location.city
            else group.city
        ),
        "description": group.description,
        "member_count": SpotGroupMember.query.filter_by(
            group_id=group.id,
        ).count(),
        "is_joined": membership is not None,
        "notification_level": (
            membership.notification_level if membership else None
        ),
        "latest_message": (
            serialize_message(latest_message) if latest_message else None
        ),
    }


def get_membership(group_id, user_id):
    return SpotGroupMember.query.filter_by(
        group_id=group_id,
        user_id=user_id,
    ).first()


def register_routes(app):
    @app.route("/spot-groups", methods=["GET"])
    @premium_required
    def list_spot_groups(user):
        groups = (
            SpotGroup.query
            .join(FishingLocation)
            .filter(FishingLocation.status == "active")
            .order_by(FishingLocation.name.asc())
            .all()
        )
        memberships = {
            membership.group_id: membership
            for membership in SpotGroupMember.query.filter_by(
                user_id=user.id,
            ).all()
        }

        return jsonify([
            serialize_group(group, memberships.get(group.id))
            for group in groups
        ]), 200

    @app.route("/spot-groups/requests", methods=["POST"])
    @premium_required
    def request_spot_group(user):
        data = request.get_json(silent=True)

        if not isinstance(data, dict):
            return jsonify({"error": "Invalid location request"}), 400

        try:
            location = find_or_create_location(
                data.get("name"),
                user=user,
                city=data.get("city"),
                country=data.get("country"),
            )
        except ValueError as error:
            return jsonify({"error": str(error)}), 400

        if not location:
            return jsonify({"error": "Location name is required"}), 400

        if location.status == "candidate":
            location.status = "pending"

        db.session.commit()
        status_code = 200 if location.status == "active" else 202
        return jsonify(serialize_location(location)), status_code

    @app.route("/admin/spot-locations", methods=["GET"])
    @admin_required
    def list_pending_locations(user):
        status = request.args.get("status", "pending")

        if status not in {"candidate", "pending", "active", "rejected", "archived"}:
            return jsonify({"error": "Invalid location status"}), 400

        locations = (
            FishingLocation.query
            .filter_by(status=status)
            .order_by(FishingLocation.created_at.asc())
            .all()
        )
        return jsonify([
            serialize_location(location)
            for location in locations
        ]), 200

    @app.route("/admin/spot-locations/pending-count", methods=["GET"])
    @admin_required
    def pending_location_count(user):
        count = FishingLocation.query.filter_by(status="pending").count()
        return jsonify({"count": count}), 200

    @app.route("/admin/spot-locations/<int:location_id>", methods=["PATCH"])
    @admin_required
    def review_spot_location(user, location_id):
        location = db.session.get(FishingLocation, location_id)

        if not location:
            return jsonify({"error": "Location not found"}), 404

        data = request.get_json(silent=True)
        status = data.get("status") if isinstance(data, dict) else None

        if status not in {"active", "rejected", "archived"}:
            return jsonify({
                "error": "Status must be active, rejected, or archived",
            }), 400

        if status == "active":
            activate_location(location)
        else:
            location.status = status

        db.session.commit()
        return jsonify(serialize_location(location)), 200

    @app.route("/spot-groups/<int:group_id>", methods=["GET"])
    @premium_required
    def get_spot_group(user, group_id):
        group = db.session.get(SpotGroup, group_id)

        if not group:
            return jsonify({"error": "Spot group not found"}), 404

        membership = get_membership(group_id, user.id)
        return jsonify(serialize_group(group, membership)), 200

    @app.route("/spot-groups/<int:group_id>/membership", methods=["POST"])
    @premium_required
    def join_spot_group(user, group_id):
        group = db.session.get(SpotGroup, group_id)

        if not group:
            return jsonify({"error": "Spot group not found"}), 404

        membership = get_membership(group_id, user.id)

        if not membership:
            membership = SpotGroupMember(
                group_id=group_id,
                user_id=user.id,
            )
            db.session.add(membership)
            db.session.commit()

        return jsonify(serialize_group(group, membership)), 200

    @app.route("/spot-groups/<int:group_id>/membership", methods=["PATCH"])
    @premium_required
    def update_spot_group_membership(user, group_id):
        membership = get_membership(group_id, user.id)

        if not membership:
            return jsonify({"error": "Join this group first"}), 403

        data = request.get_json(silent=True)
        notification_level = (
            data.get("notification_level") if isinstance(data, dict) else None
        )

        if notification_level not in NOTIFICATION_LEVELS:
            return jsonify({
                "error": "Notification level must be all, mentions, or muted",
            }), 400

        membership.notification_level = notification_level
        db.session.commit()

        return jsonify({
            "notification_level": membership.notification_level,
        }), 200

    @app.route("/spot-groups/<int:group_id>/membership", methods=["DELETE"])
    @premium_required
    def leave_spot_group(user, group_id):
        membership = get_membership(group_id, user.id)

        if not membership:
            return jsonify({"success": True}), 200

        db.session.delete(membership)
        db.session.commit()

        return jsonify({"success": True}), 200

    @app.route("/spot-groups/<int:group_id>/messages", methods=["GET"])
    @premium_required
    def list_spot_group_messages(user, group_id):
        if not get_membership(group_id, user.id):
            return jsonify({"error": "Join this group to view messages"}), 403

        messages = (
            SpotGroupMessage.query
            .filter_by(group_id=group_id)
            .order_by(
                SpotGroupMessage.created_at.desc(),
                SpotGroupMessage.id.desc(),
            )
            .limit(100)
            .all()
        )

        return jsonify([
            serialize_message(message)
            for message in reversed(messages)
        ]), 200

    @app.route("/spot-groups/<int:group_id>/messages", methods=["POST"])
    @premium_required
    def create_spot_group_message(user, group_id):
        if not get_membership(group_id, user.id):
            return jsonify({"error": "Join this group to post messages"}), 403

        data = request.get_json(silent=True)
        content = data.get("content") if isinstance(data, dict) else None

        if not isinstance(content, str) or not content.strip():
            return jsonify({"error": "Message cannot be empty"}), 400

        content = content.strip()

        if len(content) > 1000:
            return jsonify({"error": "Message cannot exceed 1000 characters"}), 400

        message = SpotGroupMessage(
            group_id=group_id,
            user_id=user.id,
            content=content,
        )
        db.session.add(message)
        db.session.flush()

        memberships = SpotGroupMember.query.filter(
            SpotGroupMember.group_id == group_id,
            SpotGroupMember.user_id != user.id,
        ).all()
        lowercase_content = content.lower()

        for membership in memberships:
            should_notify = membership.notification_level == "all"

            if membership.notification_level == "mentions":
                mention = f"@{membership.user.username.lower()}"
                should_notify = mention in lowercase_content

            if should_notify:
                db.session.add(Notification(
                    recipient_id=membership.user_id,
                    actor_id=user.id,
                    spot_group_id=group_id,
                    type="spot_group_message",
                ))

        db.session.commit()

        return jsonify(serialize_message(message)), 201
