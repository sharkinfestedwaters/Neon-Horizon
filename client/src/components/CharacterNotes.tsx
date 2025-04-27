import React from "react";
import { useCharacter } from "@/context/CharacterContext";
import { Textarea } from "@/components/ui/textarea";

export default function CharacterNotes() {
  const { character, setNotes } = useCharacter();
  
  return (
    <div className="neo-border bg-[#141626] rounded-lg p-6 mt-6">
      <h2 className="font-['Orbitron'] text-xl text-[#00E5FF] mb-4 pb-2 border-b border-[#00A3FF]/30">
        CHARACTER NOTES
      </h2>
      
      <Textarea
        value={character.notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full h-32 bg-[#1E2138] border border-[#00A3FF]/30 rounded p-3 text-white focus:outline-none focus:border-[#00E5FF]/60 resize-none focus-visible:ring-0"
        placeholder="Add notes about your character here..."
      />
    </div>
  );
}
