import React, { useRef, useState } from "react";
import { useCharacter } from "@/context/CharacterContext";
import { statAbbreviations, races } from "@/utils/characterUtils";
import { StatName } from "@/types/character";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function CharacterPreview() {
  const { character, totalStats, setPortraitImage } = useCharacter();
  const selectedRace = character.race ? races[character.race].name : "Select a species";
  const [uploadingPortrait, setUploadingPortrait] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Handle portrait image upload
  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    setUploadingPortrait(true);
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageDataUrl = event.target.result.toString();
        setPortraitImage(imageDataUrl);
        toast({
          title: "Portrait updated",
          description: "Your character portrait has been set",
          variant: "default"
        });
        setUploadingPortrait(false);
      }
    };
    
    reader.onerror = () => {
      setUploadingPortrait(false);
      toast({
        title: "Failed to read file",
        description: "There was an error reading the image file",
        variant: "destructive"
      });
    };
    
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="neo-border bg-[#141626] rounded-lg p-6 mt-6">
      <h2 className="font-['Orbitron'] text-xl text-[#00E5FF] mb-4 pb-2 border-b border-[#00A3FF]/30">
        CHARACTER PREVIEW
      </h2>
      
      <div className="bg-[#1E2138] p-4 rounded border border-[#00A3FF]/30">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#00A3FF]/20 flex items-center justify-center border border-[#00A3FF]/40 mb-3 overflow-hidden">
              {character.portraitImage ? (
                <img 
                  src={character.portraitImage} 
                  alt={`${character.name || "Character"} portrait`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <Camera size={24} className="text-[#00E5FF] mb-1" />
                  <span className="text-xs text-[#00E5FF]/70">No Image</span>
                </div>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePortraitUpload}
            />
            
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-black/70 text-[#00E5FF] hover:bg-[#00E5FF]/30 hover:text-white border border-[#00E5FF]/50"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPortrait}
            >
              {uploadingPortrait ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <Camera size={14} />
              )}
            </Button>
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
