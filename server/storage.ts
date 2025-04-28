import { 
  users, type User, type InsertUser,
  characters, type Character, type InsertCharacter, type UpdateCharacter,
  userProfiles, type UserProfile, type InsertUserProfile, type UpdateUserProfile,
  gameSettings, type GameSetting, type InsertGameSetting, type UpdateGameSetting,
  races, type Race, type InsertRace, type UpdateRace,
  features, type Feature, type InsertFeature, type UpdateFeature,
  items, type Item, type InsertItem, type UpdateItem,
  skills, type Skill, type InsertSkill, type UpdateSkill,
  characterInventory, type CharacterInventory, type InsertCharacterInventory, type UpdateCharacterInventory,
  characterSkills, type CharacterSkill, type InsertCharacterSkill, type UpdateCharacterSkill
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Character methods
  getCharacter(id: number): Promise<Character | undefined>;
  getCharactersByUserId(userId: number): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, character: UpdateCharacter): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;
  
  // User profile methods
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, profile: UpdateUserProfile): Promise<UserProfile | undefined>;
  
  // Game settings methods
  getGameSetting(key: string): Promise<GameSetting | undefined>;
  getAllGameSettings(): Promise<GameSetting[]>;
  updateGameSetting(key: string, value: UpdateGameSetting): Promise<GameSetting | undefined>;
  
  // Race methods
  getRace(id: number): Promise<Race | undefined>;
  getAllRaces(): Promise<Race[]>;
  createRace(race: InsertRace): Promise<Race>;
  updateRace(id: number, race: UpdateRace): Promise<Race | undefined>;
  deleteRace(id: number): Promise<boolean>;
  
  // Feature methods
  getFeature(id: number): Promise<Feature | undefined>;
  getAllFeatures(): Promise<Feature[]>;
  createFeature(feature: InsertFeature): Promise<Feature>;
  updateFeature(id: number, feature: UpdateFeature): Promise<Feature | undefined>;
  deleteFeature(id: number): Promise<boolean>;
  
  // Item methods
  getItem(id: number): Promise<Item | undefined>;
  getAllItems(): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: UpdateItem): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;
  
  // Character inventory methods
  getCharacterInventory(characterId: number): Promise<CharacterInventory[]>;
  addItemToInventory(item: InsertCharacterInventory): Promise<CharacterInventory>;
  updateInventoryItem(id: number, item: UpdateCharacterInventory): Promise<CharacterInventory | undefined>;
  removeFromInventory(id: number): Promise<boolean>;
  
  // Skill methods
  getSkill(id: number): Promise<Skill | undefined>;
  getAllSkills(): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: UpdateSkill): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;
  
  // Character skills methods
  getCharacterSkills(characterId: number): Promise<CharacterSkill[]>;
  addSkillToCharacter(skill: InsertCharacterSkill): Promise<CharacterSkill>;
  updateCharacterSkill(id: number, skill: UpdateCharacterSkill): Promise<CharacterSkill | undefined>;
  removeSkillFromCharacter(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Character methods
  async getCharacter(id: number): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character;
  }

  async getCharactersByUserId(userId: number): Promise<Character[]> {
    return db.select()
      .from(characters)
      .where(eq(characters.userId, userId))
      .orderBy(desc(characters.updatedAt));
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const [newCharacter] = await db
      .insert(characters)
      .values(character)
      .returning();
    return newCharacter;
  }

  async updateCharacter(id: number, character: UpdateCharacter): Promise<Character | undefined> {
    const [updatedCharacter] = await db
      .update(characters)
      .set(character)
      .where(eq(characters.id, id))
      .returning();
    return updatedCharacter;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    const result = await db.delete(characters).where(eq(characters.id, id));
    return true; // If no error was thrown, the deletion was successful
  }
  
  // User profile methods
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }
  
  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }
  
  async updateUserProfile(userId: number, profile: UpdateUserProfile): Promise<UserProfile | undefined> {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set(profile)
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }
  
  // Game settings methods
  async getGameSetting(key: string): Promise<GameSetting | undefined> {
    const [setting] = await db.select().from(gameSettings).where(eq(gameSettings.settingKey, key));
    return setting;
  }
  
  async getAllGameSettings(): Promise<GameSetting[]> {
    return db.select().from(gameSettings);
  }
  
  async updateGameSetting(key: string, value: UpdateGameSetting): Promise<GameSetting | undefined> {
    const [updatedSetting] = await db
      .update(gameSettings)
      .set(value)
      .where(eq(gameSettings.settingKey, key))
      .returning();
    return updatedSetting;
  }
  
  // Race methods
  async getRace(id: number): Promise<Race | undefined> {
    const [race] = await db.select().from(races).where(eq(races.id, id));
    return race;
  }
  
  async getAllRaces(): Promise<Race[]> {
    return db.select().from(races);
  }
  
  async createRace(race: InsertRace): Promise<Race> {
    const [newRace] = await db
      .insert(races)
      .values(race)
      .returning();
    return newRace;
  }
  
  async updateRace(id: number, race: UpdateRace): Promise<Race | undefined> {
    const [updatedRace] = await db
      .update(races)
      .set(race)
      .where(eq(races.id, id))
      .returning();
    return updatedRace;
  }
  
  async deleteRace(id: number): Promise<boolean> {
    await db.delete(races).where(eq(races.id, id));
    return true;
  }
  
  // Feature methods
  async getFeature(id: number): Promise<Feature | undefined> {
    const [feature] = await db.select().from(features).where(eq(features.id, id));
    return feature;
  }
  
  async getAllFeatures(): Promise<Feature[]> {
    return db.select().from(features);
  }
  
  async createFeature(feature: InsertFeature): Promise<Feature> {
    const [newFeature] = await db
      .insert(features)
      .values(feature)
      .returning();
    return newFeature;
  }
  
  async updateFeature(id: number, feature: UpdateFeature): Promise<Feature | undefined> {
    const [updatedFeature] = await db
      .update(features)
      .set(feature)
      .where(eq(features.id, id))
      .returning();
    return updatedFeature;
  }
  
  async deleteFeature(id: number): Promise<boolean> {
    await db.delete(features).where(eq(features.id, id));
    return true;
  }
  
  // Item methods
  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }
  
  async getAllItems(): Promise<Item[]> {
    return db.select().from(items);
  }
  
  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db
      .insert(items)
      .values(item)
      .returning();
    return newItem;
  }
  
  async updateItem(id: number, item: UpdateItem): Promise<Item | undefined> {
    const [updatedItem] = await db
      .update(items)
      .set(item)
      .where(eq(items.id, id))
      .returning();
    return updatedItem;
  }
  
  async deleteItem(id: number): Promise<boolean> {
    await db.delete(items).where(eq(items.id, id));
    return true;
  }
  
  // Character inventory methods
  async getCharacterInventory(characterId: number): Promise<CharacterInventory[]> {
    return db.select()
      .from(characterInventory)
      .where(eq(characterInventory.characterId, characterId));
  }
  
  async addItemToInventory(item: InsertCharacterInventory): Promise<CharacterInventory> {
    const [newInventoryItem] = await db
      .insert(characterInventory)
      .values(item)
      .returning();
    return newInventoryItem;
  }
  
  async updateInventoryItem(id: number, item: UpdateCharacterInventory): Promise<CharacterInventory | undefined> {
    const [updatedInventoryItem] = await db
      .update(characterInventory)
      .set(item)
      .where(eq(characterInventory.id, id))
      .returning();
    return updatedInventoryItem;
  }
  
  async removeFromInventory(id: number): Promise<boolean> {
    await db.delete(characterInventory).where(eq(characterInventory.id, id));
    return true;
  }
  
  // Skill methods
  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill;
  }
  
  async getAllSkills(): Promise<Skill[]> {
    return db.select().from(skills);
  }
  
  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db
      .insert(skills)
      .values(skill)
      .returning();
    return newSkill;
  }
  
  async updateSkill(id: number, skill: UpdateSkill): Promise<Skill | undefined> {
    const [updatedSkill] = await db
      .update(skills)
      .set(skill)
      .where(eq(skills.id, id))
      .returning();
    return updatedSkill;
  }
  
  async deleteSkill(id: number): Promise<boolean> {
    await db.delete(skills).where(eq(skills.id, id));
    return true;
  }
  
  // Character skills methods
  async getCharacterSkills(characterId: number): Promise<CharacterSkill[]> {
    return db.select()
      .from(characterSkills)
      .where(eq(characterSkills.characterId, characterId));
  }
  
  async addSkillToCharacter(skill: InsertCharacterSkill): Promise<CharacterSkill> {
    const [newCharacterSkill] = await db
      .insert(characterSkills)
      .values(skill)
      .returning();
    return newCharacterSkill;
  }
  
  async updateCharacterSkill(id: number, skill: UpdateCharacterSkill): Promise<CharacterSkill | undefined> {
    const [updatedCharacterSkill] = await db
      .update(characterSkills)
      .set(skill)
      .where(eq(characterSkills.id, id))
      .returning();
    return updatedCharacterSkill;
  }
  
  async removeSkillFromCharacter(id: number): Promise<boolean> {
    await db.delete(characterSkills).where(eq(characterSkills.id, id));
    return true;
  }
}

