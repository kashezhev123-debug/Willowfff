import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const blockedPcsTable = pgTable("blocked_pcs", {
  id: serial("id").primaryKey(),
  zone: text("zone").notNull(),
  pcNumber: integer("pc_number").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type BlockedPc = typeof blockedPcsTable.$inferSelect;
