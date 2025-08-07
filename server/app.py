import os
from dotenv import load_dotenv
import requests
import cloudinary
import cloudinary.uploader
from datetime import datetime
from .models import db, Catch 
from flask import Flask, request, jsonify
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.utils import secure_filename
from .agent import agent_executor

load_dotenv()

# Initialization and Configuration
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URI", "sqlite:///fishing.db")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "super-secret-key")

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

# Initialize Extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)
api = Api(app)


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    query = data.get("message", "")
    
    if not query:
        return jsonify({"reply": "⚠️ No input received."}), 400

    try:
        response = agent_executor.invoke({"query": query})
        return jsonify({"reply": response["output"]})
    except Exception as e:
        return jsonify({"reply": f"❌ Agent error: {str(e)}"}), 500
    



@app.route('/catches', methods=['GET'])
def get_catches():
    catches = Catch.query.all()
    return jsonify([c.to_dict() for c in catches]), 200

@app.route('/catches', methods=['POST'])
def add_catch():
    data = request.get_json()
    if not data or 'image_url' not in data:
        return jsonify({'error': 'Missing image_url in request body'}), 400
        
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
    return jsonify(new_catch.to_dict()), 201

@app.route('/catches/upload', methods=['POST'])
def upload_catch():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        upload_result = cloudinary.uploader.upload(file)
    except Exception as e:
        return jsonify({'error': 'Failed to upload to Cloudinary', 'details': str(e)}), 500

    image_url = upload_result.get('secure_url')
    if not image_url:
        return jsonify({'error': 'Failed to get image URL from Cloudinary'}), 500

    new_catch = Catch(
        image_url=image_url,
        species=request.form.get('species'),
        location_description=request.form.get('location_description'),
        latitude=request.form.get('latitude', type=float),
        longitude=request.form.get('longitude', type=float),
        weather=request.form.get('weather'),
        tide=request.form.get('tide'),
        bait_used=request.form.get('bait_used'),
        gear=request.form.get('gear'),
        notes=request.form.get('notes')
    )
    db.session.add(new_catch)
    db.session.commit()
    return jsonify(new_catch.to_dict()), 201

@app.route('/weather', methods=['GET'])
def fetch_weather():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    date = request.args.get("date")
    if not all([lat, lon, date]):
        return jsonify({"error": "Missing required query parameters: lat, lon, date (YYYY-MM-DD)"}), 400
        
    weather_data = get_weather_by_location_and_date(lat, lon, date)
    if "error" in weather_data:
        return jsonify(weather_data), 500
        
    return jsonify(weather_data), 200


if __name__ == '__main__':
    app.run(debug=True)