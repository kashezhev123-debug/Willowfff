import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  telegram: text("telegram"),
  zone: text("zone").notNull(),
  zones: jsonb("zones").$type<string[]>(),
  pcNumbers: jsonb("pc_numbers").$type<number[]>().default([]),
  pcsByZone: jsonb("pcs_by_zone").$type<Record<string, number[]>>(),
  date: text("date"),
  time: text("time"),
  duration: integer("duration"),
  comment: text("comment"),
  status: text("status").notNull().default("pending"),
  reminderSent: text("reminder_sent").default("false"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
