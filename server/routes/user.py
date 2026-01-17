from flask import request, jsonify
from ..models import User, Catch, Follower
from ..extensions import db
from .progression import posts_required_for_level

def register_routes(app):
    # 👤 Get user profile
    @app.route("/users/<int:user_id>/profile", methods=["GET"])
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
            "id": user.id,
            "is_following": is_following,
            "username": user.username,
            "profile_photo": user.profile_photo,
            "cover_photo": user.cover_photo,
            "level": user.level,
            "prestige": user.prestige,
            "posts_toward_next_level": user.posts_toward_next_level,
            "posts_required_for_next_level": posts_required_for_level(user.level),
            "catch_count": catch_count,
            "followers_count": followers_count,
            "following_count": following_count,
        }), 200

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
