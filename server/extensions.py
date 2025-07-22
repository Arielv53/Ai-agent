from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import cloudinary
import os

db = SQLAlchemy()
migrate = Migrate()

def configure_cloudinary():
    cloudinary.config(
        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
        api_key=os.getenv('CLOUDINARY_API_KEY'),
        api_secret=os.getenv('CLOUDINARY_API_SECRET')
    )