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
    water_temp = db.Column(db.Float)
    air_temp = db.Column(db.Float)
    moon_phase = db.Column(db.String)
    tide = db.Column(db.String)
    length = db.Column(db.Float)      
    weight = db.Column(db.Float)      
    wind_speed = db.Column(db.Float)  
    method = db.Column(db.String)
    bait_used = db.Column(db.String) 

    def to_dict(self):
        return {
            "id": self.id,
            "image_url": self.image_url,
            "species": self.species,
            "date_caught": self.date_caught.isoformat(),
            "water_temp": self.water_temp,
            "air_temp": self.air_temp,
            "moon_phase": self.moon_phase,
            "tide": self.tide,
            "length": self.length,         
            "weight": self.weight,         
            "wind_speed": self.wind_speed, 
            "method": self.method,
            "bait_used": self.bait_used
        }