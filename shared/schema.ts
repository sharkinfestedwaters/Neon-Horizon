import { pgTable, text, serial, integer, boolean, jsonb, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Character table
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  level: integer("level").notNull().default(1),
  race: text("race"),
  feature: text("feature"),
  notes: text("notes").default(""),
  pointsAvailable: integer("points_available").notNull().default(5),
  baseStats: jsonb("base_stats").notNull(),
  createdAt: text("created_at").default(new Date().toISOString()),
  updatedAt: text("updated_at").default(new Date().toISOString()),
});

export const insertCharacterSchema = createInsertSchema(characters).pick({
  name: true,
  level: true,
  race: true,
  feature: true,
  notes: true,
  pointsAvailable: true,
  baseStats: true,
  userId: true,
});

export const updateCharacterSchema = createInsertSchema(characters).pick({
  name: true,
  level: true,
  race: true,
  feature: true,
  notes: true,
  pointsAvailable: true,
  baseStats: true,
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type UpdateCharacter = z.infer<typeof updateCharacterSchema>;
export type Character = typeof characters.$inferSelect;

// Stats types
export const statNames = [
  "strength",
  "agility",
  "intelligence",
  "perception",
  "charisma",
  "willpower",
  "endurance",
  "luck",
] as const;

export type StatName = typeof statNames[number];
export type Stats = Record<StatName, number>;
