from werkzeug.security import generate_password_hash as gph
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from flask_cors import CORS
from flask import Flask
from openai import OpenAI
import os

load_dotenv()

db = SQLAlchemy()

FLASK_SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "defaultsecretkey")
DB_NAME = os.environ.get("DB_NAME", "database.db")

def start():
    app = Flask(__name__)

    # Basic config
    app.config["SECRET_KEY"] = FLASK_SECRET_KEY
    app.config["JWT_SECRET_KEY"] = FLASK_SECRET_KEY  # ✅ Required for JWT
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME}"

    if(not os.environ.get("OPENAI_API_KEY")):
        print("WARNING:\tNo OpenAI API Key set.")
    client = OpenAI()
    app.config["OPENAI_CLIENT"] = client

    # Init extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    JWTManager(app)
    db.init_app(app)

    # Register blueprints
    from .models import User
    from .api import api
    app.register_blueprint(api, url_prefix="/api/v1")

    # Create DB if needed
    create_database(app)

    return app

def create_database(app):
    if os.path.exists(os.path.join("./instance/", DB_NAME)):
        return

    with app.app_context():
        db.create_all()
        from .models import User

        # Create default admin user
        admin_user = User(
            username="admin",
            email="admin@example.com",
            password=gph("password"),
            is_admin=True
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Created Database")
