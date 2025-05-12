from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

# This blueprint handles user authentication routes
auth = Blueprint("site_auth", __name__)

# Register a new user
@auth.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    email = data.get("email", "").strip()

    # Basic input check
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    
    from website.models import User
    from website import db


    # Check if username is already taken
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    # Hash the password and create the user
    hashed_pw = generate_password_hash(password)
    new_user = User(username=username, email=email, password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"})

# Log in an existing user
@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    from website.models import User
    from website import db


    # Look up the user
    user = User.query.filter_by(username=username).first()

    # Check password
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid username or password"}), 401

    # Log them in (Flask-Login handles session management)
    login_user(user, remember=True)
    return jsonify({"message": "Login successful", "username": user.username})

# Log out the current user
@auth.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"})

# Return info about the current user session
@auth.route("/me", methods=["GET"])
@login_required
def me():
    return jsonify({
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_admin": current_user.is_admin
    })


@auth.route("/user/key", methods=["POST"])
@login_required
def store_user_api_key():
    from flask import request, jsonify, session
    from flask_login import login_required
    data = request.get_json()
    key = data.get("key")

    if not key or not key.startswith("sk-"):
        return jsonify({"error": "Invalid API key format"}), 400

    session["openai_key"] = key
    return jsonify({"message": "Key stored in session"}), 200