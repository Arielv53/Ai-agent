from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from .extensions import db
from .models import User


def premium_required(view):
    @wraps(view)
    @jwt_required()
    def wrapped(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not user.is_premium:
            return jsonify({
                "code": "PREMIUM_REQUIRED",
                "error": "Spot Groups requires a Premium membership.",
            }), 403

        return view(user, *args, **kwargs)

    return wrapped


def admin_required(view):
    @wraps(view)
    @jwt_required()
    def wrapped(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not user.is_admin:
            return jsonify({
                "code": "ADMIN_REQUIRED",
                "error": "Administrator access is required.",
            }), 403

        return view(user, *args, **kwargs)

    return wrapped
