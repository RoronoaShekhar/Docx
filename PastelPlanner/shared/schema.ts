import { pgTable, text, serial, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const schoolEntries = pgTable("school_entries", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  p1: text("p1").default(""),
  p2: text("p2").default(""),
  p3: text("p3").default(""),
  p4: text("p4").default(""),
  p5: text("p5").default(""),
  p6: text("p6").default(""),
  p7: text("p7").default(""),
  p8: text("p8").default(""),
});

export const whatididEntries = pgTable("whatidid_entries", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  ioqm: text("ioqm").default(""),
  nsep: text("nsep").default(""),
  schol: text("schol").default(""),
});

export const specialEntries = pgTable("special_entries", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'holiday_homework' or 'what_had_done'
  content: text("content").default(""),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSchoolEntrySchema = createInsertSchema(schoolEntries).omit({
  id: true,
});

export const insertWhatididEntrySchema = createInsertSchema(whatididEntries).omit({
  id: true,
});

export const insertSpecialEntrySchema = createInsertSchema(specialEntries).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SchoolEntry = typeof schoolEntries.$inferSelect;
export type InsertSchoolEntry = z.infer<typeof insertSchoolEntrySchema>;
export type WhatididEntry = typeof whatididEntries.$inferSelect;
export type InsertWhatididEntry = z.infer<typeof insertWhatididEntrySchema>;
export type SpecialEntry = typeof specialEntries.$inferSelect;
export type InsertSpecialEntry = z.infer<typeof insertSpecialEntrySchema>;
