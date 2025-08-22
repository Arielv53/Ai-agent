import os
from dotenv import load_dotenv
import requests
import cloudinary
import cloudinary.uploader
from datetime import datetime, timedelta
from .models import db, Catch, Tide 
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


@app.route("/tides", methods=["GET"])
def tides_for_station_date():
    """
    /tides?station_id=8518750&date=YYYY-MM-DD
    returns the hilo (high/low) records for that date
    """
    station = request.args.get("station_id")
    date_str = request.args.get("date")
    if not station:
        return jsonify({"error": "station_id required"}), 400
    if not date_str:
        date_obj = datetime.utcnow().date()
    else:
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error":"Invalid date YYYY-MM-DD"}), 400

    start = datetime.combine(date_obj, datetime.min.time())
    end = start + timedelta(days=1)
    rows = Tide.query.filter(
        Tide.station_id == station,
        Tide.datetime >= start,
        Tide.datetime < end
    ).order_by(Tide.datetime.asc()).all()

    return jsonify([{
        "datetime": t.datetime.isoformat(),
        "height": t.height,
        "type": t.tide_type
    } for t in rows])


@app.route("/tide_status", methods=["GET"])
def tide_status():
    """
    /tide_status?station_id=8518750
    returns whether it's currently 'high'/'low' or whether tide is 'rising'/'falling' between
    previous and next hilo events.
    """
    station = request.args.get("station_id")
    when_str = request.args.get("when")  # optional ISO timestamp
    if not station:
        return jsonify({"error":"station_id required"}), 400

    if when_str:
        try:
            when = datetime.fromisoformat(when_str)
        except Exception:
            return jsonify({"error":"Invalid when param, use ISO8601"}), 400
    else:
        when = datetime.utcnow()

    prev = Tide.query.filter(Tide.station_id==station, Tide.datetime <= when).order_by(Tide.datetime.desc()).first()
    nxt = Tide.query.filter(Tide.station_id==station, Tide.datetime > when).order_by(Tide.datetime.asc()).first()

    if not prev and not nxt:
        return jsonify({"error":"No tide data for station"}), 404

    # if immediately at an event
    if prev and abs((when - prev.datetime).total_seconds()) < 300:
        status = {"status": prev.tide_type == "H" and "high" or "low", "closest_event": prev.datetime.isoformat()}
        return jsonify(status)

    if prev and nxt:
        # rising if next height > prev height
        rising = nxt.height > prev.height
        status = {
            "previous": {"datetime": prev.datetime.isoformat(), "type": prev.tide_type, "height": prev.height},
            "next": {"datetime": nxt.datetime.isoformat(), "type": nxt.tide_type, "height": nxt.height},
            "currently": rising and "rising" or "falling"
        }
        return jsonify(status)

    # if only prev or only next exists
    if prev:
        return jsonify({"status": prev.tide_type == "H" and "past_high_or_low" or "past_low", "previous": prev.datetime.isoformat()})
    if nxt:
        return jsonify({"status":"upcoming", "next": nxt.datetime.isoformat()})
    


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


@app.route("/tides/<station_id>")
def get_tides(station_id):
    today = datetime.utcnow()
    week_from_now = today + timedelta(days=7)

    tides = Tide.query.filter(
        Tide.station_id == station_id,
        Tide.datetime >= today,
        Tide.datetime <= week_from_now
    ).order_by(Tide.datetime.asc()).all()

    return jsonify([t.to_dict() for t in tides])



if __name__ == '__main__':
    app.run(debug=True)