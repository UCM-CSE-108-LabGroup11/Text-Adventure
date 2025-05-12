from werkzeug.security import generate_password_hash as gph, check_password_hash as cph
from flask_jwt_extended import create_access_token as cat
from flask import Blueprint, jsonify, request

from website.models import User
from website import db


auth_bp = Blueprint("auth",__name__)

@auth_bp.route("/test")
def test():
    return(jsonify({"response": "test"}))

@auth_bp.route("/login", methods=["POST"])
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    # worry about login later; this is wrong.
    if(username is None or password is None):
        field_errors.append("Username and password are required.")
    
    user = User.query.filter_by(username=username).first()
    if(not user):
        field_errors.append("No such user.")

    if(not cph(user.password, password)):
        field_errors.append("Invalid password.")
    
    access_token = cat(identity=username)
    return(jsonify({"access_token": access_token}))

@auth_bp.route("/signup", methods=["POST"])
def signup():
    username = request.json.get("username", None)
    email = request.json.get("email", None)
    password1 = request.json.get("password1", None)
    password2 = request.json.get("password2", None)

    field_errors = []

    if(username is None):
        field_errors.append("Username is required.")
    if(len(username) < 6):
        field_errors.append("Username must be at least 6 characters.")
    if(len(username) > 255):
        field_errors.append("Username must be fewer than 256 characters.")
    
    if(email is None):
        field_errors.append("email is required.")
    
    if(password1 is None):
        field_errors.append("Password is required.")
    if(password2 is None):
        field_errors.append("Password confirmation is required.")
    if(password1 != password2):
        field_errors.append("Passwords must match.")
    if(len(password) < 6):
        field_errors.append("Password must be at least 6 characters.")
    if(len(password) > 255):
        field_errors.append("Password must be fewer than 256 characters.")
    
    existing_user = User.query.filter_by(username=username).first()
    if(existing_user):
        field_errors.append("Username is already taken.")
    existing_user = User.query.filter_by(email=email).first()
    if(existing_user):
        field_errors.append("Email is already associated with an account.")
    
    if(len(field_erros) > 0):
        return(jsonify({"message": "Invalid user information.", "field_errors": field_erros}), 400)
    
    new_user = User(
        username=username,
        email=email,
        password=gph(password1)
    )
    db.session.add(new_user)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(e)
        return(jsonify({"message": "A database error occurred."}), 500)
    return(jsonify({"message": "Account created."}), 201)