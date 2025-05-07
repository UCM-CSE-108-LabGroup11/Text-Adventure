import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// TODO: Replace with real API call once backend is live
async function createNewChat(name: string, ruleMode: string) {
  const res = await fetch("http://localhost:5000/api/v1/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // assuming user session is stored in cookies
    body: JSON.stringify({ name, rule_mode: ruleMode }),
  });

  const data = await res.json();
  return data;
}

export default function WorldSelect() {
  const [newName, setNewName] = useState("");
  const [ruleMode, setRuleMode] = useState("narrative");
  const navigate = useNavigate();

  // TODO: Replace with real chat list (from DB or API)
  const [existingChats, setExistingChats] = useState([
    { id: 1, name: "Lost Mines", rule_mode: "narrative" },
    { id: 2, name: "Cyber Wastes", rule_mode: "rules-lite" },
  ]);

  // This function creates the room/chat with the options/ruleset 
  const handleCreate = async () => {
    if (!newName.trim()) return;

    try {
      const newChat = await createNewChat(newName, ruleMode);
      // TODO: Redirect with proper chat ID for later retrieval
      navigate(`/Play/${newChat.id}`);
    } catch (err) {
      console.error("Failed to create world:", err);
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
        {/* TODO: Add more rule sets later, idk if were gonna add more than one tbh*/}
      </select>

        {/*Again this doesn't do anything yet*/} 
      <Button onClick={handleCreate} className="mt-3">
        Create and Start
      </Button>
    </div>
  );
}
