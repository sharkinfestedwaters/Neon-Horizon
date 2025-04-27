import React from "react";
import { useCharacter } from "@/context/CharacterContext";
import { statsConfig } from "@/utils/characterUtils";
import { Button } from "@/components/ui/button";
import { StatName } from "@/types/character";

export default function StatsSection() {
  const { character, totalStats, incrementStat, decrementStat } = useCharacter();

  return (
    <div className="neo-border bg-[#141626] rounded-lg p-6">
      <h2 className="font-['Orbitron'] text-xl text-[#00E5FF] mb-6 pb-2 border-b border-[#00A3FF]/30">
        CORE STATS
      </h2>

      <div className="space-y-4">
        {statsConfig.map((stat) => {
          const baseValue = character.baseStats[stat.name];
          const totalValue = totalStats[stat.name];
          const hasBonus = totalValue > baseValue;
          
          return (
            <div key={stat.name} className="stat-row" data-stat={stat.name}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium">{stat.label}</label>
                <div className="text-xs text-gray-400">{stat.description}</div>
              </div>
              <div className="flex items-center">
                <Button
                  onClick={() => decrementStat(stat.name)}
                  className="w-8 h-8 rounded-l border border-[#00A3FF]/30 bg-[#1E2138] text-[#00E5FF] hover:bg-[#00A3FF]/20 transition-colors p-0"
                >
                  -
                </Button>
                <div 
                  className={`w-12 h-8 bg-[#1E2138] border-y border-[#00A3FF]/30 flex items-center justify-center text-center ${
                    hasBonus ? "text-[#8A7AFF]" : "text-[#00E5FF]"
                  } font-['Orbitron']`}
                >
                  {baseValue}{hasBonus && `+${totalValue - baseValue}`}
                </div>
                <Button
                  onClick={() => incrementStat(stat.name)}
                  className="w-8 h-8 rounded-r border border-[#00A3FF]/30 bg-[#1E2138] text-[#00E5FF] hover:bg-[#00A3FF]/20 transition-colors p-0"
                >
                  +
                </Button>

                <div className="stat-bar ml-4 flex-1 h-2 bg-[#1E2138] rounded overflow-hidden">
                  <div
                    className="h-full bg-[#00A3FF]"
                    style={{ width: `${(totalValue / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
