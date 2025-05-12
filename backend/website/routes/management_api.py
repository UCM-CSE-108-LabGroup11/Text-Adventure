from flask_jwt_extended import get_jwt_identity, jwt_required
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

from website.models import Chat, Message, Variant, User
from website import db

import openai, os, random

# Load environment variables from .env file (like your default OpenAI API key)
load_dotenv()

chat_management_bp = Blueprint("chat_management", __name__)

# --- predefined items ---
THEMES = {
    "dark_fantasy": "Grim worlds, moral ambiguity, dangerous magic, and a struggle for survival against overwhelming despair.",
    "fairy_tale": "Enchanted forests, talking animals, curses, royalty, and quests where good often clashes with archetypal evil.",
    "sword_and_sorcery": "Heroic (often morally grey) adventurers, ancient evils, forbidden magic, and personal quests for power or survival.",
    "superhero": "Wield extraordinary powers, protect cities, battle distinct villains, and uphold (or question) a moral code.",
    "holidays": "Adventures themed around festive seasons (like Halloween or Christmas), often whimsical, spooky, or heartwarming.",
    "paranormal": "Investigate ghosts, cryptids, psychic phenomena, and unexplained mysteries in modern or historical settings.",
    "cyberpunk": "Navigate neon-drenched cities, deal with megacorporations, cybernetics, and social decay in a high-tech, low-life future.",
    "science_fiction_and_science_fantasy": "Explore galaxies, encounter aliens, use futuristic tech, or blend magic with spaceships and psionic powers.",
    "wild_west": "Experience the frontier with cowboys, outlaws, gold rushes, railroads, and perhaps a touch of the supernatural (Weird West).",
    "post_apocalyptic": "Survive in the ruins of civilization, facing mutants, scarce resources, and the challenge of rebuilding or succumbing to despair.",
    "steampunk": "Adventure in a world of Victorian aesthetics, steam-powered contraptions, airships, clockwork marvels, and social intrigue."
}
PLOT_STRUCTURES = [
    "Geographic Progression",
    "A-B-C Quest",
    "Event-Based",
    "Accumulation of Events",
    "Intrigue/Mystery",
    "Defend the Base"
]
GOALS = [
    "Rescue someone", 
    "Recover an artifact", 
    "Stop a ritual", 
    "Explore a location", 
    "Defend a place", 
    "Solve a mystery", 
    "Deliver something important", 
    "Assassinate a target", 
    "Win a competition", 
    "Survive"
]
VILLAIN_ARCHETYPES = ["Tyrant Ruler", "Scheming Cultist", "Betrayed Friend", "Monster", "Corrupt Official", "Rival Adventurer", "Mad Scientist/Wizard"]

