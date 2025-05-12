# website/routes/auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from website.models import User
from website import db

auth = Blueprint("site_auth", __name__)

@auth.route("/signup", methods=["POST", "OPTIONS"])
def signup():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json()
    username = data.get("username", "").strip()
    email    = data.get("email", "").strip()
    password1= data.get("password1", "").strip()
    password2= data.get("password2", "").strip()

    # your validation and uniqueness checks here...
    field_errors = {}
    # … (check password match, length, existing username/email)

    if field_errors:
        return jsonify({
            "message": "Invalid user information.",
            "field_errors": field_errors
        }), 400

    new_user = User(
      username=username,
      email=email,
      password=generate_password_hash(password1)
    )
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=str(new_user.id))
    return jsonify({
        "message": "Signup successful.",
        "access_token": access_token,
        "username": new_user.username
    }), 201

@auth.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid username or password."}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "access_token": access_token,
        "username": user.username
    }), 200

# Preflight-only handler
@auth.route("/me", methods=["OPTIONS"])
def me_preflight():
    return jsonify({}), 200

# Actual protected endpoint
@auth.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin
    }), 200
