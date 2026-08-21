import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const plannerSettings = mysqlTable("planner_settings", {
  id: int("id").primaryKey(),
  weddingDate: varchar("weddingDate", { length: 10 }).notNull(),
  guestCount: int("guestCount").notNull(),
  weddingBudgetCents: int("weddingBudgetCents").notNull(),
  honeymoonBudgetCents: int("honeymoonBudgetCents").notNull(),
  venueCostPaidCents: int("venueCostPaidCents").notNull(),
  venueName: varchar("venueName", { length: 128 }).notNull(),
  venueCapacity: int("venueCapacity").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const plannerItems = mysqlTable("planner_items", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tracker: mysqlEnum("tracker", ["wedding", "honeymoon"]).notNull(),
  majorCategory: varchar("majorCategory", { length: 128 }).notNull(),
  label: varchar("label", { length: 128 }).notNull(),
  plannedCents: int("plannedCents").notNull(),
  spentCents: int("spentCents").notNull(),
  sortOrder: int("sortOrder").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const plannerTimelineEvents = mysqlTable("planner_timeline_events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  eventTime: varchar("eventTime", { length: 5 }).notNull(),
  title: varchar("title", { length: 128 }).notNull(),
  notes: text("notes").notNull(),
  sortOrder: int("sortOrder").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type PlannerSettings = typeof plannerSettings.$inferSelect;
export type PlannerItem = typeof plannerItems.$inferSelect;
export type PlannerTimelineEvent = typeof plannerTimelineEvents.$inferSelect;
