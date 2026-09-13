import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  ALL_STARTER_ITEMS,
  HONEYMOON_STARTER_ITEMS,
  STARTER_SETTINGS,
  TIMELINE_STARTER_EVENTS,
  WEDDING_STARTER_ITEMS,
} from "@shared/plannerDefaults";

const IS_STATIC_MODE = import.meta.env.VITE_STATIC_MODE === "true";
const STORAGE_KEY = "kyia-keilen-wedding-planner:v1";

export type PlannerSettings = typeof STARTER_SETTINGS & {
  id?: number;
  updatedAt?: Date;
};

export type PlannerItem = (typeof ALL_STARTER_ITEMS)[number] & {
  updatedAt: Date;
};

export type PlannerTimelineEvent = (typeof TIMELINE_STARTER_EVENTS)[number] & {
  updatedAt: Date;
};

export type PlannerState = {
  settings: PlannerSettings;
  items: PlannerItem[];
  timelineEvents: PlannerTimelineEvent[];
};

type SettingsInput = Omit<typeof STARTER_SETTINGS, "venueName"> & { venueName: "Cottonwood Barn" };
type ItemInput = { id: string; plannedCents: number; spentCents: number };
type TimelineInput = { eventTime: string; title: string; notes: string };
type TimelineUpdateInput = TimelineInput & { id: string };
type MutationOptions = { onSuccess?: () => void };
type Mutation<T> = {
  mutate: (input: T, options?: MutationOptions) => void;
  isPending: boolean;
};

export type PlannerStore = {
  isLocal: boolean;
  plannerQuery: { data: PlannerState | undefined; isLoading: boolean };
  updateSettings: Mutation<SettingsInput>;
  updateItem: Mutation<ItemInput>;
  restoreWedding: Mutation<void>;
  restoreHoneymoon: Mutation<void>;
  createTimelineEvent: Mutation<TimelineInput>;
  updateTimelineEvent: Mutation<TimelineUpdateInput>;
  deleteTimelineEvent: Mutation<{ id: string }>;
  moveTimelineEvent: Mutation<{ id: string; direction: "up" | "down" }>;
};

function now() {
  return new Date();
}

function createStarterState(): PlannerState {
  const updatedAt = now();
  return {
    settings: { ...STARTER_SETTINGS, id: 1, updatedAt },
    items: ALL_STARTER_ITEMS.map(item => ({ ...item, updatedAt })),
    timelineEvents: TIMELINE_STARTER_EVENTS.map(event => ({ ...event, updatedAt })),
  };
}

function reviveDate(value: unknown) {
  const date = typeof value === "string" || value instanceof Date ? new Date(value) : now();
  return Number.isNaN(date.valueOf()) ? now() : date;
}

function readLocalState(): PlannerState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createStarterState();
    const parsed = JSON.parse(raw) as Partial<PlannerState>;
    if (!parsed.settings || !Array.isArray(parsed.items) || !Array.isArray(parsed.timelineEvents)) {
      return createStarterState();
    }
    return {
      settings: { ...STARTER_SETTINGS, ...parsed.settings, updatedAt: reviveDate(parsed.settings.updatedAt) },
      items: parsed.items.map(item => ({ ...item, updatedAt: reviveDate(item.updatedAt) })) as PlannerItem[],
      timelineEvents: parsed.timelineEvents
        .map(event => ({ ...event, updatedAt: reviveDate(event.updatedAt) }))
        .sort((a, b) => a.sortOrder - b.sortOrder) as PlannerTimelineEvent[],
    };
  } catch {
    return createStarterState();
  }
}

