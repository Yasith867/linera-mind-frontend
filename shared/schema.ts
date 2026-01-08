import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/chat";

// We simulate a microchain's state here. 
// In a real Linera app, this would be the contract state.
export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  // Mimicking Linera's chain structure
  chainId: text("chain_id").notNull(),
  blockHeight: integer("block_height").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertEntrySchema = createInsertSchema(entries).pick({
  question: true,
  answer: true,
  chainId: true,
  blockHeight: true
});

export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Entry = typeof entries.$inferSelect;

// Request types
export type CreateEntryRequest = {
  question: string;
};

// Response types
export type VerifyResponse = Entry;
