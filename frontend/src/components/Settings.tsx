import { useGPTKey } from "../GPTKeyContext";
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "@/components/ui/button";

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { apiKey, setApiKey } = useGPTKey();
  const [tempKey, setTempKey] = useState(apiKey || "");
  const [showKey, setShowKey] = useState(false); // 👈 show/hide state

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white relative rounded-lg p-6 w-full max-w-md shadow">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-200/70 hover:bg-gray-300 text-gray-800 hover:text-black flex items-center justify-center font-bold transition"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-xl font-bold mb-2">GPT API Key</h2>
        <p className="text-sm text-muted mb-3">
          This key is stored in memory only. It will be forgotten when you refresh or close the tab.
        </p>

        <div className="relative">
          <input
            type={showKey ? "text" : "password"} // 👈 masked unless toggled
            placeholder="sk-..."
            className="w-full px-3 py-2 border rounded pr-14"
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
          />
          <button
            type="button"
            className="absolute top-0 right-0 h-full px-3 text-sm text-blue-600 hover:underline"
            onClick={() => setShowKey((prev) => !prev)}
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>

        <Button
          className="mt-4 w-full"
          onClick={() => {
            setApiKey(tempKey);
            onClose();
          }}
        >
          Save for Session
        </Button>
      </div>
    </Dialog>
  );
}
