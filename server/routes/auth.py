from flask import request, jsonify
from ..extensions import db
from ..models import User


def register_routes(app):
    @app.route("/signup", methods=["POST"])
    def signup():
        data = request.get_json()

        if not data or "username" not in data:
            return jsonify({"error": "Username is required"}), 400

        username = data["username"].strip()

        if not username:
            return jsonify({"error": "Username cannot be empty"}), 400

        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"error": "Username already taken"}), 409

        user = User(username=username)
        db.session.add(user)
        db.session.commit()

        return jsonify(user.to_dict()), 201

    @app.route("/login", methods=["POST"])
    def login():
        data = request.get_json()

        if not data or "username" not in data:
            return jsonify({"error": "Username is required"}), 400

        username = data["username"].strip()

        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify(user.to_dict()), 200

    @app.route("/logout", methods=["DELETE"])
    def logout():
        # Placeholder for future session/JWT invalidation
        return jsonify({"message": "Logged out"}), 200
