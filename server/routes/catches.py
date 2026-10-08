import math
import cloudinary.uploader
from datetime import datetime
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from ..extensions import db
from ..models import Catch, User, Follower, Notification

def parse_notes(value):
    if value is not None and not isinstance(value, str):
        raise ValueError("Notes must be text")
    if value and len(value) > 5000:
        raise ValueError("Notes must be 5000 characters or fewer")
    return value.strip() or None if value else None


def register_routes(app):
    # Public catches feed
    @app.route("/feed", methods=["GET"])
    @jwt_required(optional=True)  # Allow both authenticated and unauthenticated access
    def get_public_catches():

        from ..feed import page_args, feed_page
        try:
            limit, cursor = page_args(request.args)
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        identity = get_jwt_identity()
        page = feed_page(int(identity) if identity else None, limit, cursor)
        # Preserve the legacy shape while keeping every response bounded.
        return jsonify(page if "limit" in request.args or "cursor" in request.args else page["items"])

    # 📅 Get all catches
    @app.route("/catches", methods=["GET"])
    def get_catches():
        catches = Catch.query.all()
        return jsonify([c.to_dict() for c in catches]), 200

    # 📅 Get catches by date
    @app.route("/catches/<date>", methods=["GET"])
    def get_catches_by_date(date):
        """Get all catches for a specific date (YYYY-MM-DD)."""

        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

        catches = Catch.query.filter(db.func.date(Catch.timestamp) == date_obj).all()
        return jsonify([catch.to_dict() for catch in catches])

    # 📅 Get catches by exact date string
    @app.route("/catches/date/<string:date_string>", methods=["GET"])
    def catches_by_date(date_string):
        try:
            # Parse just the date (no time)
            date_obj = datetime.strptime(date_string, "%Y-%m-%d").date()
        except ValueError:
            return {"error": "Invalid date format. Use YYYY-MM-DD"}, 400

        # Get all catches for that calendar day
        catches = Catch.query.filter(db.func.date(Catch.date_caught) == date_obj).all()

        if not catches:
            return [], 200  # Return empty list if none (not 404)

        return [c.to_dict() for c in catches], 200

    # 📅 Get, Patch, Delete catch by ID
    @app.route("/catches/<int:id>", methods=["GET", "PATCH", "DELETE"])
    def catch_by_id(id):
        catch = Catch.query.filter(Catch.id == id).first()

        if not catch:
            return {"error": "catch not found"}, 404

        if request.method == "GET":
            verify_jwt_in_request(optional=True)
            return catch.to_dict(include_notes=str(catch.user_id) == get_jwt_identity()), 200

        verify_jwt_in_request()
        if catch.user_id != int(get_jwt_identity()):
            return {"error": "You can only change your own catches"}, 403

        if request.method == "DELETE":
            Notification.query.filter_by(catch_id=id).delete()
            db.session.delete(catch)
            db.session.commit()
            return "", 204

        data = request.form if request.mimetype == "multipart/form-data" else request.get_json(silent=True)
        if data is None or not hasattr(data, "items"):
            return {"error": "Invalid catch data"}, 400
        changes = {}
        if "notes" in data:
            try:
                changes["notes"] = parse_notes(data["notes"])
            except ValueError as error:
                return {"error": str(error)}, 400
        for field in ("species", "caption", "location", "bait_used", "method", "moon_phase", "tide"):
            if field in data:
                value = data[field]
                if value is not None and not isinstance(value, str):
                    return {"error": f"Invalid {field}"}, 400
                changes[field] = value.strip() or None if value else None
        if changes.get("caption") and len(changes["caption"]) > 500:
            return {"error": "Caption must be 500 characters or fewer"}, 400
        for field in ("length", "weight", "wind_speed", "water_temp", "air_temp"):
            if field in data:
                try:
                    value = None if data[field] in (None, "") else float(data[field])
                    if value is not None and (not math.isfinite(value) or
                            (field in ("length", "weight", "wind_speed") and value < 0)):
                        raise ValueError()
                    changes[field] = value
                except (ValueError, TypeError):
                    return {"error": f"Invalid {field}"}, 400
        if "date_caught" in data:
            try:
                changes["date_caught"] = datetime.fromisoformat(data["date_caught"].replace("Z", "+00:00"))
            except (ValueError, TypeError, AttributeError):
                return {"error": "Invalid catch date"}, 400
        if "is_public" in data:
            value = data["is_public"]
            if value not in (True, False, "true", "false"):
                return {"error": "Invalid visibility"}, 400
            changes["is_public"] = value is True or value == "true"
        if "file" in request.files:
            try:
                uploaded = cloudinary.uploader.upload(request.files["file"])
                changes["image_url"] = uploaded["secure_url"]
            except Exception:
                return {"error": "Unable to upload photo"}, 502
        for field, value in changes.items():
            setattr(catch, field, value)
        db.session.commit()
        return catch.to_dict(include_notes=True), 200

    @app.route("/catches", methods=["POST"])
    @jwt_required()
    def add_catch():
        data = request.get_json()

        # ✅ Get authenticated user ID from JWT
        identity = get_jwt_identity()
        user_id = int(identity) if identity else None

        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not data or "image_url" not in data:
            return jsonify({"error": "Missing image_url in request body"}), 400

        # Parse user-supplied date (if provided)
        date_caught = None
        if "date_caught" in data and data["date_caught"]:
            try:
                date_caught = datetime.fromisoformat(data["date_caught"])
            except ValueError:
                return jsonify({
                    "error": "Invalid date format. Use ISO format"
                }), 400

        try:
            notes = parse_notes(data.get("notes"))
        except ValueError as error:
            return {"error": str(error)}, 400

        new_catch = Catch(
            notes=notes,
            image_url=data["image_url"],
            species=data.get("species"),
            caption=data.get("caption"),
            water_temp=data.get("water_temp"),
            air_temp=data.get("air_temp"),
            moon_phase=data.get("moon_phase"),
            tide=data.get("tide"),
            length=data.get("length"),
            weight=data.get("weight"),
            wind_speed=data.get("wind_speed"),
            method=data.get("method"),
            bait_used=data.get("bait_used"),
            date_caught=date_caught or datetime.utcnow(),
            location=data.get("location"),
            is_public=data.get("is_public", False),
            user_id=user_id,  # ✅ Now from token, not client
        )

        db.session.add(new_catch)

        db.session.commit()

        return jsonify({
            "catch": new_catch.to_dict(include_notes=True),
        }), 201
 

    # 📤 Upload catch with image file
    @app.route("/catches/upload", methods=["POST"])
    @jwt_required()
    def upload_catch():
        user_id = int(get_jwt_identity())
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({"error": f"User {user_id} not found"}), 404
        
        try:
            notes = parse_notes(request.form.get("notes"))
        except ValueError as error:
            return {"error": str(error)}, 400

        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files["file"]
        
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        try:
            upload_result = cloudinary.uploader.upload(file)
        except Exception as e:
            return jsonify(
                {"error": "Failed to upload to Cloudinary", "details": str(e)}
            ), 500

        image_url = upload_result.get("secure_url")
        if not image_url:
            return jsonify({"error": "Failed to get image URL from Cloudinary"}), 500

        # Parse user-supplied date (if provided)
        date_caught = None
        date_str = request.form.get("date_caught")
        if date_str:
            try:
                if date_str.endswith("Z"):
                    date_str = date_str[:-1]  # remove trailing Z
                date_caught = datetime.fromisoformat(date_str)
            except ValueError as e:
                return jsonify({"error": "Invalid date format", "details": str(e)}), 400

        try:
            new_catch = Catch(
                notes=notes,
                image_url=image_url,
                species=request.form.get("species"),
                caption=(request.form.get("caption") or "").strip() or None,
                water_temp=request.form.get("water_temp", type=float),
                air_temp=request.form.get("air_temp", type=float),
                moon_phase=request.form.get("moon_phase"),
                tide=request.form.get("tide"),
                length=request.form.get("length", type=float),
                weight=request.form.get("weight", type=float),
                wind_speed=request.form.get("wind_speed", type=float),
                method=request.form.get("method"),
                bait_used=request.form.get("bait_used"),
                date_caught=date_caught or datetime.utcnow(),
                location=request.form.get("location"),
                is_public=request.form.get("is_public", "false").lower() == "true",
                user_id=user_id,
            )
            db.session.add(new_catch)
            db.session.commit()

            return jsonify(new_catch.to_dict(include_notes=True)), 201
        
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Database insert failed", "details": str(e)}), 500