from sqlalchemy import ForeignKey
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from .extensions import db, bcrypt

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False)
    first_name = db.Column(db.String(100), nullable=True)
    last_name = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    profile_photo = db.Column(db.String)
    cover_photo = db.Column(db.String)
    is_premium = db.Column(db.Boolean, default=False, nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)

    catches = db.relationship('Catch', back_populates='user', cascade='all, delete-orphan')
    likes = db.relationship('Like', back_populates='user', cascade='all, delete-orphan')
    comments = db.relationship('Comment', back_populates='user', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', back_populates='recipient', foreign_keys="Notification.recipient_id", cascade='all, delete-orphan')
    spot_group_memberships = db.relationship('SpotGroupMember', back_populates='user', cascade='all, delete-orphan')
    spot_group_messages = db.relationship('SpotGroupMessage', back_populates='user', cascade='all, delete-orphan')
    created_locations = db.relationship('FishingLocation', back_populates='creator')
    
    def to_dict(self, include_details=False, include_entitlements=False):
        result = {
            "id": self.id,
            "username": self.username,
            "profile_photo": self.profile_photo,
            "cover_photo": self.cover_photo,
        }
        if include_details:
            result.update({field: getattr(self, field) for field in ("first_name", "last_name", "country", "city")})
        if include_entitlements:
            result["is_premium"] = self.is_premium
            result["is_admin"] = self.is_admin
        return result
    

class Catch(db.Model, SerializerMixin):
    __tablename__ = 'catches'

    id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String)  # URL to cloud-stored image
    species = db.Column(db.String)
    caption = db.Column(db.String(500))
    notes = db.Column(db.Text, nullable=True)
    date_caught = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=True)
    water_temp = db.Column(db.Float)
    air_temp = db.Column(db.Float)
    moon_phase = db.Column(db.String)
    tide = db.Column(db.String)
    length = db.Column(db.Float)      
    weight = db.Column(db.Float)      
    wind_speed = db.Column(db.Float)  
    method = db.Column(db.String)
    bait_used = db.Column(db.String) 
    lure_used = db.Column(db.String)
    location = db.Column(db.String)
    location_id = db.Column(
        db.Integer,
        db.ForeignKey("fishing_locations.id"),
        nullable=True,
    )
    is_public = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    __table_args__ = (db.Index("idx_catches_public_created_id", "is_public", "created_at", "id"),)

    user = db.relationship('User', back_populates='catches')
    likes = db.relationship('Like', back_populates='catch', cascade='all, delete-orphan')
    comments = db.relationship('Comment', back_populates='catch', cascade='all, delete-orphan')
    fishing_location = db.relationship("FishingLocation", back_populates="catches")

    def to_dict(self, include_notes=False):
        result = {
            "id": self.id,
            "owner_id": self.user_id,
            "image_url": self.image_url,
            "species": self.species,
            "caption": self.caption,
            "date_caught": self.date_caught.isoformat(),
            "created_at": self.created_at.isoformat() + "Z" if self.created_at else None,
            "water_temp": self.water_temp,
            "air_temp": self.air_temp,
            "moon_phase": self.moon_phase,
            "tide": self.tide,
            "length": self.length,         
            "weight": self.weight,         
            "wind_speed": self.wind_speed, 
            "method": self.method,
            "bait_used": self.bait_used,
            "lure_used": self.lure_used,
            "location": self.location,
            "is_public": self.is_public,
            "user_id": self.user_id,
            "user_name": self.user.username if self.user else None,
            "user_avatar": self.user.profile_photo if self.user else None,
            "likes_count": len(self.likes),
            "comments_count": len(self.comments)
        }
        if include_notes:
            result["notes"] = self.notes
        return result

class Like(db.Model):
    __tablename__ = 'likes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    catch_id = db.Column(db.Integer, db.ForeignKey('catches.id'), nullable=False)

    user = db.relationship('User', back_populates='likes')
    catch = db.relationship('Catch', back_populates='likes')

    __table_args__ = (
        db.UniqueConstraint('user_id', 'catch_id', name='unique_user_catch_like'),
        db.Index("idx_likes_catch_id", "catch_id"),
    )


