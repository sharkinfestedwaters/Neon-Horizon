import React from "react";
import { useCharacter } from "@/context/CharacterContext";
import { features } from "@/utils/characterUtils";
import { Check } from "lucide-react";

export default function FeaturesSection() {
  const { character, selectFeature } = useCharacter();
  
  return (
    <div className="neo-border bg-[#141626] rounded-lg p-6">
      <h2 className="font-['Orbitron'] text-xl text-[#00E5FF] mb-6 pb-2 border-b border-[#00A3FF]/30">
        KEY FEATURES
      </h2>

      <div className="space-y-3">
        {Object.values(features).map((feature) => (
          <div
            key={feature.id}
            className={`feature-option cursor-pointer rounded border ${
              character.feature === feature.id
                ? "border-[#00E5FF]/60 bg-[#1E2138]"
                : "border-[#00A3FF]/30"
            } p-3 transition-all hover:border-[#00E5FF]/60 hover:bg-[#1E2138]`}
            onClick={() => selectFeature(feature.id)}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-['Orbitron'] text-white">{feature.name}</h3>
              <span className={`feature-check text-[#00E5FF] ${character.feature === feature.id ? "opacity-100" : "opacity-0"}`}>
                <Check size={16} />
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
