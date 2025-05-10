import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CharacterModal from "./CharacterModal";

// TODO: Replace with real API call once backend is live
async function createNewChat(name: string, ruleMode: string, theme: string, customTheme: string) {
  const res = await fetch("http://localhost:5000/api/v1/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // assuming user session is stored in cookies
    body: JSON.stringify({
      name,
      rule_mode: ruleMode,
      theme,
      custom_theme: customTheme,
    }),
  });

  const data = await res.json();
  return data;
}



export default function WorldSelect() {
  const [newName, setNewName] = useState("");
  const [ruleMode, setRuleMode] = useState("narrative");
  const [theme, setTheme] = useState("default");
  const [customTheme, setCustomTheme] = useState("");
  const navigate = useNavigate();
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [pendingChat, setPendingChat] = useState<any>(null); // store newChat


  // TODO: Replace with real chat list (from DB or API)
  const [existingChats, setExistingChats] = useState([
    { id: 1, name: "Lost Mines", rule_mode: "narrative" },
    { id: 2, name: "Cyber Wastes", rule_mode: "rules-lite" },
  ]);

  // This function creates the room/chat with the options/ruleset
  const handleCreate = async () => {
    if (!newName.trim()) return;

    try {
      const newChat = await createNewChat(newName, ruleMode, theme, customTheme);
      setPendingChat(newChat); // Store for later
      setShowCharacterModal(true); // Show modal
      // TODO: Redirect with proper chat ID for later retrieval
    } catch (err) {
      console.error("Failed to create world:", err);
    }
  };

// When the user submits their character from the modal
const handleCharacterSubmit = async (character: any) => {
  try {
    // Send the character info to the backend, linked to this chat ID
    await fetch("http://localhost:5000/api/v1/character", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...character,            // name, charClass, backstory
        chatid: pendingChat.id,  // tie it to the right game
      }),
    });

    // Once it's saved, jump into the chat with the intro message
    navigate(`/Play/${pendingChat.id}`, {
      state: { intro: pendingChat.intro },
    });
  } catch (err) {
    // if something went wrong log it
    console.error("Character creation failed", err);
  }
};

  // This function selects the pre-created room and navigates to play it
  const handleSelect = (chatId: number) => {
    // TODO: Need to load selected chat history before navigating
    navigate(`/Play/${chatId}`);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-2xl font-bold">Select a World</h2>

      <div className="space-y-2">
        {existingChats.map((chat) => (
          <div
            key={chat.id}
            className="flex justify-between items-center border rounded px-4 py-2"
          >
            <span>{chat.name}</span>
            <Button onClick={() => handleSelect(chat.id)} size="sm">
              Enter
            </Button>
          </div>
        ))}
      </div>

      <hr className="my-6" />

      <h3 className="text-xl font-semibold">Create New World</h3>

      <input
        type="text"
        placeholder="World name"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />

      <select
        value={ruleMode}
        onChange={(e) => setRuleMode(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      >
        <option value="narrative">Narrative (story-focused)</option>
        <option value="rules-lite">Rules-Lite (rolls + limits)</option>
        {/* TODO: Add more rule sets later */}
      </select>

      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      >
        <option value="default">Default Theme</option>
        <option value="dark-fantasy">Dark Fantasy</option>
        <option value="sci-fi">Sci-Fi</option>
        <option value="high-fantasy">High Fantasy</option>
        <option value="custom">Custom Theme</option>
      </select>

      {theme === "custom" && (
        <input
          type="text"
          placeholder="Describe your custom theme"
          value={customTheme}
          onChange={(e) => setCustomTheme(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      )}

      <Button onClick={handleCreate} className="mt-3 w-full">
        Create and Start
      </Button>

      {showCharacterModal && (<CharacterModal onSubmit={handleCharacterSubmit} />)}
    </div>
  );
}
