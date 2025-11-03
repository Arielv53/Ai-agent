import os
from dotenv import load_dotenv
import requests
import cloudinary
import cloudinary.uploader
from datetime import datetime, timedelta
from .models import db, Catch
from sqlalchemy import func
from flask import Flask, request, jsonify
from flask_restful import Api
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.utils import secure_filename
from .agent import agent_executor
from .utils import get_weather_by_location_and_date

load_dotenv()

# Initialization and Configuration
app = Flask(__name__, instance_path=os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance'))
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URI", "sqlite:///instance/fishing.db")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "super-secret-key")

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

# Initialize Extensions
db.init_app(app)
migrate = Migrate(app, db, directory='server/migrations')
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
    

@app.route("/public-catches", methods=["GET"])
def get_public_catches():
    catches = Catch.query.filter_by(is_public=True).order_by(Catch.date_caught.desc()).all()
    return jsonify([
        {
            "id": c.id,
            "image_url": c.image_url,
            "species": c.species,
            "location": c.location,
            "date_caught": c.date_caught.isoformat() if c.date_caught else None,
            "is_public": c.is_public,
            "user_id": c.user_id
        }
        for c in catches
    ])



@app.route('/catches', methods=['GET'])
def get_catches():
    catches = Catch.query.all()
    return jsonify([c.to_dict() for c in catches]), 200


@app.route('/catches/<date>', methods=['GET'])
def get_catches_by_date(date):
    """
    Get all catches for a specific date (YYYY-MM-DD).
    """
    try:
        date_obj = datetime.strptime(date, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    catches = Catch.query.filter(db.func.date(Catch.timestamp) == date_obj).all()
    return jsonify([catch.to_dict() for catch in catches])


@app.route('/catches/date/<string:date_string>', methods=['GET'])
def catches_by_date(date_string):
    try:
        # Parse just the date (no time)
        date_obj = datetime.strptime(date_string, '%Y-%m-%d').date()
    except ValueError:
        return {'error': 'Invalid date format. Use YYYY-MM-DD'}, 400

    # Get all catches for that calendar day
    catches = Catch.query.filter(
        db.func.date(Catch.date_caught) == date_obj
    ).all()

    if not catches:
        return [], 200  # Return empty list if none (not 404)

    return [c.to_dict() for c in catches], 200



@app.route('/catches/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
def catch_by_id(id):
    catch = Catch.query.filter(Catch.id == id).first()

    if not catch:
        return {'error': 'catch not found'}, 404
    
    if request.method == 'GET':
        return catch.to_dict(), 200
    
    # patch method to be added later

    elif request.method == 'DELETE':
        db.session.delete(catch)
        db.session.commit()

@app.route('/catches', methods=['POST'])
def add_catch():
    data = request.get_json()
    user_id = request.form.get('user_id')  # Assuming user_id is sent in the form data
    if not data or 'image_url' not in data:
        return jsonify({'error': 'Missing image_url in request body'}), 400
    
    # Parse user-supplied date (if provided)
    date_caught = None
    if 'date_caught' in data and data['date_caught']:
        try:
            date_caught = datetime.fromisoformat(data['date_caught'])
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)'}), 400

        
    new_catch = Catch(
        image_url=data['image_url'],
        species=data.get('species'),
        water_temp=data.get('water_temp'),
        air_temp=data.get('air_temp'),
        moon_phase=data.get('moon_phase'),
        tide=data.get('tide'),
        length=data.get('length'),          
        weight=data.get('weight'),          
        wind_speed=data.get('wind_speed'),  
        method=data.get('method'),
        bait_used=data.get('bait_used'),
        date_caught=date_caught or datetime.utcnow(),  # fallback to current date if none provided
        location=data.get('location'),
        is_public=data.get('is_public', False),
        user_id=user_id
    )
    db.session.add(new_catch)
    db.session.commit()
    return jsonify(new_catch.to_dict()), 201

@app.route('/catches/upload', methods=['POST'])
def upload_catch():
    print("📩 FORM DATA:", request.form)
    print("📎 FILES:", request.files)
    user_id = request.form.get('user_id')

    if 'file' not in request.files:
        print("❌ No file part in request.files")
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        print("❌ File selected but filename is empty")
        return jsonify({'error': 'No selected file'}), 400

    try:
        print("☁️ Uploading file to Cloudinary...")
        upload_result = cloudinary.uploader.upload(file)
        print("✅ Cloudinary upload result:", upload_result)
    except Exception as e:
        print("💥 Cloudinary upload failed:", str(e))
        return jsonify({'error': 'Failed to upload to Cloudinary', 'details': str(e)}), 500

    image_url = upload_result.get('secure_url')
    if not image_url:
        print("❌ No secure_url found in Cloudinary response")
        return jsonify({'error': 'Failed to get image URL from Cloudinary'}), 500
    
    # Parse user-supplied date (if provided)
    date_caught = None
    date_str = request.form.get('date_caught')
    if date_str:
        try:
            if date_str.endswith('Z'):
                date_str = date_str[:-1]  # remove trailing Z
            date_caught = datetime.fromisoformat(date_str)
        except ValueError as e:
            print("❌ Date parsing failed:", str(e))
            return jsonify({'error': 'Invalid date format', 'details': str(e)}), 400

    try:
        new_catch = Catch(
            image_url=image_url,
            species=request.form.get('species'),
            water_temp=request.form.get('water_temp', type=float),
            air_temp=request.form.get('air_temp', type=float),
            moon_phase=request.form.get('moon_phase'),
            tide=request.form.get('tide'),
            length=request.form.get('length', type=float),         
            weight=request.form.get('weight', type=float),         
            wind_speed=request.form.get('wind_speed', type=float), 
            method=request.form.get('method'),
            bait_used=request.form.get('bait_used'),
            date_caught=date_caught or datetime.utcnow(),
            location=request.form.get('location'),
            is_public=request.form.get('is_public', 'false').lower() == 'true',
            user_id=user_id
        )
        db.session.add(new_catch)
        db.session.commit()
        print("✅ Upload complete, image URL:", image_url)
        return jsonify(new_catch.to_dict()), 201
    except Exception as e:
        print("💥 Database insert failed:", str(e))
        db.session.rollback()
        return jsonify({'error': 'Database insert failed', 'details': str(e)}), 500

    


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
    app.run(host="0.0.0.0", port=5000, debug=True) # run server with "flask run --host=0.0.0.0"