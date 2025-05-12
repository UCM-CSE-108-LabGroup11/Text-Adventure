import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import CharacterModal from "../CharacterModal"; 
import LoginPage from "src/LoginPage";
import { useAuth } from "@/AuthContext";

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
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <header className="w-full py-4 px-6 mb-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
        <Link to="/" className="text-2xl hover:underline underline-offset-4 font-bold text-gray-600 hover:text-gray-900">
          AI Adventure
        </Link>
          <nav className="flex space-x-4 text-sm font-medium text-gray-600">
            <Button asChild size="sm" variant="link"><Link to="/About">About</Link></Button>
            <Button asChild size="sm" variant="link"><Link to="/Features">Features</Link></Button>
            <Button asChild size="sm" variant="link"><Link to="/Play">Play</Link></Button>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-gray-700">Welcome, <strong>{user.username}</strong></span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="default" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
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
    fetchChats()
      .then((data) => {
        const realChats = data.chats || [];
        setExistingChats(realChats);
      })
      .catch((err) => {
        console.error("Failed to fetch chats", err);
        setExistingChats([]);
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


  const handleDelete = async (chatId: number) => {
    if (!confirm("Are you sure you want to delete this world?")) return;
  
    try {
      await fetch(`http://localhost:5000/api/v1/chats/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      });
  
      setExistingChats((prev) => prev.filter((chat) => chat.id !== chatId));
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
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
            <div className="flex gap-2 mt-3">
            <Button onClick={() => handleSelect(chat.id)} className="flex-1">
              Enter
            </Button>
            <Button
            className="bg-red-600 text-white hover:bg-red-500 px-4 py-2 rounded-md text-sm font-medium transition"
            onClick={() => handleDelete(chat.id)}
            >
              Delete
          </Button>
          </div>
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
          onCancel={() => setShowCharacterModal(false)} // <-- add this
          theme={theme === "custom" ? customTheme : theme}
        />
      )}
    </motion.div>
  );
}
