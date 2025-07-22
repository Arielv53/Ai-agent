import cloudinary.uploader
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from ..models import Catch
from ..extensions import db

catches_bp = Blueprint('catches', __name__)

@catches_bp.route('/', methods=['GET'])
def get_catches():
    catches = Catch.query.all()
    return jsonify([c.to_dict() for c in catches]), 200

@catches_bp.route('/', methods=['POST'])
def add_catch():
    data = request.get_json()
    new_catch = Catch(
        image_url=data['image_url'],
        species=data.get('species'),
        location_description=data.get('location_description'),
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        weather=data.get('weather'),
        tide=data.get('tide'),
        bait_used=data.get('bait_used'),
        gear=data.get('gear'),
        notes=data.get('notes'),
    )
    db.session.add(new_catch)
    db.session.commit()
    return new_catch.to_dict(), 201


@catches_bp.route('/upload', methods=['POST'])
def upload_catch():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Optional: Secure the filename
    filename = secure_filename(file.filename)

    # Upload to Cloudinary
    result = cloudinary.uploader.upload(file)

    # Get the image URL
    image_url = result.get('secure_url')

    # Use JSON form data for other fields
    species = request.form.get('species')
    location_description = request.form.get('location_description')
    latitude = request.form.get('latitude', type=float)
    longitude = request.form.get('longitude', type=float)
    weather = request.form.get('weather')
    tide = request.form.get('tide')
    bait_used = request.form.get('bait_used')
    gear = request.form.get('gear')
    notes = request.form.get('notes')

    # Create and store the catch
    new_catch = Catch(
        image_url=image_url,
        species=species,
        location_description=location_description,
        latitude=latitude,
        longitude=longitude,
        weather=weather,
        tide=tide,
        bait_used=bait_used,
        gear=gear,
        notes=notes
    )

    db.session.add(new_catch)
    db.session.commit()

    return jsonify(new_catch.to_dict()), 201