// For backward compatibility, keep the MemStorage class
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<number, Character>;
  userCurrentId: number;
  characterCurrentId: number;

  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.userCurrentId = 1;
    this.characterCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Character methods
  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async getCharactersByUserId(userId: number): Promise<Character[]> {
    return Array.from(this.characters.values())
      .filter(character => character.userId === userId)
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async createCharacter(characterData: InsertCharacter): Promise<Character> {
    const id = this.characterCurrentId++;
    const now = new Date().toISOString();
    
    // Ensure all required fields are present
    const character: Character = { 
      id,
      name: characterData.name,
      userId: characterData.userId || null,
      level: characterData.level || 1,
      race: characterData.race || null,
      feature: characterData.feature || null,
      notes: characterData.notes || "",
      portraitImage: characterData.portraitImage || null,
      pointsAvailable: characterData.pointsAvailable || 5,
      baseStats: characterData.baseStats,
      createdAt: now,
      updatedAt: now
    };
    
    this.characters.set(id, character);
    return character;
  }

  async updateCharacter(id: number, characterData: UpdateCharacter): Promise<Character | undefined> {
    const character = this.characters.get(id);
    if (!character) return undefined;
    
    const updatedCharacter: Character = {
      ...character,
      ...characterData,
      updatedAt: new Date().toISOString()
    };
    
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    return this.characters.delete(id);
  }
  
  // User profile methods
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    // Mock implementation
    return undefined;
  }
  
  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    // Mock implementation
    return {
      id: 1,
      userId: profile.userId,
      displayName: profile.displayName || null,
      profileImage: profile.profileImage || null,
      bio: profile.bio || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  async updateUserProfile(userId: number, profile: UpdateUserProfile): Promise<UserProfile | undefined> {
    // Mock implementation
    return {
      id: 1,
      userId,
      displayName: profile.displayName || null,
      profileImage: profile.profileImage || null,
      bio: profile.bio || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  // Game settings methods
  async getGameSetting(key: string): Promise<GameSetting | undefined> {
    // Mock implementation
    return undefined;
  }
  
  async getAllGameSettings(): Promise<GameSetting[]> {
    // Mock implementation
    return [];
  }
  
  async updateGameSetting(key: string, value: UpdateGameSetting): Promise<GameSetting | undefined> {
    // Mock implementation
    return undefined;
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