class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    catch_id = db.Column(db.Integer, db.ForeignKey('catches.id'), nullable=False)

    __table_args__ = (db.Index("idx_comments_catch_date_id", "catch_id", "timestamp", "id"),)

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
    __table_args__ = (db.Index("idx_followers_pair", "follower_id", "following_id"),)
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    following_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)


class FishingLocation(db.Model):
    __tablename__ = "fishing_locations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    normalized_name = db.Column(db.String(120), nullable=False)
    city = db.Column(db.String(100), nullable=True)
    normalized_city = db.Column(db.String(100), nullable=False, default="")
    state_or_region = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="candidate")
    created_by_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True,
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    creator = db.relationship("User", back_populates="created_locations")
    catches = db.relationship("Catch", back_populates="fishing_location")
    spot_group = db.relationship(
        "SpotGroup",
        back_populates="location",
        uselist=False,
    )

    __table_args__ = (
        db.UniqueConstraint(
            "normalized_name",
            "normalized_city",
            name="unique_fishing_location_name_city",
        ),
        db.Index("idx_fishing_locations_status", "status"),
    )


class SpotGroup(db.Model):
    __tablename__ = "spot_groups"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, unique=True)
    city = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(300), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    location_id = db.Column(
        db.Integer,
        db.ForeignKey("fishing_locations.id"),
        nullable=True,
        unique=True,
    )

    location = db.relationship("FishingLocation", back_populates="spot_group")
    memberships = db.relationship(
        "SpotGroupMember",
        back_populates="group",
        cascade="all, delete-orphan",
    )
    messages = db.relationship(
        "SpotGroupMessage",
        back_populates="group",
        cascade="all, delete-orphan",
    )


class SpotGroupMember(db.Model):
    __tablename__ = "spot_group_members"

    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(
        db.Integer,
        db.ForeignKey("spot_groups.id"),
        nullable=False,
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )
    notification_level = db.Column(
        db.String(20),
        default="all",
        nullable=False,
    )
    joined_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    group = db.relationship("SpotGroup", back_populates="memberships")
    user = db.relationship("User", back_populates="spot_group_memberships")

    __table_args__ = (
        db.UniqueConstraint(
            "group_id",
            "user_id",
            name="unique_spot_group_member",
        ),
        db.Index("idx_spot_group_members_user", "user_id"),
    )


class SpotGroupMessage(db.Model):
    __tablename__ = "spot_group_messages"

    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(
        db.Integer,
        db.ForeignKey("spot_groups.id"),
        nullable=False,
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )
    content = db.Column(db.String(1000), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    group = db.relationship("SpotGroup", back_populates="messages")
    user = db.relationship("User", back_populates="spot_group_messages")

    __table_args__ = (
        db.Index(
            "idx_spot_group_messages_group_created",
            "group_id",
            "created_at",
            "id",
        ),
    )


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
    
class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)   # recipient
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True) # who did the action
    catch_id = db.Column(db.Integer, db.ForeignKey("catches.id"), nullable=True)
    spot_group_id = db.Column(
        db.Integer,
        db.ForeignKey("spot_groups.id"),
        nullable=True,
    )
    type = db.Column(db.String(50), nullable=False)  # "like" | "comment"
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    recipient = db.relationship("User", foreign_keys=[recipient_id], back_populates="notifications")

    actor = db.relationship("User", foreign_keys=[actor_id])

    catch = db.relationship("Catch")

    spot_group = db.relationship("SpotGroup")

    __table_args__ = (
        db.Index("idx_notifications_user", "recipient_id"),
        db.Index("idx_notifications_unread", "recipient_id", "is_read"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "recipient_id": self.recipient_id,
            "actor_id": self.actor_id,
            "actor_username": self.actor.username if self.actor else None,
            "actor_avatar_url": self.actor.profile_photo if self.actor else None,
            "catch_id": self.catch_id,
            "spot_group_id": self.spot_group_id,
            "spot_group_name": self.spot_group.name if self.spot_group else None,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat(),
        }
