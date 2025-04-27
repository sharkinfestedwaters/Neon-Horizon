import React from "react";
import CharacterSheet from "@/components/CharacterSheet";
import Notification from "@/components/Notification";

export default function Home() {
  return (
    <div className="bg-[#080A14] min-h-screen grid-bg text-white font-sans relative">
      <CharacterSheet />
      <Notification />
    </div>
  );
}
