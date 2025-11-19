import os
from dotenv import load_dotenv
import cloudinary
from flask import Flask

from .extensions import db, migrate, cors, api, bcrypt

load_dotenv()


def create_app(config_object: str = None):
    """Application factory.

    config_object can be a string path to a config class, but for now we
    configure directly from environment variables to match the existing app.
    """
    app = Flask(
        __name__,
        instance_path=os.path.join(
            os.path.abspath(os.path.dirname(__file__)), "instance"
        ),
    )

    # Basic config (matches previous app.py behavior)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URI", "sqlite:///instance/fishing.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "super-secret-key")

    # Cloudinary configuration
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    )

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db, directory="server/migrations")
    cors.init_app(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    api.init_app(app)
    bcrypt.init_app(app)

    # Import and register route modules (no blueprints)
    from .routes import chat, catches, social, user

    chat.register_routes(app)
    catches.register_routes(app)
    social.register_routes(app)
    user.register_routes(app)

    return app