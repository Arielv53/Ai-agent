from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Catch(db.Model):
    __tablename__ = 'catches'

    id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String, nullable=False)  # URL to cloud-stored image
    species = db.Column(db.String)
    date_caught = db.Column(db.DateTime, default=datetime.utcnow)
    location_description = db.Column(db.String)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    weather = db.Column(db.String)
    tide = db.Column(db.String)
    bait_used = db.Column(db.String)
    gear = db.Column(db.String)
    notes = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "image_url": self.image_url,
            "species": self.species,
            "date_caught": self.date_caught.isoformat(),
            "location_description": self.location_description,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "weather": self.weather,
            "tide": self.tide,
            "bait_used": self.bait_used,
            "gear": self.gear,
            "notes": self.notes
        }