import React from "react";
import { useCharacter } from "@/context/CharacterContext";
import { statAbbreviations, races } from "@/utils/characterUtils";
import { StatName } from "@/types/character";

export default function CharacterPreview() {
  const { character, totalStats } = useCharacter();
  const selectedRace = character.race ? races[character.race].name : "Select a species";
  
  return (
    <div className="neo-border bg-[#141626] rounded-lg p-6 mt-6">
      <h2 className="font-['Orbitron'] text-xl text-[#00E5FF] mb-4 pb-2 border-b border-[#00A3FF]/30">
        CHARACTER PREVIEW
      </h2>
      
      <div className="bg-[#1E2138] p-4 rounded border border-[#00A3FF]/30">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#00A3FF]/20 flex items-center justify-center border border-[#00A3FF]/40 mb-3">
            <span className="text-4xl text-[#00E5FF]">?</span>
          </div>
          <h3 className="font-['Orbitron'] text-lg text-white">
            {character.name || "Unnamed"}
          </h3>
          <div className="text-sm text-gray-400 mb-2">{selectedRace}</div>
          
          <div className="grid grid-cols-4 gap-2 w-full mt-2">
            {(Object.keys(totalStats) as StatName[]).map((stat) => (
              <div key={stat} className="text-center">
                <div className="text-xs text-gray-400">{statAbbreviations[stat]}</div>
                <div className="font-['Orbitron'] text-[#00E5FF]">{totalStats[stat]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
