import { 
  users, type User, type InsertUser,
  characters, type Character, type InsertCharacter, type UpdateCharacter,
  userProfiles, type UserProfile, type InsertUserProfile, type UpdateUserProfile,
  gameSettings, type GameSetting, type InsertGameSetting, type UpdateGameSetting
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
    const now = new Date().toISOString();
    const [newCharacter] = await db
      .insert(characters)
      .values({
        ...character,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newCharacter;
  }

  async updateCharacter(id: number, character: UpdateCharacter): Promise<Character | undefined> {
    const [updatedCharacter] = await db
      .update(characters)
      .set({
        ...character,
        updatedAt: new Date().toISOString()
      })
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
      .set({
        ...profile,
        updatedAt: new Date()
      })
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
      .set({
        ...value,
        updatedAt: new Date()
      })
      .where(eq(gameSettings.settingKey, key))
      .returning();
    return updatedSetting;
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
