import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCharacterSchema, updateCharacterSchema, Character } from "@shared/schema";
import { setupAuth } from "./auth";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";

// Define WebSocket message types
interface WebSocketShareMessage {
  type: 'share-character';
  character: Character;
  username?: string;
}

interface WebSocketSharedMessage {
  type: 'shared-character';
  character: Character;
  sharedBy?: string;
}

interface WebSocketUserStatusMessage {
  type: 'user-status';
  action: 'join' | 'leave';
  username: string;
}

interface WebSocketOnlineUsersMessage {
  type: 'online-users';
  users: string[];
}

type WebSocketMessage = 
  | WebSocketShareMessage 
  | WebSocketSharedMessage 
  | WebSocketUserStatusMessage
  | WebSocketOnlineUsersMessage;

// Utility class to manage online users
class OnlineUsersTracker {
  private users: Map<WebSocket, string> = new Map();

  addUser(ws: WebSocket, username: string): void {
    if (!username) return;
    
    const previousUsername = this.users.get(ws);
    if (previousUsername !== username) {
      this.users.set(ws, username);
      this.broadcastUserStatus(username, 'join');
    }
  }

  removeUser(ws: WebSocket): string | undefined {
    const username = this.users.get(ws);
    if (username) {
      this.users.delete(ws);
      this.broadcastUserStatus(username, 'leave');
    }
    return username;
  }

  getOnlineUsers(): string[] {
    // Get unique usernames in case a user has multiple connections
    const uniqueUsers = new Set<string>();
    this.users.forEach(username => {
      uniqueUsers.add(username);
    });
    return Array.from(uniqueUsers);
  }

  private broadcastUserStatus(username: string, action: 'join' | 'leave'): void {
    // This will be implemented later when we have the WebSocket server
  }

  setWebSocketServer(wss: WebSocketServer): void {
    // Update the broadcast method to use the WebSocket server
    this.broadcastUserStatus = (username: string, action: 'join' | 'leave') => {
      const message: WebSocketUserStatusMessage = {
        type: 'user-status',
        action,
        username
      };
      
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    };
  }
}