function useLocalPlannerStore(): PlannerStore {
  const [data, setData] = useState<PlannerState>(readLocalState);
  const dataRef = useRef(data);

  const commit = useCallback((update: (current: PlannerState) => PlannerState) => {
    const next = update(dataRef.current);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    dataRef.current = next;
    setData(next);
  }, []);

  useEffect(() => {
    const syncAcrossTabs = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        const next = readLocalState();
        dataRef.current = next;
        setData(next);
      }
    };
    window.addEventListener("storage", syncAcrossTabs);
    return () => window.removeEventListener("storage", syncAcrossTabs);
  }, []);

  const run = <T,>(update: (input: T, current: PlannerState) => PlannerState, success?: string) =>
    (input: T, options?: MutationOptions) => {
      try {
        commit(current => update(input, current));
        if (success) toast.success(success);
        options?.onSuccess?.();
      } catch {
        toast.error("Your change could not be saved in this browser");
      }
    };

  const updateSettings = run<SettingsInput>((input, current) => ({
    ...current,
    settings: { ...input, id: 1, updatedAt: now() },
  }), "Plan inputs saved on this device");

  const updateItem = run<ItemInput>((input, current) => ({
    ...current,
    items: current.items.map(item => item.id === input.id
      ? { ...item, plannedCents: input.plannedCents, spentCents: input.spentCents, updatedAt: now() }
      : item),
  }));

  const restoreTracker = (tracker: "wedding" | "honeymoon", current: PlannerState) => {
    const updatedAt = now();
    const starters = tracker === "wedding" ? WEDDING_STARTER_ITEMS : HONEYMOON_STARTER_ITEMS;
    return {
      ...current,
      items: current.items
        .filter(item => item.tracker !== tracker)
        .concat(starters.map(item => ({ ...item, updatedAt })))
        .sort((a, b) => a.tracker.localeCompare(b.tracker) || a.sortOrder - b.sortOrder),
    };
  };

  const restoreWedding = run<void>((_, current) => restoreTracker("wedding", current), "Wedding tracker restored to the starting plan");
  const restoreHoneymoon = run<void>((_, current) => restoreTracker("honeymoon", current), "Honeymoon tracker restored to the starting plan");
  const createTimelineEvent = run<TimelineInput>((input, current) => ({
    ...current,
    timelineEvents: current.timelineEvents.concat({
      id: `timeline-${crypto.randomUUID()}`,
      ...input,
      sortOrder: current.timelineEvents.length
        ? Math.max(...current.timelineEvents.map(event => event.sortOrder)) + 1
        : 1,
      updatedAt: now(),
    }),
  }), "Timeline event added");
  const updateTimelineEvent = run<TimelineUpdateInput>((input, current) => ({
    ...current,
    timelineEvents: current.timelineEvents.map(event => event.id === input.id
      ? { ...event, eventTime: input.eventTime, title: input.title, notes: input.notes, updatedAt: now() }
      : event),
  }), "Timeline event saved");
  const deleteTimelineEvent = run<{ id: string }>((input, current) => ({
    ...current,
    timelineEvents: current.timelineEvents.filter(event => event.id !== input.id),
  }), "Timeline event deleted");
  const moveTimelineEvent = run<{ id: string; direction: "up" | "down" }>((input, current) => {
    const timelineEvents = [...current.timelineEvents].sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIndex = timelineEvents.findIndex(event => event.id === input.id);
    const targetIndex = currentIndex + (input.direction === "up" ? -1 : 1);
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= timelineEvents.length) return current;
    const currentOrder = timelineEvents[currentIndex]!.sortOrder;
    timelineEvents[currentIndex] = { ...timelineEvents[currentIndex]!, sortOrder: timelineEvents[targetIndex]!.sortOrder, updatedAt: now() };
    timelineEvents[targetIndex] = { ...timelineEvents[targetIndex]!, sortOrder: currentOrder, updatedAt: now() };
    return { ...current, timelineEvents: timelineEvents.sort((a, b) => a.sortOrder - b.sortOrder) };
  });

  return {
    isLocal: true,
    plannerQuery: { data, isLoading: false },
    updateSettings: { mutate: updateSettings, isPending: false },
    updateItem: { mutate: updateItem, isPending: false },
    restoreWedding: { mutate: restoreWedding, isPending: false },
    restoreHoneymoon: { mutate: restoreHoneymoon, isPending: false },
    createTimelineEvent: { mutate: createTimelineEvent, isPending: false },
    updateTimelineEvent: { mutate: updateTimelineEvent, isPending: false },
    deleteTimelineEvent: { mutate: deleteTimelineEvent, isPending: false },
    moveTimelineEvent: { mutate: moveTimelineEvent, isPending: false },
  };
}

