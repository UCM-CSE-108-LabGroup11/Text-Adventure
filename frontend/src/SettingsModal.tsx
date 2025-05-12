import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  const saveKey = async () => {
    setStatus("idle");
    const res = await fetch("/api/v1/user/key", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    if (res.ok) {
      setStatus("saved");
      setTimeout(() => onClose(), 1000);
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <motion.div
        className="bg-white rounded-lg p-6 shadow max-w-md w-full relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.3 }}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-black font-bold"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-4">Set your OpenAI API key</h2>

        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-..."
          className="w-full px-3 py-2 border rounded shadow-sm mb-4"
        />

        {status === "saved" && (
          <p className="text-green-600 text-sm mb-2">Key saved!</p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-sm mb-2">Invalid key or error saving.</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={saveKey} disabled={!key.startsWith("sk-")}>
            Save
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
