import React from "react";
import { useCharacter } from "@/context/CharacterContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CharacterInfoBar() {
  const { 
    character, 
    setName, 
    levelUp, 
    saveCharacter,
    resetCharacter
  } = useCharacter();

  return (
    <div className="neo-border bg-[#141626] rounded-lg p-4 mb-8 flex flex-col md:flex-row justify-between items-center">
      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
        <div className="w-full md:w-1/3">
          <label className="block text-sm text-gray-400 mb-1">CHARACTER NAME</label>
          <Input
            type="text"
            value={character.name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1E2138] border border-[#00A3FF]/30 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00E5FF] focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Enter name..."
          />
        </div>
        <div className="w-full md:w-1/3 flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm text-gray-400 mb-1">LEVEL</label>
            <div className="flex items-center">
              <span className="font-['Orbitron'] text-2xl text-[#00E5FF] font-bold">
                {character.level}
              </span>
              <Button
                onClick={levelUp}
                className="ml-2 bg-[#00A3FF]/20 hover:bg-[#00A3FF]/30 text-[#00E5FF] px-2 py-1 rounded transition h-8"
              >
                +
              </Button>
            </div>
          </div>
          <div className="w-1/2">
            <label className="block text-sm text-gray-400 mb-1">POINTS</label>
            <div className="font-['Orbitron'] text-2xl">
              <span className="text-[#8A7AFF] font-bold">{character.pointsAvailable}</span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/3 mt-4 md:mt-0 flex gap-2">
          <Button
            onClick={saveCharacter}
            className="flex-1 bg-[#00A3FF]/20 hover:bg-[#00A3FF]/40 text-[#00E5FF] border border-[#00A3FF]/40 rounded py-2 px-4 transition-all h-10"
          >
            SAVE CHARACTER
          </Button>
          <Button
            onClick={resetCharacter}
            className="bg-[#FF4560]/20 hover:bg-[#FF4560]/40 text-[#FF4560] border border-[#FF4560]/40 rounded py-2 px-2 transition-all h-10"
          >
            RESET
          </Button>
        </div>
      </div>
    </div>
  );
}
