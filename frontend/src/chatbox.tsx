import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useLocation } from "react-router-dom";
import CharacterSheet from "./CharacterSheet";

// Header component reused from LandingPage for consistent navigation
function Header() {
  return (
    <nav className="flex items-center justify-between mb-8">
      <div className="text-2xl font-bold">
        <Link to="/" className="hover:underline text-inherit">
          AI Adventure
        </Link>
      </div>
      <div className="space-x-4">
        <Button asChild size="sm" variant="link"><Link to="/About">About</Link></Button>
        <Button asChild size="sm" variant="link"><Link to="/Features">Features</Link></Button>
      </div>
    </nav>
  );
}

export default function ChatBox() {
  // Stores the ongoing chat log as an array of message strings
  const [chat, setChat] = useState<string[]>([]);
  // Tracks current input from the user
  const [input, setInput] = useState("");
  // Tracks the current selected provider (currently only GPT supported)
  const [provider, setProvider] = useState("openai");
  // Whether we're currently waiting for the DM to respond
  const [loading, setLoading] = useState(false);
  // Tracks if the player has been knocked out
  const [isKO, setIsKO] = useState(false);

  const [character, setCharacter] = useState<any>(null);

  const { chatId } = useParams<{ chatId: string }>();
  const location = useLocation();
  const intro = location.state?.intro;

  // Ref to scroll the chat window down as new messages come in
  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  const isRollResult = (text: string) =>
    /^Rolling: Roll:/i.test(text) || /^You rolled a \d+/i.test(text);

  // Handles sending a message to the backend API
  const sendMessage = async () => {
    if (!input.trim() || isKO) return;

    const userText = input;
    setChat((prev) => [...prev, `You: ${userText}`]);
    setInput("");
    setLoading(true);

    try {
      // Send POST request to backend
      const res = await fetch("http://localhost:5000/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Player1",
          message: userText,
          provider,
          chatId,
        }),
      });

      const data = await res.json();

      // Add the DM's response to chat
      if (data.reply) {
        setChat((prev) => [...prev, `DM: ${data.reply}`]);
      } else {
        setChat((prev) => [...prev, `Error: ${data.error || "Unknown error"}`]);
      }

      console.log(data.reply)
      // If the backend says player is knocked out, show that and block input
      if (data.ko) {
        setIsKO(true);
        setChat((prev) => [...prev, "💀 You have been knocked out. Game over."]);
      }

    } catch {
      // Network failure or server error
      setChat((prev) => [...prev, "Network error"]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (intro) {
      const timeout = setTimeout(() => {
        setChat([`DM: ${intro}`]);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [intro]);

  // Auto-scroll to the bottom of the chat on new message
  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [chat]);

  // Fetch character whenever chat changes (e.g., damage, XP)
  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/v1/character?chatid=${chatId}`);
        const data = await res.json();
        setCharacter(data.character);
        if (data.character?.health === 0) setIsKO(true);
      } catch (err) {
        console.error("Failed to load character", err);
      }
    };

    fetchCharacter();
  }, [chat]);

  // Determine the last DM message index with buttons
  let lastButtonsIndex = -1;
  chat.forEach((line, idx) => {
    if (!line.startsWith("DM:")) return;
    const content = line.replace(/^DM:\s?/, "");
    if (content.includes("---") || content.split(/\r?\n/).some((l) => l.startsWith("- "))) {
      lastButtonsIndex = idx;
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8">
      {/* Wrapper keeps everything aligned */}
      <div className="max-w-6xl mx-auto">
        {/* Keep the header above the content so things align better */}
        <Header />

        {/* Main layout: side-by-side chat and sheet */}
        <motion.div
          className="flex gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Sidebar on the left at same height as chat */}
          <div className="w-64">
            {character && <CharacterSheet character={character} />}
          </div>

          {/* Main content on the right */}
          <div className="flex-1 max-w-2xl">
            {/* Chat log with animated message bubbles */}
            <div
              ref={chatBoxRef}
              className="bg-card border rounded p-4 h-96 overflow-y-auto mb-4 shadow-inner flex flex-col gap-2"
            >
              {chat.map((line, i) => {
                const isUser = line.startsWith("You:") || isRollResult(line);
                const content = line.replace(/^You:\s?|^DM:\s?/, "");

                // Try to extract GPT button choices
                let buttons: string[] = [];
                let mainContent = content;

                const fullDelim = content.match(/---\s*([\s\S]*?)\s*---/);
                if (fullDelim) {
                  buttons = fullDelim[1]
                    .split(/\r?\n/)
                    .map((l) => l.replace(/^[-*]\s*/, "").trim())
                    .filter(Boolean);
                  mainContent = content.replace(fullDelim[0], "").trim();
                } else {
                  const linesArr = content.split(/\r?\n/);
                  const idx = linesArr.findIndex((l) => l.startsWith("- "));
                  if (idx !== -1) {
                    buttons = linesArr.slice(idx).map((l) => l.replace(/^[-*]\s*/, "").trim());
                    mainContent = linesArr.slice(0, idx).join("\n");
                  }
                }

                const rollMatch = mainContent.match(/roll\s+(\w+)/i);
                if (rollMatch && buttons.length === 0) {
                  const stat = rollMatch[1];
                  buttons.unshift(`Roll ${stat.charAt(0).toUpperCase() + stat.slice(1)}`);
                }

                return (
                  <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"} gap-1`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`max-w-[75%] px-4 py-2 rounded-lg text-sm shadow ${
                        isRollResult(line)
                          ? "bg-yellow-100 text-yellow-900 font-semibold border border-yellow-300"
                          : isUser
                          ? "bg-blue-500 text-white self-end rounded-br-none"
                          : "bg-gray-200 text-black self-start rounded-bl-none"
                      }`}
                    >
                      {mainContent.split("\n").map((p, pi) => (
                        <p key={pi}>{p}</p>
                      ))}
                    </motion.div>

                    {/* GPT-generated choices rendered as buttons with fade transition */}
                    <AnimatePresence>
                      {!isUser && i === lastButtonsIndex && buttons.length > 0 && (
                        <motion.div
                          key={`buttons-${i}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-wrap gap-2 mt-1"
                        >
                          {buttons.map((b, idx2) => (
                            <Button
                              key={idx2}
                              variant="outline"
                              size="sm"
                              className="cursor-pointer rounded-full px-3 py-1 text-xs bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition"
                              onClick={async () => {
                                const statMatch = b.toLowerCase().match(/roll (.+)/);
                                const stat = statMatch?.[1]?.toLowerCase();
                                if (stat) {
                                  setLoading(true);
                                  try {
                                    const rollRes = await fetch("http://localhost:5000/api/v1/roll", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ stat, chatId }),
                                    });

                                    const rollData = await rollRes.json();
                                    const { total, breakdown } = rollData;

                                    setChat((prev) => [
                                      ...prev,
                                      `Rolling: ${breakdown}`,
                                      `You rolled a ${total} on ${stat}`,
                                    ]);

                                    const res2 = await fetch("http://localhost:5000/api/v1/chat", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        username: "Player1",
                                        action: `Rolled ${total} on ${stat}`,
                                        chatId,
                                      }),
                                    });

                                    const data2 = await res2.json();
                                    if (data2.reply) {
                                      setChat((prev) => [...prev, `DM: ${data2.reply}`]);
                                      try {
                                        const res = await fetch(`http://localhost:5000/api/v1/character?chatid=${chatId}`);
                                        const data = await res.json();
                                        setCharacter(data.character);
                                      } catch (err) {
                                        console.error("Failed to refresh character stats", err);
                                      }
                                      console.log("Button reply:", data2.reply);
                                    }
                                    if (data2.ko) {
                                      setIsKO(true);
                                      setChat((prev) => [...prev, "You have been knocked out. Game over."]);
                                    }
                                  } catch (err) {
                                    setChat((prev) => [...prev, "Roll failed"]);
                                    console.error(err);
                                  } finally {
                                    setLoading(false);
                                  }
                                } else {
                                  setInput(b);
                                  setTimeout(() => sendMessage(), 100);
                                }
                              }}
                            >
                              {b}
                            </Button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="self-start text-sm text-muted-foreground italic"
                >
                  DM is thinking...
                </motion.div>
              )}
            </div>

            {/* Input box and send button */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={isKO ? "You're unconscious..." : "What do you do?"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={isKO}
              />
              <Button onClick={sendMessage} className="px-4 py-2" disabled={loading || isKO}>
                Send
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
