import { 
  users, type User, type InsertUser,
  characters, type Character, type InsertCharacter, type UpdateCharacter
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
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async createCharacter(characterData: InsertCharacter): Promise<Character> {
    const id = this.characterCurrentId++;
    const now = new Date().toISOString();
    const character: Character = { 
      ...characterData, 
      id,
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
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
