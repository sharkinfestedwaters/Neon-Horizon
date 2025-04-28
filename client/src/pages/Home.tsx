import React from "react";
import CharacterSheet from "@/components/CharacterSheet";
import CharacterList from "@/components/CharacterList";
import Notification from "@/components/Notification";

export default function Home() {
  return (
    <div className="bg-[#080A14] min-h-screen grid-bg text-white font-sans relative">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-cyan-400 tracking-tight">Neon Horizons</h1>
          <p className="text-cyan-300/70">Character Creator</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CharacterList />
          </div>
          <div className="lg:col-span-2">
            <CharacterSheet />
          </div>
        </div>
      </div>
      <Notification />
    </div>
  );
}