# temporary helper function
def get_llm_respones(prompt_history, temperature=0.7):
    try:
        response = openai.responses.create(
            model="o4-mini",
            input=prompt_history,
            temperature=temperature
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        return(f"Error generating response: {e}")

@chat_management_bp.route("/character", methods=["POST"])
def create_or_update_character():
    from website import db
    from website.models import Character, Chat
    data = request.get_json()
    chatid = data.get("chatid")
    name = data.get("name")
    char_class = data.get("charClass") or data.get("char_class")
    rule_mode = data.get("rule_mode", "narrative")
    theme = data.get("theme", "default")
    backstory = data.get("backstory", "")
    custom_theme = data.get("custom_theme", "")
    api_key = (data.get("apiKey") or "").strip()
    print("📥 Received GPT key in /chats:", api_key)
    openai.api_key = api_key or os.getenv("OPENAI_API_KEY")

    chat = Chat.query.get(chatid)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404

    char = Character.query.filter_by(chatid=chatid).first()
    if char:
        # Update existing
        char.name = name
        char.char_class = char_class
        char.backstory = backstory
    else:
        # Create new
        char = Character(
            chatid=chatid,
            name=name,
            char_class=char_class,
            backstory=backstory,
            spell_power=12 if char_class.lower() == "mage" else 0,
            strength=10 if char_class.lower() != "mage" else 0,
        )
        db.session.add(char)

    db.session.commit()

    return jsonify({
        "status": "ok",
        "character": {
            "id": char.id,
            "chatid": char.chatid,
            "name": char.name,
            "char_class": char.char_class,
            "backstory": char.backstory,
            "xp": char.xp,
            "level": char.level,
            "strength": char.strength,
            "spell_power": char.spell_power,    
        }
    }), 201

@chat_management_bp.route("/character", methods=["GET"])
def get_character():
    from website.models import Character

    try:
        chatid = int(request.args.get("chatid"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid chatid"}), 400

    print(f"Looking for character with chatid={chatid}")

    char = Character.query.filter_by(chatid=chatid).first()
    if not char:
        return jsonify({"error": "Character not found"}), 404

    return jsonify({
        "character": {
            "id": char.id,
            "chatid": char.chatid,
            "name": char.name,
            "char_class": char.char_class,
            "backstory": char.backstory,
            "health": char.health,
            "level": char.level,
            "xp": char.xp,
            "strength": char.strength,
            "spell_power": char.spell_power, 
        }
    }), 200


@chat_management_bp.route("/gain_xp", methods=["POST"])
def gain_xp():
    from website import db
    from website.models import Character

    # grab stuff from the request
    data = request.get_json()
    chatid = data.get("chatid")
    amount = int(data.get("amount", 0))

    # make sure we actually got valid data
    if not chatid or amount <= 0:
        return jsonify({"error": "Missing or invalid input"}), 400

    # find the character for this chat
    char = Character.query.filter_by(chatid=chatid).first()
    if not char:
        return jsonify({"error": "Character not found"}), 404

    # give them the XP
    char.xp += amount

    # check if they leveled up
    leveled_up = False
    while char.xp >= char.level * 100:
        char.xp -= char.level * 100
        char.level += 1
        char.health += 10
        if char.char_class.lower() == "mage":
            char.spell_power += 1
        else:
            char.strength += 1
        leveled_up = True

    # save the changes
    db.session.commit()

    # send it back
    return jsonify({
        "message": f"Gained {amount} XP" + (" and leveled up!" if leveled_up else ""),
        "character": {
            "level": char.level,
            "xp": char.xp,
            "health": char.health,
            "strength": char.strength,
        }
    }), 200



@chat_management_bp.route("/levelup", methods=["POST"])
def level_up():
    from website import db
    from website.models import Character

    # Grab the chat ID from the request
    data = request.get_json()
    chatid = data.get("chatid")
    if not chatid:
        return jsonify({"error": "Missing chatid"}), 400

    # Find the character tied to this chat
    char = Character.query.filter_by(chatid=chatid).first()
    if not char:
        return jsonify({"error": "Character not found"}), 404

    # Level them up and boost their stats
    char.level += 1
    char.health += 10
    if char.char_class.lower() == "mage":
      char.spell_power += 1
    else:
      char.strength   += 1

    # Save it to the database
    db.session.commit()

    # Send back the updated character info
    return jsonify({
        "message": f"{char.name} leveled up to level {char.level}!",
        "character": {
            "id": char.id,
            "chatid": char.chatid,
            "name": char.name,
            "char_class": char.char_class,
            "backstory": char.backstory,
            "level": char.level,
            "health": char.health,
            "strength": char.strength,
            "spell_power": char.spell_power,  # ← and return it here too
        }
    }), 200



@chat_management_bp.route("/chats", methods=["POST"])
@jwt_required()
def create_chat():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if(user is None):
        return(jsonify({"message": "Invalid JWT Token."}), 401)

    data = request.get_json()
    name = data.get("name")
    rule_mode = data.get("rule_mode", "narrative")
    theme1_input = data.get("theme")
    theme2_input = data.get("theme2")
    custon_details = data.get("custom_theme", "")
    if(not name):
        return(jsonify({"message": "World name is required"}), 400)
    
    theme_keys = list(THEMES.keys())
    theme1 = theme1_input if theme1_input != "random" else random.choice(theme_keys)
    theme2 = None
    if(theme2_input):
        if(len(theme_keys) > 1):
            available_themes = [t for t in theme_keys if t != theme1]
        else:
            available_themes = theme_keys
        theme2 = theme2_input if theme2_input != "random" else random.choice(available_themes)
    
    themes = [theme1]
    if(theme2):
        themes_list.append(theme2)

    adventure = {
        "theme_keys": themes
    }

    if(len(themes) == 1):
        theme_user_input = "The adventure theme is as follows:\n"
    else:
        theme_user_input = "The adventure themes are as follows:\n"
    for theme in themes:
        theme_user_input += f"- {theme.replace("_", " ").title()}: {THEMES[theme]}\n"

    # 1. General Setting
    setting_instruction = "You are running a D&D-like text adventure for the user. Write a general adventure setting based on their input. It should be concise, but descriptive and not directly address the user."
    setting_user_input = theme_user_input + ""
    response = client.responses.create(
        model="gpt-4.1-nano",
        input=[
            {
                "role": "system",
                "content": setting_instruction
            },
            {
                "role": "user",
                "content": theme_user_input
            }
        ]
    )
    total_user_input = theme_user_input + "\n" + "The settng is as follows:"
    total_user_input += "> " + response.output_text.replace("\n", "\n> ") + "\n\n"
    adventure["setting"] = response.output_text
    
    # 2. Adventure Goal
    goal = random.choice(GOALS)
    goal_instruction = "You are running a D&D-like text adventure for the user. Come up with an adventure goal based on their input. It should be concise, but descriptive and not directly address the user."
    goal_user_input += f"The adventure goal is: {goal}"
    response = client.responses.create(
        model="gpt-4.1-nano",
        input=[
            {
                "role": "system",
                "content": goal_instruction
            },
            {
                "role": "user",
                "content": goal_user_input
            }
        ]
    )
    total_user_input += f"The adventure goal is: \n"
    total_user_input += "> " + response.output_text.replace("\n", "\n> ") + "\n\n"
    adventure["goal"] = response.output_text

    # 3. Plot Structure
    plot_structure = random.choice(PLOT_STRUCTURES)
    total_user_input += f"The plot structure is: {plot_structure}\n\n"
    adventure["plot"] = plot_structure

    # 4. Story hook
    hook_instruction = "You are running a D&D-like text adventure for the user. Come up with an adventure hook based on their input. It should be concise, but descriptive and not directly address the user."
    response = client.responses.create(
        model="gpt-4.1-nano",
        input=[
            {
                "role": "system",
                "content": hook_instruction
            },
            {
                "role": "user",
                "content": total_user_input
            }
        ]
    )
    total_user_input += f"The adventure hook is:\n"
    total_user_input += "> " + response.output_text.replace("\n", "\n> ") + "\n\n"
    adventure["hook"] = response.output_text

    # 5. Master villain
    villain_instruction = "You are running a D&D-like text adventure for the user. Come up with a description for a main villain based on their input. It should include their alignment, ideal, bond, flaw, at least one personality trait, and a visual description. The player's level is capped at five, so the villain should not be too strong for a fifth-level character.\n\n"
    villain_instruction += "It should follow the following format:\n"
    villain_instruction += "**__Villain Name__**\nSTR: <strength score>\nDEX: <dexterity score>\nCON: <constitution score>\nINT: <intelligence score>\nWIS: <wisdom score>\nCHA: <charisma score>\n=====\n***Level:*** <villain level>\n***Abilities:***\n- <list of abilities>\n=====\n***Ideal.*** <villain character ideal>\n***Bond.*** <villain character bond>\n***Flaw/Secret.*** <villain character flaw/secret>\n***Personality Trait.*** <villain personality trait>\n=====\n***Physical Description:***\n> <villain physical description>\n=====\n***Other Notes:***\n> <other notes about the villain>"
    response = client.responses.create(
        model="gpt-4.1-nano",
        input=[
            {
                "role": "system",
                "content": villain_instruction
            },
            {
                "role": "user",
                "content": total_user_input
            }
        ]
    )
    total_user_input += f"### Main Villain\n\n{response.output_text}\n\n"
    adventure["main_villain"] = response.output_text

    # 6. Minor Villains (2d4)
    villain_instruction = "You are running a D&D-like text adventure for the user. Come up with a description for a minor villain based on their input. It should include their alignment, ideal, bond, flaw, at least one personality trait, and a visual description. The player's level is capped at five, so the villain should not be too strong for a fifth-level character. If their input already includes a minor villain, come up with another one.\n\n"
    villain_instruction += "It should follow the following format:\n"
    villain_instruction += "**__Villain Name__**\nSTR: <strength score>\nDEX: <dexterity score>\nCON: <constitution score>\nINT: <intelligence score>\nWIS: <wisdom score>\nCHA: <charisma score>\n=====\n***Level:*** <villain level>\n***Abilities:***\n- <list of abilities>\n=====\n***Ideal.*** <villain character ideal>\n***Bond.*** <villain character bond>\n***Flaw/Secret.*** <villain character flaw/secret>\n***Personality Trait.*** <villain personality trait>\n=====\n***Physical Description:***\n> <villain physical description>\n=====\n***Other Notes:***\n> <other notes about the villain>"
    total_minor_villains = random.randint(1, 4) + random.randint(1, 4)
    adventure["minor_villains"] = []
    for i in range(total_minor_villains):
        response = client.responses.create(
            model="gpt-4.1-nano",
            input=[
                {
                    "role": "system",
                    "content": villain_instruction
                },
                {
                    "role": "user",
                    "content": total_user_input
                }
            ]
        )
        if(i == 0):
            total_user_input += "### Minor Villains\n\n"
        total_user_input += response.output_text + "\n\n"
        adventure["minor_villains"].append(response.output_text)
    
    # 7. NPCs (2d4)
    npc_instruction = "You are running a D&D-like text adventure for the user. Come up with a description for an NPC based on their input. The NPC shold either be neutral or an ally. It should include their alignment, ideal, bond, flaw, at least one personality trait, and a visual description. If their input already includes an NPC, come up with another one.\n\n"
    npc_instruction += "It should follow the following format:\n"
    npc_instruction += "**__NPC Name__**\nSTR: <strength score>\nDEX: <dexterity score>\nCON: <constitution score>\nINT: <intelligence score>\nWIS: <wisdom score>\nCHA: <charisma score>\n=====\n***Level:*** <npc level>\n***Abilities:***\n- <list of abilities>\n=====\n***Ideal.*** <npc character ideal>\n***Bond.*** <npc character bond>\n***Flaw/Secret.*** <npc character flaw/secret>\n***Personality Trait.*** <npc personality trait>\n=====\n***Physical Description:***\n> <npc physical description>\n=====\n***Other Notes:***\n> <other notes about the npc>"
    total_npcs = random.randint(1, 4) + random.randint(1, 4)
    adventure["npcs"] = []
    for i in range(total_npcs):
        response = client.responses.create(
            model="gpt-4.1-nano",
            input=[
                {
                    "role": "system",
                    "content": npc_instruction
                },
                {
                    "role": "user",
                    "content": total_user_input
                }
            ]
        )
        if(i == 0):
            total_user_input += "### NPCs\n\n"
        total_user_input += response.output_text + "\n\n"
        adventure["npcs"].append(response.output_text)
    
    # 8. Locations (2d4)
    location_instruction = "You are running a D&D-like text adventure for the user. Come up with a description for a relevant location based on their input. If their input already includes an NPC, come up with another one.\n\n"
    total_locations = random.randint(1, 4) + random.randint(1, 4)
    adventure["locations"] = []
    for i in range(total_locations):
        response = client.responses.create(
            model="gpt-4.1-nano",
            input=[
                {
                    "role": "system",
                    "content": location_instruction
                },
                {
                    "role": "user",
                    "content": total_user_input
                }
            ]
        )
        if(i == 0):
            total_user_input += "### Locations\n\n"
        total_user_input += response.output_text + "\n\n"
        adventure["locations"].append(response.output_text)
    
    # 9. Complete outline
    outline_instruction = "You are running a D&D-like text adventure for the user. Come up with a rough outline for the adventure based on their input."
    response = client.responses.create(
        model="gpt-4.1-nano",
        input=[
            {
                "role": "system",
                "content": outline_instruction
            },
            {
                "role": "user",
                "content": total_user_input
            }
        ]
    )
    adventure["outline"] = response.output_text
    total_user_input += "### Outline\n\n" + response.output_text
    adventure["total_description"] = total_user_input

    # Append theme-based intro prompt
    intro_prompt = "You are running a D&D-like text adventure RPG for the user. Begin the game with a vivid scenario. Keep all descriptions in natural language; do not refer to game mechanics.\n\n"
    intro_prompt += total_user_input

    try:


    # Generate GPT intro
    response = openai.responses.create(
        model="gpt-4.1",
        input=[
            {
                "role": "system",
                "content": intro_prompt
            }
        ]
    )

    try:
        new_chat = Chat(
            name=name,
            rule_mode=rule_mode,
            theme=f"{theme1}{f', {theme2}' if theme2 else ''}",
            custom_theme=custom_theme,
            adventure_details=json.dumps(adventure),
            user=user
        )
        db.session.flush()
        new_message = Message(
            chat=new_chat,
            user=user,
            selected_variant=0,
        )
        db.session.flush()
        new_variant = Variant(
            message=new_message,
            text=response.output_text
        )
        db.session.add(new_chat)
        db.session.add(new_message)
        db.session.add(new_variant)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(e)
        return(jsonify({"message": "A database error occurred."}), 500)

    return jsonify({
        "id": new_chat.id,
        "name": new_chat.name,
        "rule_mode": new_chat.rule_mode,
        "theme": new_chat.theme,
        "custom_theme": new_chat.custom_theme,
        "intro": intro_text
    }), 201


@chat_management_bp.route("/chats", methods=["GET"])
@jwt_required()
def get_chats():
    from website.models import Chat

    user_id = get_jwt_identity()
    chats = Chat.query.filter_by(userid=user_id).all()

    return jsonify({
        "chats": [
            {
                "id": chat.id,
                "name": chat.name,
                "rule_mode": chat.rule_mode,
                "theme": chat.theme,
                "custom_theme": chat.custom_theme,
            }
            for chat in chats
        ]
    }), 200


@chat_management_bp.route("/messages", methods=["GET"])
@jwt_required()
def get_messages():
    from website.models import Chat, Message, Variant
    try:
        user_id = get_jwt_identity()
        chatid = int(request.args.get("chatid"))  # cast to int

        chat = Chat.query.filter_by(id=chatid, userid=user_id).first()
        if not chat:
            return jsonify({"error": "Chat not found or unauthorized"}), 404

        messages = Message.query.filter_by(chatid=chatid).order_by(Message.id).all()

        return jsonify({
            "messages": [
                {
                    "id": msg.id,
                    "user": "user" if msg.userid == user_id else "dm",
                    "variants": [v.text for v in msg.variants],
                }
                for msg in messages
            ]
        }), 200

    except Exception as e:
        print("💥 Error in /messages:", str(e))
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
    
@chat_management_bp.route("/chats/<int:chatid>", methods=["DELETE"])
@jwt_required()
def delete_chat(chatid):
    from website.models import Chat, Message, Variant, Character
    from website import db

    user_id = get_jwt_identity()
    chat = Chat.query.filter_by(id=chatid, userid=user_id).first()
    if not chat:
        return jsonify({"error": "Chat not found or unauthorized"}), 404

    # Optional: delete related data (cascades if properly set up)
    db.session.delete(chat)
    db.session.commit()
    return jsonify({"message": "Chat deleted"}), 200
