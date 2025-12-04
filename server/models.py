from sqlalchemy import ForeignKey
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from .extensions import db, bcrypt

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False)
    profile_photo = db.Column(db.String)
    cover_photo = db.Column(db.String)

    catches = db.relationship('Catch', back_populates='user')
    likes = db.relationship('Like', back_populates='user', cascade='all, delete-orphan')
    comments = db.relationship('Comment', back_populates='user', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "profile_photo": self.profile_photo,
            "cover_photo": self.cover_photo
        }
    

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
    location = db.Column(db.String)
    is_public = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    user = db.relationship('User', back_populates='catches')
    likes = db.relationship('Like', back_populates='catch', cascade='all, delete-orphan')
    comments = db.relationship('Comment', back_populates='catch', cascade='all, delete-orphan')

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
            "bait_used": self.bait_used,
            "location": self.location,
            "is_public": self.is_public,
            "likes_count": len(self.likes),
            "comments_count": len(self.comments)
        }
    
class Like(db.Model):
    __tablename__ = 'likes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    catch_id = db.Column(db.Integer, db.ForeignKey('catches.id'), nullable=False)

    user = db.relationship('User', back_populates='likes')
    catch = db.relationship('Catch', back_populates='likes')

    __table_args__ = (db.UniqueConstraint('user_id', 'catch_id', name='unique_user_catch_like'),)


class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    catch_id = db.Column(db.Integer, db.ForeignKey('catches.id'), nullable=False)

    user = db.relationship('User', back_populates='comments')
    catch = db.relationship('Catch', back_populates='comments')

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "user": self.user.to_dict(),
        }
    
class Follower(db.Model):
    __tablename__ = "followers"
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    following_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)


class MonthlyForecast(db.Model):
    __tablename__ = "monthly_forecasts"   # NEW

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)   # NEW
    month = db.Column(db.Integer, nullable=False)     # NEW (1–12)
    year = db.Column(db.Integer, nullable=False)      # NEW (2025)
    forecast_text = db.Column(db.Text, nullable=False) # NEW
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # NEW

    # NEW: Useful for returning JSON
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "month": self.month,
            "year": self.year,
            "forecast_text": self.forecast_text,
            "created_at": self.created_at.isoformat()
        }