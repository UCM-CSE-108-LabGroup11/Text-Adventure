from flask_login import UserMixin
from sqlalchemy.sql import func
from datetime import datetime

from . import db

import random, enum

def shortid(leng: int = 8):
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890-_"
    return("".join(random.choice(characters) for i in range(length)))

class User(db.Model, UserMixin):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, info={"min_length": 2})
    email = db.Column(db.String(255), unique=True, nullable=True)
    password = db.Column(db.String(255), nullable=True, info={"min_length": 4})
    is_admin = db.Column(db.Boolean, default=False)

    discord_id = db.Column(db.String(64), unique=True, nullable=True)
    discord_username = db.Column(db.String(255), nullable=True)
    discord_avatar = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    requests = db.relationship("Request", back_populates="user")
    chats = db.relationship("Chat", back_populates="user")
    messages = db.relationship("Message", back_populates="user")
    permissions = db.relationship("Permission", back_populates="user")

    api_keys = db.relationship("APIKey", backref="user")

class APIKey(db.Model):
    __tablename__ = "keys"
    id = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.Integer, db.ForeignKey("users.id"))
    is_admin = db.Column(db.Boolean, default=False)
    key = db.Column(db.String(255), nullable=False)
    expiry = db.Column(db.DateTime, nullable=False)

# for rate limiting
class Request(db.Model):
    __tablename__ = "requests"
    id = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.Integer, db.ForeignKey("users.id"))
    user = db.relationship("User", back_populates="requests")
    date = db.Column(db.DateTime, default=datetime.utcnow)

class Chat(db.Model):
    __tablename__ = "chats"
    id = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.Integer, db.ForeignKey("users.id"))
    user = db.relationship("User", back_populates="chats")
    permissions = db.relationship("Permission", back_populates="chat")
    is_public = db.Column(db.Boolean)
    name = db.Column(db.String(255), nullable=False) 
    rule_mode = db.Column(db.String(64), default="narrative")  
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    messages = db.relationship("Message", back_populates="chat")
    theme = db.Column(db.String(64), default="default")
    custom_theme = db.Column(db.Text, nullable=True)

class Character(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chatid = db.Column(db.Integer, db.ForeignKey("chats.id"))
    name = db.Column(db.String(64))
    health = db.Column(db.Integer, default=100)
    spell_power = db.Column(db.Integer, default=10)
    strength = db.Column(db.Integer, default=10)
    char_class = db.Column(db.String(64))
    is_ko = db.Column(db.Boolean, default=False)
    xp = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    backstory = db.Column(db.Text)

class Message(db.Model):
    __tablename__ = "messages"
    id = db.Column(db.Integer, primary_key=True)
    chatid = db.Column(db.Integer, db.ForeignKey("chats.id"))
    chat = db.relationship("Chat", back_populates="messages")
    userid = db.Column(db.Integer, db.ForeignKey("users.id"))
    user = db.relationship("User", back_populates="messages")
    selected_variant = db.Column(db.Integer)
    variants = db.relationship("Variant", back_populates="message")

class Variant(db.Model):
    __tablename__ = "variants"
    id = db.Column(db.Integer, primary_key=True)
    messageid = db.Column(db.Integer, db.ForeignKey("messages.id"))
    message = db.relationship("Message", back_populates="variants")
    text = db.Column(db.String(65535))

class Permission(enum.Enum):
    VIEW = "view"
    WRITE = "write"

class Permission(db.Model):
    __tablename__ = "permissions"
    userid = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    user = db.relationship("User", back_populates="permissions")
    chatid = db.Column(db.Integer, db.ForeignKey("chats.id"))
    chat = db.relationship("Chat", back_populates="permissions")
    permission = db.Column(db.Enum(Permission), nullable=False, default=Permission.VIEW)
