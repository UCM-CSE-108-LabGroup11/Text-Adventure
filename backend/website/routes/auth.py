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
    
    if(username is None):
        field_errors["username"] = "Username is required."
    elif(len(username) < 2):
        field_errors["username"] = "Username must be at least 2 characters."
    elif(len(username) > 255):
        field_errors["username"] = "Username must be fewer than 256 characters."
    
    if(email is None):
        field_errors["email"] = "Email address is required."
    elif(len(email) < 7):
        field_errors["email"] = "Please enter a valid email address."
    elif(len(email) > 255):
        field_errors["email"] = "Email address must be fewer than 256 characters"
    
    if(password1 is None):
        field_errors["password1"] = "Password is required."
    elif(len(password1) < 6):
        field_errors["password1"] = "Password must be at least 6 characters."
    elif(len(password1) > 255):
        field_errors["password1"] = "Password must be fewer than 256 characters."
    
    if(password1 != password2):
        field_errors["password2"] = "Passwords must match."

    # only if everything else is valid to reduce DB queries
    # VERY minor optimization but it's not much effort
    if(len(field_errors) < 1):
        user = User.query.filter_by(username=username).first()
        if(user is not None):
            field_errors["username"] = "Username is already taken."
        user = User.query.filter_by(email=email).first()
        if(user is not None):
            field_errors["email"] = "Email is already taken."

    if field_errors:
        return jsonify({
            "message": "Invalid user information.",
            "field_errors": field_errors
        }), 400

    try:
        new_user = User(
            username=username,
            email=email,
            password=generate_password_hash(password1)
        )
        db.session.add(new_user)
        db.session.commit()
    except:
        db.session.rollback()
        return(jsonify({"message": "A database error occurred."}), 500)

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
    
    # full suite of checks to reduce DB queries
    # again; VERY minor optimization
    if(username is None):
        field_errors["username"] = "Username is required."
    elif(len(username) < 2):
        field_errors["username"] = "Please enter a valid username."
    elif(len(username) > 255):
        field_errors["username"] = "Please enter a valid username."
    
    if(password is None):
        field_errors["password"] = "Password is required."
    elif(len(password) < 6):
        field_errors["password"] = "Please enter a valid password."
    elif(len(password) > 255):
        field_errors["password1"] = "Please enter a valid password."

    # only if everything else is valid to reduce DB queries
    # VERY minor optimization but it's not much effort
    if(len(field_errors) < 1):
        user = User.query.filter_by(username=username).first()
        if(user is None):
            # allow login via email OR username
            user = User.query.filter_by(email=username).first()
        if(user is None):
            field_errors["username"] = "No user with this username/email address."
        elif(not cph(user.password, password)):
            field_errors["password"] = "Invalid password."

    if field_errors:
        return jsonify({
            "message": "Invalid user information.",
            "field_errors": field_errors
        }), 400
    
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
