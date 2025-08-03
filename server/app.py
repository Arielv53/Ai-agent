import os
from dotenv import load_dotenv
import requests
import cloudinary
import cloudinary.uploader
from datetime import datetime
from .models import db, Catch 
from flask import Flask, request, jsonify, session
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.utils import secure_filename

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

def get_weather_by_location_and_date(lat, lon, date_str):
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return {"error": "Invalid date format. Expected YYYY-MM-DD."}
    
    # ⚠️ Forecast window (based on current Open-Meteo limits)
    today = datetime.utcnow().date()
    max_forecast_date = today.replace(day=today.day + 15)  # or hardcode "2025-08-12"

    if not (today <= date_obj <= max_forecast_date):
        return {"error": f"Date must be between {today} and {max_forecast_date}"}

    url = "https://api.open-meteo.com/v1/forecast"  # ✅ Forecast API
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": date_str,
        "end_date": date_str,
        "hourly": "temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m",
        "timezone": "auto"
    }

    response = requests.get(url, params=params)
    print("📡 Weather URL:", response.url)  # Debug
    if response.status_code != 200:
        return {"error": "Failed to fetch weather", "details": response.json()}

    data = response.json()
    if not data.get("hourly"):
        return {"error": "No weather data found for this date."}

    try:
        hourly = data["hourly"]
        temp_avg = sum(hourly["temperature_2m"]) / len(hourly["temperature_2m"])
        humidity_avg = sum(hourly["relative_humidity_2m"]) / len(hourly["relative_humidity_2m"])
        wind_avg = sum(hourly["wind_speed_10m"]) / len(hourly["wind_speed_10m"])
    except (KeyError, ZeroDivisionError) as e:
        return {"error": "Incomplete weather data", "details": str(e)}

    fahrenheit_temp = (temp_avg * 9/5) + 32

    return {
        "temperature_avg": round(fahrenheit_temp, 1),
        "humidity_avg": round(humidity_avg, 1),
        "wind_speed_avg": round(wind_avg, 1),
        "sample_weather_code": hourly["weathercode"][0] if "weathercode" in hourly else None
    }



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