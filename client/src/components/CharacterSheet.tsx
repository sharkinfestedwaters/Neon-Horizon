import React from "react";
import { useCharacter } from "@/context/CharacterContext";
import CharacterInfoBar from "@/components/CharacterInfoBar";
import StatsSection from "@/components/StatsSection";
import RaceSection from "@/components/RaceSection";
import FeaturesSection from "@/components/FeaturesSection";
import CharacterPreview from "@/components/CharacterPreview";
import CharacterNotes from "@/components/CharacterNotes";

export default function CharacterSheet() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-['Orbitron'] font-bold text-white mb-2">
          <span className="text-[#00E5FF]">NEON</span> HORIZONS
        </h1>
        <p className="text-gray-400 text-lg">Character Creation Interface</p>
      </header>

      <CharacterInfoBar />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Column */}
        <div className="md:col-span-1">
          <StatsSection />
        </div>

        {/* Race Column */}
        <div className="md:col-span-1">
          <RaceSection />
          <CharacterPreview />
        </div>

        {/* Features Column */}
        <div className="md:col-span-1">
          <FeaturesSection />
          <CharacterNotes />
        </div>
      </div>
    </div>
  );
}
