import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCharacterSchema, updateCharacterSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up a simple ping endpoint for health checks
  app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', message: 'Neon Horizons Character Creator is running' });
  });

  // Character endpoints
  
  // Get all characters for a user
  app.get('/api/characters', async (req, res) => {
    try {
      // For now, use a default user ID of 1 since we don't have auth yet
      const userId = 1;
      const characters = await storage.getCharactersByUserId(userId);
      res.json(characters);
    } catch (error) {
      console.error('Error fetching characters:', error);
      res.status(500).json({ error: 'Failed to fetch characters' });
    }
  });

  // Get a specific character
  app.get('/api/characters/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid character ID' });
      }

      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      res.json(character);
    } catch (error) {
      console.error('Error fetching character:', error);
      res.status(500).json({ error: 'Failed to fetch character' });
    }
  });

  // Create a new character
  app.post('/api/characters', async (req, res) => {
    try {
      // Validate request body
      const result = insertCharacterSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: 'Invalid character data',
          details: result.error.format()
        });
      }

      // For now, use a default user ID of 1 since we don't have auth yet
      const characterData = { ...result.data, userId: 1 };
      const character = await storage.createCharacter(characterData);
      res.status(201).json(character);
    } catch (error) {
      console.error('Error creating character:', error);
      res.status(500).json({ error: 'Failed to create character' });
    }
  });

  // Update a character
  app.put('/api/characters/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid character ID' });
      }

      // Validate request body
      const result = updateCharacterSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: 'Invalid character data',
          details: result.error.format()
        });
      }

      const character = await storage.updateCharacter(id, result.data);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      res.json(character);
    } catch (error) {
      console.error('Error updating character:', error);
      res.status(500).json({ error: 'Failed to update character' });
    }
  });

  // Delete a character
  app.delete('/api/characters/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid character ID' });
      }

      const success = await storage.deleteCharacter(id);
      if (!success) {
        return res.status(404).json({ error: 'Character not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting character:', error);
      res.status(500).json({ error: 'Failed to delete character' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
