import React, { createContext, useContext, useState, useEffect } from "react";
import { Character, Stats, RaceName, FeatureName, StatName } from "@/types/character";
import { races, features, calculateTotalStats } from "@/utils/characterUtils";
import { useToast } from "@/hooks/use-toast";

// Initial character state
const initialStats: Stats = {
  strength: 1,
  agility: 1,
  intelligence: 1,
  perception: 1,
  charisma: 1,
  willpower: 1,
  endurance: 1,
  luck: 1,
};

const initialCharacter: Character = {
  name: "",
  level: 1,
  baseStats: initialStats,
  race: null,
  feature: null,
  notes: "",
  pointsAvailable: 5,
};

interface CharacterContextProps {
  character: Character;
  totalStats: Stats;
  setName: (name: string) => void;
  setNotes: (notes: string) => void;
  incrementStat: (stat: StatName) => void;
  decrementStat: (stat: StatName) => void;
  selectRace: (race: RaceName | null) => void;
  selectFeature: (feature: FeatureName | null) => void;
  levelUp: () => void;
  saveCharacter: () => void;
  resetCharacter: () => void;
}

const CharacterContext = createContext<CharacterContextProps | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const { toast } = useToast();

  // Load character from localStorage on initial render
  useEffect(() => {
    const savedCharacter = localStorage.getItem("character");
    if (savedCharacter) {
      try {
        setCharacter(JSON.parse(savedCharacter));
      } catch (error) {
        console.error("Failed to parse saved character:", error);
      }
    }
  }, []);

  // Calculate total stats with race and feature bonuses
  const totalStats = calculateTotalStats(character);

  const setName = (name: string) => {
    setCharacter(prev => ({ ...prev, name }));
  };

  const setNotes = (notes: string) => {
    setCharacter(prev => ({ ...prev, notes }));
  };

  const incrementStat = (stat: StatName) => {
    if (character.pointsAvailable <= 0) {
      toast({
        title: "No points available",
        description: "Level up to gain more stat points",
        variant: "destructive",
      });
      return;
    }

    if (character.baseStats[stat] >= 10) {
      toast({
        title: "Stat maxed out",
        description: "Stats cannot exceed 10",
        variant: "destructive",
      });
      return;
    }

    setCharacter(prev => ({
      ...prev,
      baseStats: {
        ...prev.baseStats,
        [stat]: prev.baseStats[stat] + 1,
      },
      pointsAvailable: prev.pointsAvailable - 1,
    }));
  };

  const decrementStat = (stat: StatName) => {
    if (character.baseStats[stat] <= 1) {
      toast({
        title: "Stat at minimum",
        description: "Stats cannot be lower than 1",
        variant: "destructive",
      });
      return;
    }

    setCharacter(prev => ({
      ...prev,
      baseStats: {
        ...prev.baseStats,
        [stat]: prev.baseStats[stat] - 1,
      },
      pointsAvailable: prev.pointsAvailable + 1,
    }));
  };

  const selectRace = (race: RaceName | null) => {
    setCharacter(prev => ({ ...prev, race }));
  };

  const selectFeature = (feature: FeatureName | null) => {
    setCharacter(prev => ({ ...prev, feature }));
  };

  const levelUp = () => {
    setCharacter(prev => ({
      ...prev,
      level: prev.level + 1,
      pointsAvailable: prev.pointsAvailable + 3,
    }));

    toast({
      title: "Level up!",
      description: `You gained 3 stat points. New level: ${character.level + 1}`,
    });
  };

  const saveCharacter = () => {
    // Validate character
    if (!character.name.trim()) {
      toast({
        title: "Missing character name",
        description: "Please enter a character name before saving",
        variant: "destructive",
      });
      return;
    }

    if (!character.race) {
      toast({
        title: "Missing species",
        description: "Please select a species for your character",
        variant: "destructive",
      });
      return;
    }

    if (!character.feature) {
      toast({
        title: "Missing key feature",
        description: "Please select a key feature for your character",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage
    localStorage.setItem("character", JSON.stringify(character));
    
    toast({
      title: "Character saved",
      description: "Your character has been saved successfully",
    });
  };

  const resetCharacter = () => {
    setCharacter(initialCharacter);
    localStorage.removeItem("character");
    toast({
      title: "Character reset",
      description: "Your character has been reset to defaults",
    });
  };

  return (
    <CharacterContext.Provider
      value={{
        character,
        totalStats,
        setName,
        setNotes,
        incrementStat,
        decrementStat,
        selectRace,
        selectFeature,
        levelUp,
        saveCharacter,
        resetCharacter,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error("useCharacter must be used within a CharacterProvider");
  }
  return context;
};
