import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getPlannerState: vi.fn(),
  updatePlannerSettings: vi.fn(),
  updatePlannerItem: vi.fn(),
  restoreWeddingPlan: vi.fn(),
  restoreHoneymoonPlan: vi.fn(),
  createTimelineEvent: vi.fn(),
  updateTimelineEvent: vi.fn(),
  deleteTimelineEvent: vi.fn(),
  moveTimelineEvent: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

const plannerState = {
  settings: {
    id: 1,
    weddingDate: "2027-07-11",
    guestCount: 125,
    weddingBudgetCents: 1190000,
    honeymoonBudgetCents: 500000,
    venueCostPaidCents: 365344,
    venueName: "Cottonwood Barn",
    venueCapacity: 300,
    updatedAt: new Date(),
  },
  items: [],
  timelineEvents: [],
};

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("public private-link planner router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getPlannerState.mockResolvedValue(plannerState);
    dbMocks.updatePlannerSettings.mockResolvedValue(plannerState);
    dbMocks.updatePlannerItem.mockResolvedValue(plannerState);
    dbMocks.restoreWeddingPlan.mockResolvedValue(plannerState);
    dbMocks.restoreHoneymoonPlan.mockResolvedValue(plannerState);
    dbMocks.createTimelineEvent.mockResolvedValue(plannerState);
    dbMocks.updateTimelineEvent.mockResolvedValue(plannerState);
    dbMocks.deleteTimelineEvent.mockResolvedValue(plannerState);
    dbMocks.moveTimelineEvent.mockResolvedValue(plannerState);
  });

  it("allows the shared planner to load without a signed-in user", async () => {
    const result = await appRouter.createCaller(createPublicContext()).planner.get();
    expect(result).toEqual(plannerState);
    expect(dbMocks.getPlannerState).toHaveBeenCalledTimes(1);
  });

  it("saves the persisted wedding plan inputs with Cottonwood Barn fixed as the venue", async () => {
    const input = {
      weddingDate: "2027-07-11",
      guestCount: 125,
      weddingBudgetCents: 1190000,
      honeymoonBudgetCents: 500000,
      venueCostPaidCents: 365344,
      venueName: "Cottonwood Barn" as const,
      venueCapacity: 300,
    };
    const result = await appRouter.createCaller(createPublicContext()).planner.updateSettings(input);
    expect(result).toEqual(plannerState);
    expect(dbMocks.updatePlannerSettings).toHaveBeenCalledWith(input);
  });

  it("saves an editable budget line and supports both independent reset actions", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await caller.planner.updateItem({ id: "photographer", plannedCents: 136000, spentCents: 25000 });
    await caller.planner.restoreWedding();
    await caller.planner.restoreHoneymoon();
    expect(dbMocks.updatePlannerItem).toHaveBeenCalledWith("photographer", 136000, 25000);
    expect(dbMocks.restoreWeddingPlan).toHaveBeenCalledTimes(1);
    expect(dbMocks.restoreHoneymoonPlan).toHaveBeenCalledTimes(1);
  });

  it("creates, edits, reorders, and deletes timeline events from the shared private link", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const newEvent = { eventTime: "11:15", title: "Vendor check-in", notes: "Confirm ceremony setup and floral delivery." };
    const revisedEvent = { id: "timeline-vendor-check", eventTime: "11:30", title: "Vendor check-in", notes: "Confirm ceremony setup, floral delivery, and audio." };
    await caller.planner.createTimelineEvent(newEvent);
    await caller.planner.updateTimelineEvent(revisedEvent);
    await caller.planner.moveTimelineEvent({ id: "timeline-vendor-check", direction: "up" });
    await caller.planner.deleteTimelineEvent({ id: "timeline-vendor-check" });
    expect(dbMocks.createTimelineEvent).toHaveBeenCalledWith(newEvent);
    expect(dbMocks.updateTimelineEvent).toHaveBeenCalledWith(revisedEvent.id, { eventTime: revisedEvent.eventTime, title: revisedEvent.title, notes: revisedEvent.notes });
    expect(dbMocks.moveTimelineEvent).toHaveBeenCalledWith("timeline-vendor-check", "up");
    expect(dbMocks.deleteTimelineEvent).toHaveBeenCalledWith("timeline-vendor-check");
  });
});
