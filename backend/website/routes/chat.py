from flask import Blueprint, request, jsonify
import openai
import os
from dotenv import load_dotenv
from flask_login import current_user, login_required


# Load environment variables from .env file (like your default OpenAI API key)
load_dotenv()

# Set the default API key from environment (can be overridden per user later)
openai.api_key = os.getenv("OPENAI_API_KEY")

# Flask Blueprint for all chat-related routes
chat_bp = Blueprint("chat", __name__)

chat_management_bp = Blueprint("chat_management", __name__)

@chat_management_bp.route("/chats", methods=["POST"])
# @login_required
def create_chat():
    from website.models import Chat
    from website import db

    data = request.get_json()
    name = data.get("name")
    rule_mode = data.get("rule_mode", "narrative")

    if not name:
        return jsonify({"error": "World name is required"}), 400
    
    
    # new_chat = Chat(name=name, rule_mode=rule_mode, user=current_user) 

    new_chat = Chat(name=name, rule_mode=rule_mode) # Remove this when we have authentication 
    db.session.add(new_chat)
    db.session.commit()

    return jsonify({
        "id": new_chat.id,
        "name": new_chat.name,
        "rule_mode": new_chat.rule_mode
    }), 201

@chat_bp.route("/chat", methods=["POST"])
def chat():
    # Extracts the data from POST request
    data = request.json
    username = data.get("username", "Unknown")  # default is set to Unknown
    message = data.get("message", "")
    chat_id = data.get("chatId")
    api_key = data.get("apiKey")  # optional per-user API key
    provider = data.get("provider", "openai")

    # Only support OpenAI for now (will change if we want to add the Bring-your-own-key rule and there's time)
    if provider != "openai":
        return jsonify({"error": "Only OpenAI supported for now."})

    # Use user's API key if provided otherwise fall back to default
    openai.api_key = api_key or os.getenv("OPENAI_API_KEY")

    # Get the chat from DB
    from website.models import Chat, Message, Variant
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found."}), 404

     # Get recent messages for context (last 10)
    history = [
        {"role": "system", "content": (
            "You are the Dungeon Master for a text-based fantasy RPG. "
            "You describe the world, handle actions, and narrate outcomes. "
            "Roll dice internally as needed. Respond only in-character."
        )}
    ]

    # Get the 10 most recent messages for the chat, newest first
    recent_messages_query = (
        Message.query
        .filter_by(chatid=chat_id)
        .order_by(Message.id.desc())
        .limit(10)
    )

    # Reverse them so they appear in chronological context
    recent_messages = list(reversed(recent_messages_query.all()))

    for msg in recent_messages:
        # For now, just take first variant
        variant = msg.variants[0].text if msg.variants else ""
        role = "user" if msg.user and msg.user.username == username else "assistant"
        history.append({"role": role, "content": variant})

    # Append the new user message to the conversation
    history.append({"role": "user", "content": message})

    # Call OpenAI
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=history,
            temperature=0.8,
        )
        reply = response.choices[0].message.content.strip()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Save user message
    from website.models import User
    from website import db
    user = User.query.filter_by(username="Player1").first() # TODO: Change this when we implement login/authentication
    user_msg = Message(chatid=chat.id, user=user)
    db.session.add(user_msg)
    db.session.flush()  # get ID

    db.session.add(Variant(messageid=user_msg.id, text=message))

    # Save assistant reply
    ai_msg = Message(chatid=chat.id, user=None)
    db.session.add(ai_msg)
    db.session.flush()

    db.session.add(Variant(messageid=ai_msg.id, text=reply))
    db.session.commit()

    return jsonify({"reply": reply})