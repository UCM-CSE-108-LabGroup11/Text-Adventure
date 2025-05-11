export default function CharacterSheet({ character }: { character: any }) {
    // helper to show a stat bar (health/mana/xp/etc)
    const statBar = (label: string, value: number, max: number, color: string) => (
      <div className="mb-2">
        <div className="text-sm font-medium">{label}: {value}/{max}</div>
        <div className="w-full bg-gray-300 rounded h-3">
          <div
            className={`h-3 rounded ${color}`}
            style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
          />
        </div>
      </div>
    );
  
    return (
      <div className="p-4 bg-white rounded shadow border">
        {/* basic info at the top */}
        <h2 className="text-lg font-bold mb-2">Character Sheet</h2>
        <p><strong>Name:</strong> {character.name}</p>
        <p><strong>Class:</strong> {character.char_class}</p>
        <p><strong>Level:</strong> {character.level}</p>
  
        <div className="mt-4">
          {/* stat bars with rough max values (can tweak later) */}
          {statBar("Health", character.health, 100, "bg-red-500")}
          {statBar("Mana", character.mana, 50, "bg-blue-500")}
          {statBar("XP", character.xp, character.level * 100, "bg-purple-500")}
  
          {/* basic strength display (no bar for now) */}
          <p><strong>Strength:</strong> {character.strength}</p>
        </div>
      </div>
    );
  }
  