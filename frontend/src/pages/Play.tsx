import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import CharacterModal from "@/CharacterModal";

// Updated to include theme + customTheme
async function createNewChat(name: string, ruleMode: string, theme: string, customTheme: string) {
  const res = await fetch("http://localhost:5000/api/v1/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, rule_mode: ruleMode, theme, custom_theme: customTheme }),
  });

  return res.json();
}

async function fetchChats() {
  const res = await fetch("http://localhost:5000/api/v1/chats", {
    method: "GET",
    credentials: "include",
  });
  return res.json();
}

function Header() {
  return (
    <nav className="w-full max-w-4xl flex items-center justify-between mb-4">
      <div className="text-2xl font-bold">
        <Link to="/" className="hover:underline text-inherit">AI Adventure</Link>
      </div>
      <div className="space-x-4">
        <Button asChild size="sm" variant="link"><Link to="/About">About</Link></Button>
        <Button asChild size="sm" variant="link"><Link to="/Features">Features</Link></Button>
      </div>
    </nav>
  );
}

export default function WorldSelect() {
  const [newName, setNewName] = useState("");
  const [ruleMode, setRuleMode] = useState("narrative");
  const [theme, setTheme] = useState("default");
  const [customTheme, setCustomTheme] = useState("");
  const [existingChats, setExistingChats] = useState<any[]>([]);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [pendingChat, setPendingChat] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const presets = [
      { id: -1, name: "Lost Mines", rule_mode: "narrative", theme: "dark-fantasy" },
      { id: -2, name: "Cyber Wastes", rule_mode: "rules-lite", theme: "cyberpunk" },
    ];

    fetchChats()
      .then((data) => {
        const realChats = data.chats || [];
        setExistingChats([...presets, ...realChats]);
      })
      .catch((err) => {
        console.error("Failed to fetch chats", err);
        setExistingChats(presets);
      });
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const newChat = await createNewChat(newName, ruleMode, theme, customTheme);
      setPendingChat(newChat);
      setShowCharacterModal(true);
    } catch (err) {
      console.error("Failed to create world:", err);
    }
  };

  const handleCharacterSubmit = async (character: any) => {
    try {
      await fetch("http://localhost:5000/api/v1/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...character,
          chatid: pendingChat.id,
        }),
      });

      navigate(`/Play/${pendingChat.id}`, {
        state: { intro: pendingChat.intro },
      });
    } catch (err) {
      console.error("Character creation failed", err);
    }
  };

  const handleSelect = (chatId: number) => {
    navigate(`/Play/${chatId}`);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center px-4 py-8 space-y-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Header />

      <div className="mt-8">
        <h2 className="text-3xl font-bold text-center">Your Worlds</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl">
        {existingChats.map((chat) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -4 }}
            className="border rounded-xl shadow p-4 flex flex-col justify-between transition-all hover:shadow-lg"
          >
            <div>
              <h4 className="text-lg font-semibold">{chat.name}</h4>
              <p className="text-sm text-muted-foreground capitalize">
                Rule Mode: {chat.rule_mode.replace("-", " ")}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                Theme: {chat.theme?.replace("-", " ") || "Default"}
              </p>
            </div>
            {chat.id < 0 ? (
              <p className="text-xs italic text-muted-foreground mt-2">
                (Template — create it below)
              </p>
            ) : (
              <Button onClick={() => handleSelect(chat.id)} className="mt-3">
                Enter
              </Button>
            )}
          </motion.div>
        ))}
      </div>

      <hr className="my-8 w-full max-w-4xl" />

      <div className="space-y-4 w-full max-w-4xl">
        <h3 className="text-2xl font-semibold">Create New World</h3>

        <input
          type="text"
          placeholder="World name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full px-3 py-2 border rounded shadow-sm"
        />

        <select
          value={ruleMode}
          onChange={(e) => setRuleMode(e.target.value)}
          className="w-full px-3 py-2 border rounded shadow-sm"
        >
          <option value="narrative">Narrative (story-focused)</option>
          <option value="rules-lite">Rules-Lite (rolls + limits)</option>
        </select>

        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full px-3 py-2 border rounded shadow-sm"
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
            className="w-full px-3 py-2 border rounded shadow-sm"
          />
        )}

        <Button onClick={handleCreate} className="w-full">
          Create and Start
        </Button>
      </div>

      {showCharacterModal && (
        <CharacterModal
          onSubmit={handleCharacterSubmit}
          theme={theme === "custom" ? customTheme : theme}
        />
      )}
    </motion.div>
  );
}
