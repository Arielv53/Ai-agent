from flask import request, jsonify, current_app
from ..extensions import db, jwt
from ..models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
from datetime import datetime, timezone

REVOKED_TOKENS = set()  # In-memory store for revoked tokens (use Redis or DB in production)

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

        # Create new user
        user = User(username=username)
        db.session.add(user)
        db.session.commit()

        # build JWT identity with user info (like login route)
        identity = {"id": user.id, "username": user.username}
        access_token = create_access_token(identity=identity)

        return jsonify({
            "access_token": access_token,
            "user": user.to_dict()
        }), 201

    @app.route("/login", methods=["POST"])
    def login():
        data = request.get_json()

        if not data or "username" not in data:
            return jsonify({"error": "Username is required"}), 400

        username = data["username"].strip()

        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # build token identity with user info (can include more fields as needed)
        identity = {"id": user.id, "username": user.username}
        access_token = create_access_token(identity=identity)

        return jsonify({"access_token": access_token, "user": user.to_dict()}), 200

    @app.route("/logout", methods=["DELETE"])
    @jwt_required()
    def logout():
        # Add current token's jti to revocation store
        jti = get_jwt()["jti"]
        REVOKED_TOKENS.add(jti)
        return jsonify({"message": "Logged out"}), 200

    # Register token-in-blocklist callback
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload.get("jti")
        return jti in REVOKED_TOKENS

    # Optionally handle revoked token responses
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({"msg": "Token has been revoked"}), 401

    # Optional: expired token handler, invalid token, etc. (recommended)
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"msg": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(err_str):
        return jsonify({"msg": "Invalid token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(err_str):
        return jsonify({"msg": "Missing Authorization Header"}), 401
