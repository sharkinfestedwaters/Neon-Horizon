export type StatName = 
  | "strength" 
  | "agility" 
  | "intelligence" 
  | "perception" 
  | "charisma" 
  | "willpower" 
  | "endurance" 
  | "luck";

export type Stats = Record<StatName, number>;

export type RaceName = "human" | "android" | "moai" | "aquarian" | "martian";

export interface Race {
  id: RaceName;
  name: string;
  description: string;
  bonuses: Partial<Stats>;
}

export type FeatureName = "neura-link" | "retnihud" | "field-pin" | "paincutter" | "metallic-spine";

export interface Feature {
  id: FeatureName;
  name: string;
  description: string;
  bonuses: Partial<Stats>;
}

export interface Character {
  name: string;
  level: number;
  baseStats: Stats;
  race: RaceName | null;
  feature: FeatureName | null;
  notes: string;
  pointsAvailable: number;
}

export interface StatInfo {
  name: StatName;
  label: string;
  description: string;
}

export interface NotificationProps {
  message: string;
  type: "info" | "success" | "warning" | "error";
}
