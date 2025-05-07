from flask import Blueprint, jsonify
from website.routes.chat import chat_bp, chat_management_bp

api = Blueprint("api", __name__)
api.register_blueprint(chat_bp)           
api.register_blueprint(chat_management_bp)


@api.route("/test")
def test():
    return(jsonify({"response": "test"}))