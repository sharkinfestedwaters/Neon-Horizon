import React, { createContext, useContext, useState, useEffect } from "react";
import { Character, Stats, RaceName, FeatureName, StatName } from "@/types/character";
import { races, features, calculateTotalStats } from "@/utils/characterUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";

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

// Types for database operations
interface DatabaseCharacter {
  id: number;
  userId: number | null;
  name: string;
  level: number;
  race: string | null;
  feature: string | null;
  notes: string;
  pointsAvailable: number;
  baseStats: Stats;
  createdAt: string;
  updatedAt: string;
}

interface CharacterContextProps {
  character: Character;
  totalStats: Stats;
  characters: DatabaseCharacter[];
  isLoading: boolean;
  activeCharacterId: number | null;
  setName: (name: string) => void;
  setNotes: (notes: string) => void;
  incrementStat: (stat: StatName) => void;
  decrementStat: (stat: StatName) => void;
  selectRace: (race: RaceName | null) => void;
  selectFeature: (feature: FeatureName | null) => void;
  levelUp: () => void;
  saveCharacter: () => void;
  resetCharacter: () => void;
  loadCharacter: (id: number) => void;
  deleteCharacter: (id: number) => void;
}

const CharacterContext = createContext<CharacterContextProps | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [activeCharacterId, setActiveCharacterId] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch characters from the API
  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['/api/characters'],
    onError: (error) => {
      console.error('Failed to fetch characters:', error);
      toast({
        title: "Failed to load characters",
        description: "Couldn't retrieve your characters from the database",
        variant: "destructive",
      });
    }
  });

  // Create character mutation
  const createCharacterMutation = useMutation({
    mutationFn: async (newCharacter: Omit<Character, 'id'>) => {
      const response = await apiRequest('POST', '/api/characters', newCharacter);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Character saved",
        description: "Your character has been saved to the database",
      });
      setActiveCharacterId(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
    },
    onError: (error) => {
      console.error('Failed to save character:', error);
      toast({
        title: "Failed to save character",
        description: "An error occurred while saving your character",
        variant: "destructive",
      });
    }
  });

  // Update character mutation
  const updateCharacterMutation = useMutation({
    mutationFn: async ({ id, character }: { id: number, character: Omit<Character, 'id'> }) => {
      const response = await apiRequest('PUT', `/api/characters/${id}`, character);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Character updated",
        description: "Your character has been updated in the database",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
    },
    onError: (error) => {
      console.error('Failed to update character:', error);
      toast({
        title: "Failed to update character",
        description: "An error occurred while updating your character",
        variant: "destructive",
      });
    }
  });

  // Delete character mutation
  const deleteCharacterMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/characters/${id}`);
      return id;
    },
    onSuccess: (id) => {
      toast({
        title: "Character deleted",
        description: "Your character has been deleted from the database",
      });
      if (activeCharacterId === id) {
        setActiveCharacterId(null);
        setCharacter(initialCharacter);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
    },
    onError: (error) => {
      console.error('Failed to delete character:', error);
      toast({
        title: "Failed to delete character",
        description: "An error occurred while deleting your character",
        variant: "destructive",
      });
    }
  });

  // Load from localStorage on initial render (for backward compatibility)
  useEffect(() => {
    const savedCharacter = localStorage.getItem("character");
    if (savedCharacter && characters.length === 0) {
      try {
        setCharacter(JSON.parse(savedCharacter));
        toast({
          title: "Character loaded from local storage",
          description: "Your character has been loaded from your browser",
        });
      } catch (error) {
        console.error("Failed to parse saved character:", error);
      }
    }
  }, [characters.length]);

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

    // For backward compatibility, also save to localStorage
    localStorage.setItem("character", JSON.stringify(character));
    
    // Save to the database
    if (activeCharacterId) {
      // Update existing character
      updateCharacterMutation.mutate({ 
        id: activeCharacterId, 
        character: {
          name: character.name,
          level: character.level,
          race: character.race,
          feature: character.feature,
          notes: character.notes,
          pointsAvailable: character.pointsAvailable,
          baseStats: character.baseStats
        }
      });
    } else {
      // Create new character
      createCharacterMutation.mutate({
        name: character.name,
        level: character.level,
        race: character.race,
        feature: character.feature,
        notes: character.notes,
        pointsAvailable: character.pointsAvailable,
        baseStats: character.baseStats
      });
    }
  };

  const resetCharacter = () => {
    setCharacter(initialCharacter);
    setActiveCharacterId(null);
    localStorage.removeItem("character");
    toast({
      title: "Character reset",
      description: "Your character has been reset to defaults",
    });
  };
  
  const loadCharacter = (id: number) => {
    const characterToLoad = characters.find(c => c.id === id);
    if (!characterToLoad) {
      toast({
        title: "Character not found",
        description: "Could not find the requested character",
        variant: "destructive",
      });
      return;
    }
    
    setCharacter({
      name: characterToLoad.name,
      level: characterToLoad.level,
      race: characterToLoad.race as RaceName | null,
      feature: characterToLoad.feature as FeatureName | null,
      notes: characterToLoad.notes,
      pointsAvailable: characterToLoad.pointsAvailable,
      baseStats: characterToLoad.baseStats
    });
    
    setActiveCharacterId(id);
    
    toast({
      title: "Character loaded",
      description: `Character "${characterToLoad.name}" has been loaded`,
    });
  };
  
  const deleteCharacter = (id: number) => {
    if (window.confirm("Are you sure you want to delete this character? This action cannot be undone.")) {
      deleteCharacterMutation.mutate(id);
    }
  };

  return (
    <CharacterContext.Provider
      value={{
        character,
        totalStats,
        characters: characters as DatabaseCharacter[],
        isLoading,
        activeCharacterId,
        setName,
        setNotes,
        incrementStat,
        decrementStat,
        selectRace,
        selectFeature,
        levelUp,
        saveCharacter,
        resetCharacter,
        loadCharacter,
        deleteCharacter
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
