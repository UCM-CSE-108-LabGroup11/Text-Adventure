import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";


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

  const { chatId } = useParams<{ chatId: string }>();

  // Ref to scroll the chat window down as new messages come in
  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  // Handles sending a message to the backend API
  const sendMessage = async () => {
    if (!input.trim()) return; // prevent sending empty messages

    const userText = input;
    setChat((prev) => [...prev, `You: ${userText}`]); // instantly show user input
    setInput(""); // clear the input box
    setLoading(true); // show loading state

    try {
      // Send POST request to backend
      const res = await fetch("http://localhost:5000/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Player1", // TODO: replace with logged-in user's username
          message: userText,
          provider,
          chatId, 
        }),
      });

      const data = await res.json();

      // Append DM's reply to chat log
      if (data.reply) {
        setChat((prev) => [...prev, `DM: ${data.reply}`]);
      } else {
        setChat((prev) => [...prev, `Error: ${data.error || "Unknown error"}`]);
      }
    } catch {
      // Network failure or server error
      setChat((prev) => [...prev, "Network error"]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to the bottom of the chat on new message
  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [chat, loading]);

  return (
    <motion.div
      className="min-h-screen bg-background text-foreground px-4 py-8 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Header />

      {/* Chat log with animated message bubbles */}
      <div
        ref={chatBoxRef}
        className="bg-card border rounded p-4 h-96 overflow-y-auto mb-4 shadow-inner flex flex-col gap-2"
      >
        {chat.map((line, i) => {
          const isUser = line.startsWith("You:");
          const content = line.replace(/^You:\s?|^DM:\s?/, "");

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`max-w-[75%] px-4 py-2 rounded-lg text-sm shadow ${
                isUser
                  ? "self-end bg-blue-500 text-white"
                  : "self-start bg-gray-200 text-black"
              }`}
            >
              {content}
            </motion.div>
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
          placeholder="What do you do?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <Button onClick={sendMessage} className="px-4 py-2" disabled={loading}>
          Send
        </Button>
      </div>
    </motion.div>
  );
}
