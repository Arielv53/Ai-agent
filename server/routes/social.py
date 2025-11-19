from flask import request, jsonify

from ..extensions import db
from ..models import Like, Comment


def register_routes(app):
    # ❤️ Like a catch
    @app.route("/catches/<int:catch_id>/like", methods=["POST"])
    def like_catch(catch_id):
        data = request.get_json()
        user_id = data.get("user_id")

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        existing_like = Like.query.filter_by(user_id=user_id, catch_id=catch_id).first()
        if existing_like:
            return jsonify({"message": "Already liked"}), 200

        like = Like(user_id=user_id, catch_id=catch_id)
        db.session.add(like)
        db.session.commit()

        return jsonify({"message": "Catch liked successfully"}), 201

    # 💔 Unlike a catch
    @app.route("/catches/<int:catch_id>/unlike", methods=["DELETE"])
    def unlike_catch(catch_id):
        data = request.get_json()
        user_id = data.get("user_id")

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        like = Like.query.filter_by(user_id=user_id, catch_id=catch_id).first()
        if not like:
            return jsonify({"error": "Like not found"}), 404

        db.session.delete(like)
        db.session.commit()

        return jsonify({"message": "Catch unliked successfully"}), 200

    # 💬 Post a comment
    @app.route("/catches/<int:catch_id>/comments", methods=["POST"])
    def post_comment(catch_id):
        data = request.get_json()
        user_id = data.get("user_id")
        content = data.get("content")

        if not user_id or not content:
            return jsonify({"error": "user_id and content are required"}), 400

        comment = Comment(user_id=user_id, catch_id=catch_id, content=content)
        db.session.add(comment)
        db.session.commit()

        return jsonify(comment.to_dict()), 201

    # 🧾 Get comments for a catch
    @app.route("/catches/<int:catch_id>/comments", methods=["GET"])
    def get_comments(catch_id):
        comments = (
            Comment.query.filter_by(catch_id=catch_id)
            .order_by(Comment.timestamp.desc())
            .all()
        )
        return jsonify([c.to_dict() for c in comments]), 200