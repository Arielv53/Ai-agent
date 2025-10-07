from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, ForeignKey
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy_serializer import SerializerMixin
from flask_bcrypt import Bcrypt
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime

convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

db = SQLAlchemy(metadata=MetaData(naming_convention=convention))
bcrypt = Bcrypt()

class Catch(db.Model, SerializerMixin):
    __tablename__ = 'catches'

    id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String)  # URL to cloud-stored image
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