function useRemotePlannerStore(): PlannerStore {
  const plannerQuery = trpc.planner.get.useQuery(undefined, {
    enabled: !IS_STATIC_MODE,
    refetchOnWindowFocus: false,
  });
  const utils = trpc.useUtils();
  const updateSettings = trpc.planner.updateSettings.useMutation({
    onSuccess: async () => { await utils.planner.get.invalidate(); toast.success("Plan inputs saved"); },
    onError: () => toast.error("Could not save those inputs"),
  });
  const updateItem = trpc.planner.updateItem.useMutation({
    onSuccess: async () => utils.planner.get.invalidate(),
    onError: () => toast.error("Could not save that budget line"),
  });
  const restoreWedding = trpc.planner.restoreWedding.useMutation({
    onSuccess: async () => { await utils.planner.get.invalidate(); toast.success("Wedding tracker restored to the starting plan"); },
    onError: () => toast.error("Could not restore the wedding tracker"),
  });
  const restoreHoneymoon = trpc.planner.restoreHoneymoon.useMutation({
    onSuccess: async () => { await utils.planner.get.invalidate(); toast.success("Honeymoon tracker restored to the starting plan"); },
    onError: () => toast.error("Could not restore the honeymoon tracker"),
  });
  const createTimelineEvent = trpc.planner.createTimelineEvent.useMutation({
    onSuccess: async () => { await utils.planner.get.invalidate(); toast.success("Timeline event added"); },
    onError: () => toast.error("Could not add that timeline event"),
  });
  const updateTimelineEvent = trpc.planner.updateTimelineEvent.useMutation({
    onSuccess: async () => { await utils.planner.get.invalidate(); toast.success("Timeline event saved"); },
    onError: () => toast.error("Could not save that timeline event"),
  });
  const deleteTimelineEvent = trpc.planner.deleteTimelineEvent.useMutation({
    onSuccess: async () => { await utils.planner.get.invalidate(); toast.success("Timeline event deleted"); },
    onError: () => toast.error("Could not delete that timeline event"),
  });
  const moveTimelineEvent = trpc.planner.moveTimelineEvent.useMutation({
    onSuccess: async () => { await utils.planner.get.invalidate(); },
    onError: () => toast.error("Could not reorder that timeline event"),
  });

  return {
    isLocal: false,
    plannerQuery: { data: plannerQuery.data as PlannerState | undefined, isLoading: plannerQuery.isLoading },
    updateSettings: { mutate: (input, options) => updateSettings.mutate(input, options), isPending: updateSettings.isPending },
    updateItem: { mutate: (input, options) => updateItem.mutate(input, options), isPending: updateItem.isPending },
    restoreWedding: { mutate: (_, options) => restoreWedding.mutate(undefined, options), isPending: restoreWedding.isPending },
    restoreHoneymoon: { mutate: (_, options) => restoreHoneymoon.mutate(undefined, options), isPending: restoreHoneymoon.isPending },
    createTimelineEvent: { mutate: (input, options) => createTimelineEvent.mutate(input, options), isPending: createTimelineEvent.isPending },
    updateTimelineEvent: { mutate: (input, options) => updateTimelineEvent.mutate(input, options), isPending: updateTimelineEvent.isPending },
    deleteTimelineEvent: { mutate: (input, options) => deleteTimelineEvent.mutate(input, options), isPending: deleteTimelineEvent.isPending },
    moveTimelineEvent: { mutate: (input, options) => moveTimelineEvent.mutate(input, options), isPending: moveTimelineEvent.isPending },
  };
}

export function usePlannerStore() {
  const local = useLocalPlannerStore();
  const remote = useRemotePlannerStore();
  return IS_STATIC_MODE ? local : remote;
}
