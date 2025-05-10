import React from "react";

export default function CharacterSheet({ character }: { character: any }) {
  if (!character) return null;

  return (
    <div className="p-4 bg-white shadow rounded border max-w-md">
      <h2 className="text-xl font-bold mb-2">Character Sheet</h2>
      <p><strong>Name:</strong> {character.name}</p>
      <p><strong>Class:</strong> {character.char_class}</p>
      <p><strong>Backstory:</strong> {character.backstory}</p>
      <p><strong>Health:</strong> {character.health}</p>
      <p><strong>Mana:</strong> {character.mana}</p>
      <p><strong>Strength:</strong> {character.strength}</p>
    </div>
  );
}