// Middleware to check if a user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "You need to be logged in to access this resource" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Set up a simple ping endpoint for health checks
  app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', message: 'Neon Horizons Character Creator is running' });
  });

  // Character endpoints
  
  // Get all characters for the logged-in user
  app.get('/api/characters', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (userId === undefined) {
        return res.status(401).json({ error: 'User ID not available' });
      }
      const characters = await storage.getCharactersByUserId(userId);
      res.json(characters);
    } catch (error) {
      console.error('Error fetching characters:', error);
      res.status(500).json({ error: 'Failed to fetch characters' });
    }
  });

  // Get a specific character
  app.get('/api/characters/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid character ID' });
      }

      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      // Check if character belongs to the logged-in user
      if (character.userId !== req.user?.id) {
        return res.status(403).json({ error: 'You do not have permission to access this character' });
      }

      res.json(character);
    } catch (error) {
      console.error('Error fetching character:', error);
      res.status(500).json({ error: 'Failed to fetch character' });
    }
  });

  // Create a new character
  app.post('/api/characters', isAuthenticated, async (req, res) => {
    try {
      // Validate request body
      const result = insertCharacterSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: 'Invalid character data',
          details: result.error.format()
        });
      }

      // Set the user ID to the logged-in user
      const userId = req.user?.id;
      if (userId === undefined) {
        return res.status(401).json({ error: 'User ID not available' });
      }
      const characterData = { ...result.data, userId };
      const character = await storage.createCharacter(characterData);
      res.status(201).json(character);
    } catch (error) {
      console.error('Error creating character:', error);
      res.status(500).json({ error: 'Failed to create character' });
    }
  });

  // Update a character
  app.put('/api/characters/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid character ID' });
      }

      // Check if character exists and belongs to the logged-in user
      const existingCharacter = await storage.getCharacter(id);
      if (!existingCharacter) {
        return res.status(404).json({ error: 'Character not found' });
      }

      if (existingCharacter.userId !== req.user?.id) {
        return res.status(403).json({ error: 'You do not have permission to modify this character' });
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
      res.json(character);
    } catch (error) {
      console.error('Error updating character:', error);
      res.status(500).json({ error: 'Failed to update character' });
    }
  });

  // Delete a character
  app.delete('/api/characters/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid character ID' });
      }

      // Check if character exists and belongs to the logged-in user
      const existingCharacter = await storage.getCharacter(id);
      if (!existingCharacter) {
        return res.status(404).json({ error: 'Character not found' });
      }

      if (existingCharacter.userId !== req.user?.id) {
        return res.status(403).json({ error: 'You do not have permission to delete this character' });
      }

      const success = await storage.deleteCharacter(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting character:', error);
      res.status(500).json({ error: 'Failed to delete character' });
    }
  });

  // Add endpoint for PDF export
  app.get('/api/characters/:id/export', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid character ID' });
      }

      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      // Check if character belongs to the logged-in user
      if (character.userId !== req.user?.id) {
        return res.status(403).json({ error: 'You do not have permission to export this character' });
      }

      // PDF export will be implemented client-side
      res.json({ exportUrl: `/export-character/${id}` });
    } catch (error) {
      console.error('Error generating export:', error);
      res.status(500).json({ error: 'Failed to generate export' });
    }
  });

  // Create HTTP and WebSocket servers
  const httpServer = createServer(app);
  
  // Create WebSocket server for real-time character sharing
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Create an instance of the OnlineUsersTracker
  const onlineUsers = new OnlineUsersTracker();
  onlineUsers.setWebSocketServer(wss);
  
  // Create a schema for validating WebSocket messages
  const shareMessageSchema = z.object({
    type: z.literal('share-character'),
    character: z.object({
      id: z.number(),
      name: z.string(),
      userId: z.number().nullable(),
      level: z.number(),
      race: z.string().nullable(),
      feature: z.string().nullable(),
      notes: z.string().nullable(),
      pointsAvailable: z.number(),
      baseStats: z.unknown(),
      createdAt: z.string().nullable(),
      updatedAt: z.string().nullable()
    }),
    username: z.string().optional()
  });
  
  // Setup schema for user registration
  const userRegisterSchema = z.object({
    type: z.literal('register-user'),
    username: z.string().min(1),
  });
  
  // Track connected clients
  const connectedClients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    connectedClients.add(ws);
    
    // Send connection acknowledgment
    ws.send(JSON.stringify({
      type: 'connection-established',
      message: 'Connected to Neon Horizons sharing service'
    }));
    
    // Send current online users list
    ws.send(JSON.stringify({
      type: 'online-users',
      users: onlineUsers.getOnlineUsers()
    }));
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // User registration
        if (data.type === 'register-user') {
          const result = userRegisterSchema.safeParse(data);
          
          if (result.success) {
            // Register user
            onlineUsers.addUser(ws, result.data.username);
            
            // Send updated user list to all clients
            const userList: WebSocketOnlineUsersMessage = {
              type: 'online-users',
              users: onlineUsers.getOnlineUsers()
            };
            
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(userList));
              }
            });
            
            // Acknowledge successful registration
            ws.send(JSON.stringify({
              type: 'register-confirmed',
              message: 'You are now connected as ' + result.data.username
            }));
          }
        }
        // Character sharing
        else if (data.type === 'share-character') {
          const result = shareMessageSchema.safeParse(data);
          
          if (!result.success) {
            // Send error back to client if validation fails
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Invalid message format',
              details: result.error.format()
            }));
            return;
          }
          
          const validatedData = result.data;
          
          // Only share username if it's provided
          const sharedBy = validatedData.username || 'Anonymous';
          
          // Broadcast the character to all connected clients
          let sharedCount = 0;
          
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              try {
                const sharedMessage: WebSocketSharedMessage = {
                  type: 'shared-character',
                  character: validatedData.character,
                  sharedBy
                };
                
                client.send(JSON.stringify(sharedMessage));
                sharedCount++;
              } catch (err) {
                console.error('Error sending to client:', err);
              }
            }
          });
          
          // Acknowledge receipt to sender
          ws.send(JSON.stringify({
            type: 'share-confirmed',
            message: `Character "${validatedData.character.name}" shared with ${sharedCount} user${sharedCount !== 1 ? 's' : ''}`
          }));
        }
      } catch (error) {
        console.error('WebSocket message processing error:', error);
        
        // Send error back to client
        try {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process message'
          }));
        } catch (sendError) {
          console.error('Error sending error response:', sendError);
        }
      }
    });
    
    // Handle disconnections
    ws.on('close', () => {
      // Remove user from online tracker
      onlineUsers.removeUser(ws);
      
      // Remove from connected clients
      connectedClients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket client error:', error);
      
      // Remove user from online tracker
      onlineUsers.removeUser(ws);
      
      // Remove from connected clients
      connectedClients.delete(ws);
    });
  });
  
  // Periodically cleanup dead connections and broadcast online users
  setInterval(() => {
    wss.clients.forEach(client => {
      if (client.readyState !== WebSocket.OPEN) {
        onlineUsers.removeUser(client);
        connectedClients.delete(client);
      }
    });
    
    // Broadcast current online users list to all clients periodically
    const userList: WebSocketOnlineUsersMessage = {
      type: 'online-users',
      users: onlineUsers.getOnlineUsers()
    };
    
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(userList));
      }
    });
  }, 30000); // Check every 30 seconds

  return httpServer;
}
