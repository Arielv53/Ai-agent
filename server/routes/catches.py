from flask import Blueprint, request, jsonify
from models import Catch
from extensions import db

catches_bp = Blueprint('catches', __name__)

@catches_bp.route('/', methods=['GET'])
def get_catches():
    catches = Catch.query.all()
    return jsonify([{
        "id": c.id,
        "species": c.species,
        "location": c.location,
        "date_caught": c.date_caught.isoformat() if c.date_caught else None
    } for c in catches])

@catches_bp.route('/', methods=['POST'])
def add_catch():
    data = request.get_json()
    catch = Catch(**data)
    db.session.add(catch)
    db.session.commit()
    return jsonify({"id": catch.id}), 201
