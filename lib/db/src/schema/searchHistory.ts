import { pgTable, text, serial, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const searchHistoryTable = pgTable("search_history", {
  id: serial("id").primaryKey(),
  module: text("module").notNull(),
  query: text("query").notNull(),
  riskScore: real("risk_score").notNull().default(0),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSearchHistorySchema = createInsertSchema(searchHistoryTable).omit({ id: true, createdAt: true });
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistoryTable.$inferSelect;
