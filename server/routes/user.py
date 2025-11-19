from flask import request, jsonify

from ..models import User, Catch


def register_routes(app):
    # 👤 Get user profile
    @app.route("/users/<int:user_id>/profile", methods=["GET"])
    def get_user_profile(user_id):
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify(user.to_dict())

    # 🎣 Get user's catches
    @app.route("/users/<int:user_id>/catches", methods=["GET"])
    def get_user_catches(user_id):
        catches = Catch.query.filter_by(user_id=user_id).order_by(
            Catch.date_caught.desc()
        ).all()
        return jsonify([c.to_dict() for c in catches])