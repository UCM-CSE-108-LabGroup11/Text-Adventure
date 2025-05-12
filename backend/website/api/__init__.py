from flask import Blueprint, jsonify
from website.routes.chat import chat_bp
from website.routes.management_api import chat_management_bp
from website.routes.auth import auth as site_auth


api = Blueprint("api", __name__)
api.register_blueprint(chat_bp)           
api.register_blueprint(chat_management_bp)
api.register_blueprint(site_auth, url_prefix="/auth")


@api.route("/test")
def test():
    return(jsonify({"response": "test"}))