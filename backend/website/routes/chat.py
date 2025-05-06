from flask import Blueprint, request, jsonify
import openai
import os
from dotenv import load_dotenv

# Load environment variables from .env file (like your default OpenAI API key)
load_dotenv()

# Set the default API key from environment (can be overridden per user later)
openai.api_key = os.getenv("OPENAI_API_KEY")

# Flask Blueprint for all chat-related routes
chat_bp = Blueprint("chat", __name__)

# In-memory session store to keep track of per-user chat history will change later a this resets when server restarts
session_memory = {}

@chat_bp.route("/chat", methods=["POST"])
def chat():
    # Extracts the data from POST request
    data = request.json
    username = data.get("username", "Unknown")  # default is set to Unknown
    message = data.get("message", "")
    api_key = data.get("apiKey")  # optional per-user API key
    provider = data.get("provider", "openai")

    # Only support OpenAI for now (will change if we want to add the Bring-your-own-key rule and there's time)
    if provider != "openai":
        return jsonify({"error": "Only OpenAI supported for now."})

    # Use user's API key if provided otherwise fall back to default
    openai.api_key = api_key or os.getenv("OPENAI_API_KEY")

    # Load conversation history if user already has one if not start a new session
    history = session_memory.get(username, [
        {"role": "system", "content": (
            "You are the Dungeon Master for a text-based fantasy RPG. "
            "You describe the world, handle actions, and narrate outcomes. "
            "Roll dice internally as needed. Respond only in-character."
        )}
    ])

    # Append the new user message to the conversation
    history.append({"role": "user", "content": message})

    # Call OpenAI's chat completion endpoint with the recent history (last 10 messages)
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=history[-10:],
        temperature=0.8
    )

    # Extract and format the assistant's reply
    reply = response.choices[0].message.content.strip()

    # Add the assistant's response to the history
    history.append({"role": "assistant", "content": reply})

    # Save the updated history back into the session store
    session_memory[username] = history

    # Return the assistant's reply to the frontend
    return jsonify({"reply": reply})
