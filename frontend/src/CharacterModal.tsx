import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "@/components/ui/button";

export default function CharacterModal({ onSubmit }: { onSubmit: (char: any) => void }) {
  const [name, setName] = useState("");
  const [charClass, setCharClass] = useState("");
  const [backstory, setBackstory] = useState("");

  const isValid = name.trim() && charClass.trim();

  return (
    <Dialog open={true} onClose={() => {}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow">
        <h2 className="text-xl font-bold mb-4">Create Your Character</h2>
        <input
          className="w-full mb-2 border px-3 py-2 rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="w-full mb-2 border px-3 py-2 rounded"
          value={charClass}
          onChange={(e) => setCharClass(e.target.value)}
        >
          <option value="">Choose class</option>
          <option value="Warrior">Warrior</option>
          <option value="Rogue">Rogue</option>
          <option value="Mage">Mage</option>
        </select>
        <textarea
          className="w-full border px-3 py-2 rounded"
          placeholder="Backstory (optional)"
          value={backstory}
          onChange={(e) => setBackstory(e.target.value)}
        />
        <Button
          className="mt-4 w-full"
          disabled={!isValid}
          onClick={() => onSubmit({ name, charClass, backstory })}
        >
          Enter the World
        </Button>
      </div>
    </Dialog>
  );
}
