import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { nanoid } from "nanoid";
import { ALL_STARTER_ITEMS, HONEYMOON_STARTER_ITEMS, STARTER_SETTINGS, TIMELINE_STARTER_EVENTS, WEDDING_STARTER_ITEMS } from "../shared/plannerDefaults";
import { InsertUser, plannerItems, plannerSettings, plannerTimelineEvents, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

const WEDDING_RESTORE_VALUES: Record<string, number> = {
  photographer: 135000,
  attire: 90000,
  beauty: 20000,
  "catering-staff": 85000,
  alcohol: 55000,
  hospitality: 25000,
  "food-hospitality-buffer": 20000,
  flowers: 50000,
  decor: 65000,
  signage: 25000,
  bartender: 30000,
  security: 30000,
  "dj-buffer": 20000,
  invitations: 20000,
  programs: 5000,
  "guest-extras": 5000,
  cake: 30000,
  desserts: 5000,
  license: 10000,
  tips: 40000,
  "last-minute-reserve": 59656,
};

const HONEYMOON_RESTORE_VALUES: Record<string, number> = {
  flights: 160000,
  accommodations: 150000,
  dining: 75000,
  activities: 50000,
  "local-transit": 25000,
  "travel-protection": 40000,
};

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  (['name', 'email', 'loginMethod'] as const).forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? 'admin' : 'user');
  updateSet.role = values.role;
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

async function requirePlannerDb() {
  const db = await getDb();
  if (!db) throw new Error("Planner database is unavailable");
  return db;
}

export async function getPlannerState() {
  const db = await requirePlannerDb();
  let settings = (await db.select().from(plannerSettings).where(eq(plannerSettings.id, 1)).limit(1))[0];
  if (!settings) {
    await db.insert(plannerSettings).values({ id: 1, ...STARTER_SETTINGS });
    settings = (await db.select().from(plannerSettings).where(eq(plannerSettings.id, 1)).limit(1))[0]!;
  }
  let items = await db.select().from(plannerItems).orderBy(asc(plannerItems.tracker), asc(plannerItems.sortOrder));
  if (items.length === 0) {
    await db.insert(plannerItems).values(ALL_STARTER_ITEMS);
    items = await db.select().from(plannerItems).orderBy(asc(plannerItems.tracker), asc(plannerItems.sortOrder));
  }
  let timelineEvents = await db.select().from(plannerTimelineEvents).orderBy(asc(plannerTimelineEvents.sortOrder));
  if (timelineEvents.length === 0) {
    await db.insert(plannerTimelineEvents).values(TIMELINE_STARTER_EVENTS);
    timelineEvents = await db.select().from(plannerTimelineEvents).orderBy(asc(plannerTimelineEvents.sortOrder));
  }
  return { settings, items, timelineEvents };
}

export async function updatePlannerSettings(input: typeof STARTER_SETTINGS) {
  const db = await requirePlannerDb();
  await getPlannerState();
  await db.update(plannerSettings).set(input).where(eq(plannerSettings.id, 1));
  return getPlannerState();
}

export async function updatePlannerItem(id: string, plannedCents: number, spentCents: number) {
  const db = await requirePlannerDb();
  await getPlannerState();
  await db.update(plannerItems).set({ plannedCents, spentCents }).where(eq(plannerItems.id, id));
  return getPlannerState();
}

async function restoreItems(items: Record<string, number>) {
  const db = await requirePlannerDb();
  await getPlannerState();
  for (const [id, plannedCents] of Object.entries(items)) {
    await db.update(plannerItems).set({ plannedCents, spentCents: 0 }).where(eq(plannerItems.id, id));
  }
  return getPlannerState();
}

export async function restoreWeddingPlan() { return restoreItems(WEDDING_RESTORE_VALUES); }
export async function restoreHoneymoonPlan() { return restoreItems(HONEYMOON_RESTORE_VALUES); }

type TimelineEventInput = { eventTime: string; title: string; notes: string };

export async function createTimelineEvent(input: TimelineEventInput) {
  const db = await requirePlannerDb();
  const state = await getPlannerState();
  const sortOrder = state.timelineEvents.length ? Math.max(...state.timelineEvents.map(event => event.sortOrder)) + 1 : 1;
  await db.insert(plannerTimelineEvents).values({ id: `timeline-${nanoid(10)}`, ...input, sortOrder });
  return getPlannerState();
}

export async function updateTimelineEvent(id: string, input: TimelineEventInput) {
  const db = await requirePlannerDb();
  await getPlannerState();
  await db.update(plannerTimelineEvents).set(input).where(eq(plannerTimelineEvents.id, id));
  return getPlannerState();
}

export async function deleteTimelineEvent(id: string) {
  const db = await requirePlannerDb();
  await getPlannerState();
  await db.delete(plannerTimelineEvents).where(eq(plannerTimelineEvents.id, id));
  return getPlannerState();
}

export async function moveTimelineEvent(id: string, direction: "up" | "down") {
  const db = await requirePlannerDb();
  const state = await getPlannerState();
  const currentIndex = state.timelineEvents.findIndex(event => event.id === id);
  if (currentIndex < 0) throw new Error("Timeline event not found");
  const targetIndex = currentIndex + (direction === "up" ? -1 : 1);
  if (targetIndex < 0 || targetIndex >= state.timelineEvents.length) return state;
  const current = state.timelineEvents[currentIndex]!;
  const target = state.timelineEvents[targetIndex]!;
  await db.update(plannerTimelineEvents).set({ sortOrder: target.sortOrder }).where(eq(plannerTimelineEvents.id, current.id));
  await db.update(plannerTimelineEvents).set({ sortOrder: current.sortOrder }).where(eq(plannerTimelineEvents.id, target.id));
  return getPlannerState();
}
