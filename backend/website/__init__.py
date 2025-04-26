from werkzeug.security import generate_password_hash as gph
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from itertools import zip_longest
from dotenv import load_dotenv
from flask_cors import CORS
from flask import Flask

# from .site import main, auth as site_main, site_auth
from .api import api

import os

load_dotenv()

db = SQLAlchemy()

FLASK_SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", None)
if(FLASK_SECRET_KEY is None):
    print("WARNING:\t`FLASK_SECRET_KEY` environment variable not set; using default")
    FLASK_SECRET_KEY = "defaultsecretkey"

DB_NAME = os.environ.get("DB_NAME", "database.db")

def start():
    app = Flask(__name__)
    CORS(app)
    app.config["SECRET_KEY"] = FLASK_SECRET_KEY
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME}"

    db.init_app(app)

    app.register_blueprint(site_main)
    app.register_blueprint(site_auth, url_prefix="/auth")

    app.register_blueprint(api_main, url_prefix="/api/v1")

    from .models import User

    login_manager = LoginManager()
    login_manager.login_view = "site_auth.login"
    login_manager.init_app(app)

    create_database(app)

    @login_manager.user_loader
    def load_user(id):
        return(User.query.get(id))

    return(app)

def create_database(app):
    if(os.path.exists(os.path.join("./instance/", DB_NAME))):
        return
    
    with app.app_context():
        from .models import User

    # comma-separated credentials
    admin_usernames = os.environ.get("DEFAULT_ADMIN_USERNAMES", "").split(",")
    admin_passwords = os.environ.get("DEFAULT_ADMIN_PASSWORDS", "").split(",")

    admin_emails = os.environ.get("DEFAULT_ADMIN_EMAILS", "").split(",")

    # check if none to prevent TypeError NoneType hsa no len()
    admin_usernames_defined = (admin_usernames is not None) and (len(admin_usernames) > 0)
    admin_passwords_defined = (admin_passwords is not None) and (len(admin_passwords) > 0)

    # if no credentials, generic defaults because admin user is required
    if(not admin_users_defined or not admin_passwords_defined):
        admin_user = User(
            username="admin",
            email=admin_emails[0] if admin_emails else "admin@example.com",
            password="password",
            is_admin=True
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Created Database")
        return
    
    for i, (username, password) in enumerate(zip_longest(admin_usernames, admin_passwords, fillvalue=None)):
        if(username is None):
            break

        first_name = admin_first_names[i] or f"admin{i}"
        last_name = admin_last_names[i] or f"admin{i}"
        email = admin_emails[i] or f"admin{i}@example.com"

        admin_user = User(
            first_name=first_name,
            last_name=last_name,
            username=username,
            email=email
            password=cph(password or "password"),
            is_admin=True
        )
        db.session.add(admin_user)
    db.session.commit()
    print("Created Database")