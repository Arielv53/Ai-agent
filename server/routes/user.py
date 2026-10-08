from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from ..models import User, Catch, Follower
from ..extensions import db
from ..user_fields import parse_user_details
import cloudinary.uploader
from urllib.parse import urlparse

def register_routes(app):
    # 👤 Get user profile
    @app.route("/users/<int:user_id>/profile", methods=["GET"])
    @jwt_required(optional=True)
    def get_user_profile(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        viewer_id = request.args.get("viewer_id", type=int)

        is_following = False
        if viewer_id:
            is_following = Follower.query.filter_by(
                follower_id=viewer_id,
                following_id=user_id
            ).first() is not None

        catch_count = Catch.query.filter_by(user_id=user.id).count() # number of posts
        followers_count = Follower.query.filter_by(following_id=user.id).count() # number of followers
        following_count = Follower.query.filter_by(follower_id=user.id).count() # number of following

        return jsonify({
            **user.to_dict(include_details=str(user.id) == get_jwt_identity()),
            "is_following": is_following,
            "username": user.username,
            "profile_photo": user.profile_photo,
            "cover_photo": user.cover_photo,
            "catch_count": catch_count,
            "followers_count": followers_count,
            "following_count": following_count,
        }), 200
    
    # ✏️ Update user profile
    @app.route("/users/<int:user_id>", methods=["PATCH"])
    @jwt_required()
    def update_user(user_id):
        authenticated_user_id = int(get_jwt_identity())
        if user_id != authenticated_user_id:
            return jsonify({"error": "You can only update your own profile"}), 403
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        data = request.form.to_dict() if request.mimetype == "multipart/form-data" else request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"error": "Invalid profile data"}), 400
        try:
            details = parse_user_details(data)
        except ValueError as error:
            return jsonify({"error": str(error)}), 400
        if "username" in data:
            username = data["username"]
            if not isinstance(username, str) or not username.strip():
                return jsonify({"error": "Username is required"}), 400
            username = username.strip()
            if User.query.filter(User.username == username, User.id != user_id).first():
                return jsonify({"error": "Username already taken"}), 409
            details["username"] = username
        for field in ("profile_photo", "cover_photo"):
            if field in data:
                if data[field] is not None and not isinstance(data[field], str):
                    return jsonify({"error": f"Invalid {field}"}), 400
                if data[field]:
                    url = urlparse(data[field])
                    if url.scheme not in ("https", "http") or not url.netloc:
                        return jsonify({"error": "Photos must be uploaded, not saved as device file paths"}), 400
                details[field] = data[field]
        photos = {}
        for field in ("profile_photo", "cover_photo"):
            if field in request.files:
                photo = request.files[field]
                if not photo.filename or not (photo.mimetype or "").startswith("image/"):
                    return jsonify({"error": "Please select an image file"}), 400
                photos[field] = photo
        uploaded_ids = []
        try:
            for field, photo in photos.items():
                uploaded = cloudinary.uploader.upload(photo, resource_type="image", folder=f"bitebook/users/{user_id}")
                if uploaded.get("public_id"):
                    uploaded_ids.append(uploaded["public_id"])
                url = uploaded.get("secure_url", "")
                if not url.startswith("https://"):
                    raise ValueError("Missing secure image URL")
                details[field] = url
            for field, value in details.items():
                setattr(user, field, value)
            db.session.commit()
        except Exception:
            db.session.rollback()
            for public_id in uploaded_ids:
                try:
                    cloudinary.uploader.destroy(public_id, resource_type="image")
                except Exception:
                    pass
            return jsonify({"error": "Unable to save profile. Your previous photos are unchanged; please retry."}), 502
        return jsonify(user.to_dict(include_details=True)), 200

    # 🎣 Get user's catches
    @app.route("/users/<int:user_id>/catches", methods=["GET"])
    def get_user_catches(user_id):
        catches = Catch.query.filter_by(user_id=user_id).order_by(
            Catch.date_caught.desc()
        ).all()
        return jsonify([c.to_dict() for c in catches])
    
    # 🐟 Get distinct species caught by user
    @app.route("/user/species", methods=["POST"])
    def get_user_species():
        data = request.get_json()
        user_id = data.get("user_id")

        species = (
            db.session.query(Catch.species)
            .filter_by(user_id=user_id)
            .distinct()
            .all()
        )

        species_list = [s[0] for s in species if s[0]]

        return jsonify({"species": species_list})
