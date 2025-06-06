import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSchoolEntrySchema, insertWhatididEntrySchema, insertSpecialEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Get school entry for a specific date
  app.get("/api/school/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const entry = await storage.getSchoolEntry(date);
      
      if (!entry) {
        // Return empty entry structure
        return res.json({
          date,
          p1: "", p2: "", p3: "", p4: "", p5: "", p6: "", p7: "", p8: ""
        });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to get school entry" });
    }
  });

  // Upsert school entry
  app.post("/api/school", async (req, res) => {
    try {
      const validatedData = insertSchoolEntrySchema.parse(req.body);
      const entry = await storage.upsertSchoolEntry(validatedData);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save school entry" });
    }
  });

  // Get whatidid entry for a specific date
  app.get("/api/whatidid/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const entry = await storage.getWhatididEntry(date);
      
      if (!entry) {
        // Return empty entry structure
        return res.json({
          date,
          ioqm: "", nsep: "", schol: ""
        });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to get whatidid entry" });
    }
  });

  // Upsert whatidid entry
  app.post("/api/whatidid", async (req, res) => {
    try {
      const validatedData = insertWhatididEntrySchema.parse(req.body);
      const entry = await storage.upsertWhatididEntry(validatedData);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save whatidid entry" });
    }
  });

  // Get special entry (holiday homework or what had done)
  app.get("/api/special/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const entry = await storage.getSpecialEntry(type);
      
      if (!entry) {
        // Return empty entry structure
        return res.json({
          type,
          content: ""
        });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to get special entry" });
    }
  });

  // Upsert special entry
  app.post("/api/special", async (req, res) => {
    try {
      const validatedData = insertSpecialEntrySchema.parse(req.body);
      const entry = await storage.upsertSpecialEntry(validatedData);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save special entry" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
