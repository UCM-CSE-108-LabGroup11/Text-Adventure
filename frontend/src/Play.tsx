import { useState } from "react";
export default function Play() {

  // Stores the ongoing chat log as an array of message strings (might change idk)
  const [chat, setChat] = useState<string[]>([]);
  // Tracks current input from the user
  const [input, setInput] = useState("");
  // Stores the OpenAI API key (optional user-provided)
  const [apiKey, setApiKey] = useState("");
  // Tracks the current selected provider (only gpt is supported for now)
  const [provider, setProvider] = useState("openai");

  // Handles sending a message to the backend API
  const sendMessage = async () => {
    if (!input.trim()) return; // prevent sending empty messages

    const userText = input;

    // Show user's message immediately in the chat window
    setChat((prev) => [...prev, `You: ${userText}`]);
    setInput(""); // clear the input box

    try {
      // POST request to the backend
      const res = await fetch("http://localhost:5000/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Player1", // TODO: make this dynamic with useState
          message: userText,
          apiKey,
          provider,
        }),
      });

      const data = await res.json();

      // Show response from the AI Dungeon Master
      if (data.reply) {
        setChat((prev) => [...prev, `DM: ${data.reply}`]);
      } else {
        setChat((prev) => [...prev, `Error: ${data.error || "Unknown error"}`]);
      }
    } catch {
      // Handle fetch failure (e.g. server offline)
      setChat((prev) => [...prev, "Network error"]);
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h2>Solo Adventure</h2>

      {/* Input for OpenAI key and provider selection */}
      <div style={{ marginBottom: "0.5rem" }}>
        <input
          type="text"
          placeholder="Your OpenAI key (optional)"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{ width: "320px", marginRight: "10px" }}
        />
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="openai">OpenAI</option>
          <option value="dummy">Fake (no key)</option> {/* Future placeholder/test option */}
        </select>
      </div>

      {/* Chat window display */}
      <div style={{
        background: "#f8f8f8",
        padding: "1rem",
        height: "300px",
        overflowY: "auto",
        marginBottom: "1rem",
        border: "1px solid #ccc"
      }}>
        {chat.map((line, i) => (
          <div key={i} style={{ marginBottom: "0.5rem" }}>{line}</div>
        ))}
      </div>

      {/* User input and send button */}
      <input
        type="text"
        placeholder="What do you do?"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        style={{ width: "70%", marginRight: "10px" }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}