import { pgTable, text, serial, integer, boolean, jsonb, json, timestamp, primaryKey, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from 'drizzle-orm';

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

/* Will define user relations after all tables are created */

// Character table
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  level: integer("level").notNull().default(1),
  // We'll keep the old text fields for backward compatibility but add references to the actual tables
  race: text("race"),
  feature: text("feature"),
  // New foreign key references
  raceId: integer("race_id").references(() => races.id),
  featureId: integer("feature_id").references(() => features.id),
  notes: text("notes").default(""),
  portraitImage: text("portrait_image"), // Character portrait image URL
  pointsAvailable: integer("points_available").notNull().default(5),
  baseStats: jsonb("base_stats").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCharacterSchema = createInsertSchema(characters).pick({
  name: true,
  level: true,
  race: true,
  feature: true,
  raceId: true,
  featureId: true,
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
  raceId: true,
  featureId: true,
  notes: true,
  portraitImage: true,
  pointsAvailable: true,
  baseStats: true,
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type UpdateCharacter = z.infer<typeof updateCharacterSchema>;
export type Character = typeof characters.$inferSelect;

/* We'll add character relations later once we've defined the related tables */

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

// Races table to formalize races instead of storing as string
export const races = pgTable("races", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // human, android, moai, etc.
  name: text("name").notNull(),
  description: text("description"),
  statBonuses: jsonb("stat_bonuses"), // JSON object with stat bonuses
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertRaceSchema = createInsertSchema(races).pick({
  code: true,
  name: true,
  description: true,
  statBonuses: true,
  imageUrl: true,
  createdBy: true,
});

export const updateRaceSchema = createInsertSchema(races).pick({
  name: true,
  description: true,
  statBonuses: true,
  imageUrl: true,
});

export type InsertRace = z.infer<typeof insertRaceSchema>;
export type UpdateRace = z.infer<typeof updateRaceSchema>;
export type Race = typeof races.$inferSelect;

// Features table to formalize features instead of storing as string
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // neura-link, field-pin, etc.
  name: text("name").notNull(),
  description: text("description"),
  statBonuses: jsonb("stat_bonuses"), // JSON object with stat bonuses
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertFeatureSchema = createInsertSchema(features).pick({
  code: true,
  name: true,
  description: true,
  statBonuses: true,
  imageUrl: true,
  createdBy: true,
});

export const updateFeatureSchema = createInsertSchema(features).pick({
  name: true,
  description: true,
  statBonuses: true,
  imageUrl: true,
});

export type InsertFeature = z.infer<typeof insertFeatureSchema>;
export type UpdateFeature = z.infer<typeof updateFeatureSchema>;
export type Feature = typeof features.$inferSelect;

// Item table for defining equipment and inventory items
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // weapon, armor, consumable, etc.
  rarity: text("rarity"), // common, uncommon, rare, etc.
  imageUrl: text("image_url"),
  stats: jsonb("stats"), // JSON object containing any stat modifications
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id), // Admin or GM who created the item
});

export const insertItemSchema = createInsertSchema(items).pick({
  name: true,
  description: true,
  type: true,
  rarity: true,
  imageUrl: true,
  stats: true,
  createdBy: true,
});

export const updateItemSchema = createInsertSchema(items).pick({
  name: true,
  description: true,
  type: true,
  rarity: true,
  imageUrl: true,
  stats: true,
});

export type InsertItem = z.infer<typeof insertItemSchema>;
export type UpdateItem = z.infer<typeof updateItemSchema>;
export type Item = typeof items.$inferSelect;

// Character inventory table
export const characterInventory = pgTable("character_inventory", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull().references(() => characters.id),
  itemId: integer("item_id").notNull().references(() => items.id),
  quantity: integer("quantity").notNull().default(1),
  isEquipped: boolean("is_equipped").default(false),
  notes: text("notes"),
  acquiredAt: timestamp("acquired_at").defaultNow(),
});

export const insertCharacterInventorySchema = createInsertSchema(characterInventory).pick({
  characterId: true,
  itemId: true,
  quantity: true,
  isEquipped: true,
  notes: true,
});

export const updateCharacterInventorySchema = createInsertSchema(characterInventory).pick({
  quantity: true,
  isEquipped: true,
  notes: true,
});

export type InsertCharacterInventory = z.infer<typeof insertCharacterInventorySchema>;
export type UpdateCharacterInventory = z.infer<typeof updateCharacterInventorySchema>;
export type CharacterInventory = typeof characterInventory.$inferSelect;

// Skill table
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // combat, technical, social, etc.
  statModifier: text("stat_modifier"), // which stat affects this skill
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id), // Admin or GM who created the skill
});

export const insertSkillSchema = createInsertSchema(skills).pick({
  name: true,
  description: true,
  type: true,
  statModifier: true,
  createdBy: true,
});

export const updateSkillSchema = createInsertSchema(skills).pick({
  name: true,
  description: true,
  type: true,
  statModifier: true,
});

export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type UpdateSkill = z.infer<typeof updateSkillSchema>;
export type Skill = typeof skills.$inferSelect;

// Character skills table (join table)
export const characterSkills = pgTable("character_skills", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull().references(() => characters.id),
  skillId: integer("skill_id").notNull().references(() => skills.id),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  acquiredAt: timestamp("acquired_at").defaultNow(),
});

export const insertCharacterSkillSchema = createInsertSchema(characterSkills).pick({
  characterId: true,
  skillId: true,
  level: true,
  experience: true,
});

export const updateCharacterSkillSchema = createInsertSchema(characterSkills).pick({
  level: true,
  experience: true,
});

export type InsertCharacterSkill = z.infer<typeof insertCharacterSkillSchema>;
export type UpdateCharacterSkill = z.infer<typeof updateCharacterSkillSchema>;
export type CharacterSkill = typeof characterSkills.$inferSelect;

// ==================
// Define all relations
// ==================

// User relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles),
  characters: many(characters),
  modifiedSettings: many(gameSettings),
  createdItems: many(items, { relationName: 'creator' }),
  createdSkills: many(skills, { relationName: 'creator' })
}));

// Character relations
export const charactersRelations = relations(characters, ({ one, many }) => ({
  user: one(users),
  inventory: many(characterInventory),
  skills: many(characterSkills)
}));

// User Profile relations
export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id]
  })
}));

// Game Settings relations
export const gameSettingsRelations = relations(gameSettings, ({ one }) => ({
  modifiedBy: one(users, {
    fields: [gameSettings.lastModifiedBy],
    references: [users.id]
  })
}));

// Item relations
export const itemsRelations = relations(items, ({ one, many }) => ({
  creator: one(users, {
    fields: [items.createdBy],
    references: [users.id]
  }),
  inventoryEntries: many(characterInventory)
}));

// Character Inventory relations
export const characterInventoryRelations = relations(characterInventory, ({ one }) => ({
  character: one(characters, {
    fields: [characterInventory.characterId],
    references: [characters.id]
  }),
  item: one(items, {
    fields: [characterInventory.itemId],
    references: [items.id]
  })
}));

// Skill relations
export const skillsRelations = relations(skills, ({ one, many }) => ({
  creator: one(users, {
    fields: [skills.createdBy],
    references: [users.id]
  }),
  characterSkills: many(characterSkills)
}));

// Character Skills relations
export const characterSkillsRelations = relations(characterSkills, ({ one }) => ({
  character: one(characters, {
    fields: [characterSkills.characterId],
    references: [characters.id]
  }),
  skill: one(skills, {
    fields: [characterSkills.skillId],
    references: [skills.id]
  })
}));
