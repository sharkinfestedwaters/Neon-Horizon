import { Character, Stats, Race, Feature, StatName, RaceName, FeatureName, StatInfo } from "@/types/character";

// Stats configuration
export const statsConfig: StatInfo[] = [
  { name: "strength", label: "STRENGTH", description: "Physical power" },
  { name: "agility", label: "AGILITY", description: "Speed and reflexes" },
  { name: "intelligence", label: "INTELLIGENCE", description: "Knowledge and reasoning" },
  { name: "perception", label: "PERCEPTION", description: "Awareness of surroundings" },
  { name: "charisma", label: "CHARISMA", description: "Social influence" },
  { name: "willpower", label: "WILLPOWER", description: "Mental fortitude" },
  { name: "endurance", label: "ENDURANCE", description: "Physical stamina" },
  { name: "luck", label: "LUCK", description: "Fortune and chance" },
];

// Map stat names to abbreviations for the preview
export const statAbbreviations: Record<StatName, string> = {
  strength: "STR",
  agility: "AGI",
  intelligence: "INT",
  perception: "PER",
  charisma: "CHA",
  willpower: "WIL",
  endurance: "END",
  luck: "LUK",
};

// Races with their bonuses
export const races: Record<RaceName, Race> = {
  human: {
    id: "human",
    name: "HUMAN",
    description: "Adaptive and resourceful, +1 to all stats",
    bonuses: {
      strength: 1,
      agility: 1,
      intelligence: 1,
      perception: 1,
      charisma: 1,
      willpower: 1,
      endurance: 1,
      luck: 1,
    },
  },
  android: {
    id: "android",
    name: "ANDROID",
    description: "Synthetic intelligences, +2 to Intelligence, +2 to Endurance",
    bonuses: {
      intelligence: 2,
      endurance: 2,
    },
  },
  moai: {
    id: "moai",
    name: "MOAI",
    description: "Stone-skinned ancient race, +3 to Strength, +2 to Willpower",
    bonuses: {
      strength: 3,
      willpower: 2,
    },
  },
  aquarian: {
    id: "aquarian",
    name: "AQUARIAN",
    description: "Oceanic adaptives, +2 to Agility, +2 to Perception",
    bonuses: {
      agility: 2,
      perception: 2,
    },
  },
  martian: {
    id: "martian",
    name: "MARTIAN",
    description: "Red planet natives, +2 to Intelligence, +2 to Charisma",
    bonuses: {
      intelligence: 2,
      charisma: 2,
    },
  },
};

// Features with their bonuses
export const features: Record<FeatureName, Feature> = {
  "neura-link": {
    id: "neura-link",
    name: "NEURA-LINK",
    description: "Neural interface allowing direct connection to networks. +2 Intelligence bonus.",
    bonuses: {
      intelligence: 2,
    },
  },
  retnihud: {
    id: "retnihud",
    name: "RETNIHUD",
    description: "Retinal heads-up display providing environmental data. +2 Perception bonus.",
    bonuses: {
      perception: 2,
    },
  },
  "field-pin": {
    id: "field-pin",
    name: "FIELD-PIN",
    description: "Micro-gravity manipulator allowing enhanced movement. +2 Agility bonus.",
    bonuses: {
      agility: 2,
    },
  },
  paincutter: {
    id: "paincutter",
    name: "PAINCUTTER",
    description: "Neural pain inhibitor to enhance combat durability. +2 Endurance bonus.",
    bonuses: {
      endurance: 2,
    },
  },
  "metallic-spine": {
    id: "metallic-spine",
    name: "METALLIC SPINE",
    description: "Reinforced skeletal structure increasing physical power. +2 Strength bonus.",
    bonuses: {
      strength: 2,
    },
  },
};

// Calculate total stats (base + race + feature)
export const calculateTotalStats = (character: Character): Stats => {
  // Start with base stats
  const totalStats = { ...character.baseStats };

  // Add race bonuses if selected
  if (character.race && races[character.race]) {
    const raceBonuses = races[character.race].bonuses;
    for (const stat in raceBonuses) {
      totalStats[stat as StatName] += raceBonuses[stat as StatName] || 0;
    }
  }

  // Add feature bonuses if selected
  if (character.feature && features[character.feature]) {
    const featureBonuses = features[character.feature].bonuses;
    for (const stat in featureBonuses) {
      totalStats[stat as StatName] += featureBonuses[stat as StatName] || 0;
    }
  }

  // Cap stats at 10
  for (const stat in totalStats) {
    if (totalStats[stat as StatName] > 10) {
      totalStats[stat as StatName] = 10;
    }
  }

  return totalStats;
};
