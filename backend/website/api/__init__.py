from flask import Blueprint, jsonify

api = Blueprint("api", __name__)

from website.routes.chat import chat_bp
api.register_blueprint(chat_bp)

@api.route("/test")
def test():
    return(jsonify({"response": "test"}))