from flask import Blueprint

from website.routes.management_api import chat_management_bp
from website.routes.chat import chat_bp
from website.routes.auth import auth_bp

api = Blueprint("api", __name__)
api.register_blueprint(chat_bp)           
api.register_blueprint(chat_management_bp)
api.register_blueprint(auth_bp)