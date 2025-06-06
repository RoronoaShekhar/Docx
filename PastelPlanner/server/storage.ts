import { 
  users, 
  schoolEntries, 
  whatididEntries, 
  specialEntries,
  type User, 
  type InsertUser,
  type SchoolEntry,
  type InsertSchoolEntry,
  type WhatididEntry,
  type InsertWhatididEntry,
  type SpecialEntry,
  type InsertSpecialEntry
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getSchoolEntry(date: string): Promise<SchoolEntry | undefined>;
  upsertSchoolEntry(entry: InsertSchoolEntry): Promise<SchoolEntry>;
  
  getWhatididEntry(date: string): Promise<WhatididEntry | undefined>;
  upsertWhatididEntry(entry: InsertWhatididEntry): Promise<WhatididEntry>;
  
  getSpecialEntry(type: string): Promise<SpecialEntry | undefined>;
  upsertSpecialEntry(entry: InsertSpecialEntry): Promise<SpecialEntry>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getSchoolEntry(date: string): Promise<SchoolEntry | undefined> {
    const [entry] = await db.select().from(schoolEntries).where(eq(schoolEntries.date, date));
    return entry || undefined;
  }

  async upsertSchoolEntry(entry: InsertSchoolEntry): Promise<SchoolEntry> {
    const existing = await this.getSchoolEntry(entry.date);
    
    if (existing) {
      const [updated] = await db
        .update(schoolEntries)
        .set(entry)
        .where(eq(schoolEntries.date, entry.date))
        .returning();
      return updated;
    } else {
      const [newEntry] = await db
        .insert(schoolEntries)
        .values({
          ...entry,
          p1: entry.p1 || "",
          p2: entry.p2 || "",
          p3: entry.p3 || "",
          p4: entry.p4 || "",
          p5: entry.p5 || "",
          p6: entry.p6 || "",
          p7: entry.p7 || "",
          p8: entry.p8 || "",
        })
        .returning();
      return newEntry;
    }
  }

  async getWhatididEntry(date: string): Promise<WhatididEntry | undefined> {
    const [entry] = await db.select().from(whatididEntries).where(eq(whatididEntries.date, date));
    return entry || undefined;
  }

  async upsertWhatididEntry(entry: InsertWhatididEntry): Promise<WhatididEntry> {
    const existing = await this.getWhatididEntry(entry.date);
    
    if (existing) {
      const [updated] = await db
        .update(whatididEntries)
        .set(entry)
        .where(eq(whatididEntries.date, entry.date))
        .returning();
      return updated;
    } else {
      const [newEntry] = await db
        .insert(whatididEntries)
        .values({
          ...entry,
          ioqm: entry.ioqm || "",
          nsep: entry.nsep || "",
          schol: entry.schol || "",
        })
        .returning();
      return newEntry;
    }
  }

  async getSpecialEntry(type: string): Promise<SpecialEntry | undefined> {
    const [entry] = await db.select().from(specialEntries).where(eq(specialEntries.type, type));
    return entry || undefined;
  }

  async upsertSpecialEntry(entry: InsertSpecialEntry): Promise<SpecialEntry> {
    const existing = await this.getSpecialEntry(entry.type);
    
    if (existing) {
      const [updated] = await db
        .update(specialEntries)
        .set(entry)
        .where(eq(specialEntries.type, entry.type))
        .returning();
      return updated;
    } else {
      const [newEntry] = await db
        .insert(specialEntries)
        .values({
          ...entry,
          content: entry.content || "",
        })
        .returning();
      return newEntry;
    }
  }
}

// Initialize database with admin user
async function initializeDatabase() {
  try {
    const storage = new DatabaseStorage();
    const existingAdmin = await storage.getUserByUsername("admin");
    
    if (!existingAdmin) {
      await storage.createUser({ 
        username: "admin", 
        password: "roronoazoro" 
      });
      console.log("Admin user created with password: roronoazoro");
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

// Initialize on module load
initializeDatabase();

export const storage = new DatabaseStorage();
