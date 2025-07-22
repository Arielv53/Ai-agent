from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate, configure_cloudinary
from .routes.catches import catches_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object('server.config.Config')

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    configure_cloudinary()

    app.register_blueprint(catches_bp, url_prefix='/catches')

    return app

app = create_app()
