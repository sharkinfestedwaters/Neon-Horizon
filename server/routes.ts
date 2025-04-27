import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Since this is a client-only app with local storage,
  // we don't need any API routes
  
  // Set up a simple ping endpoint for health checks
  app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', message: 'Neon Horizons Character Creator is running' });
  });

  const httpServer = createServer(app);

  return httpServer;
}
