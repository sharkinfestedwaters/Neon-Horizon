import { pgTable, text, serial, integer, boolean, jsonb, json, timestamp } from "drizzle-orm/pg-core";
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
  portraitImage: text("portrait_image"), // Character portrait image URL
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
  portraitImage: true,
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
  portraitImage: true,
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

// User profile table - for storing additional user info including profile picture
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  displayName: text("display_name"),
  profileImage: text("profile_image"), // URL to profile image
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).pick({
  userId: true,
  displayName: true,
  profileImage: true,
  bio: true
});

export const updateUserProfileSchema = createInsertSchema(userProfiles).pick({
  displayName: true,
  profileImage: true,
  bio: true
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// Game settings table - for admin to modify game settings
export const gameSettings = pgTable("game_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: jsonb("setting_value").notNull(),
  description: text("description"),
  lastModifiedBy: integer("last_modified_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertGameSettingSchema = createInsertSchema(gameSettings).pick({
  settingKey: true,
  settingValue: true,
  description: true,
  lastModifiedBy: true
});

export const updateGameSettingSchema = createInsertSchema(gameSettings).pick({
  settingValue: true,
  description: true,
  lastModifiedBy: true
});

export type InsertGameSetting = z.infer<typeof insertGameSettingSchema>;
export type UpdateGameSetting = z.infer<typeof updateGameSettingSchema>;
export type GameSetting = typeof gameSettings.$inferSelect;
