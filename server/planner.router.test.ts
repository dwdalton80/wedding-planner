import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getPlannerState: vi.fn(),
  updatePlannerSettings: vi.fn(),
  updatePlannerItem: vi.fn(),
  restoreWeddingPlan: vi.fn(),
  restoreHoneymoonPlan: vi.fn(),
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
});
