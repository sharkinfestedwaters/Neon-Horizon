import React from "react";
import { useCharacter } from "@/context/CharacterContext";
import { races } from "@/utils/characterUtils";
import { RaceName } from "@/types/character";
import { Check } from "lucide-react";

export default function RaceSection() {
  const { character, selectRace } = useCharacter();
  
  return (
    <div className="neo-border bg-[#141626] rounded-lg p-6">
      <h2 className="font-['Orbitron'] text-xl text-[#00E5FF] mb-6 pb-2 border-b border-[#00A3FF]/30">
        SPECIES
      </h2>

      <div className="space-y-3">
        {Object.values(races).map((race) => (
          <div
            key={race.id}
            className={`race-option cursor-pointer rounded border ${
              character.race === race.id
                ? "border-[#00E5FF]/60 bg-[#1E2138]"
                : "border-[#00A3FF]/30"
            } p-3 transition-all hover:border-[#00E5FF]/60 hover:bg-[#1E2138]`}
            onClick={() => selectRace(race.id)}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-['Orbitron'] text-white">{race.name}</h3>
              <span className={`race-check text-[#00E5FF] ${character.race === race.id ? "opacity-100" : "opacity-0"}`}>
                <Check size={16} />
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{race.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
