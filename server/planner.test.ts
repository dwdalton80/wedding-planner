import { describe, expect, it } from "vitest";
import { HONEYMOON_STARTER_ITEMS, WEDDING_STARTER_ITEMS } from "../shared/plannerDefaults";
import { budgetStatus, categoryRollup, sumCents } from "../shared/plannerCalculations";

describe("wedding planner calculations", () => {
  it("keeps the required starter line counts and exact starting allocations", () => {
    expect(WEDDING_STARTER_ITEMS).toHaveLength(21);
    expect(HONEYMOON_STARTER_ITEMS).toHaveLength(6);
    expect(sumCents(WEDDING_STARTER_ITEMS, "plannedCents")).toBe(824656);
    expect(sumCents(HONEYMOON_STARTER_ITEMS, "plannedCents")).toBe(500000);
  });

  it("rolls the detailed wedding plan into seven major categories", () => {
    const rollup = categoryRollup(WEDDING_STARTER_ITEMS);
    expect(rollup).toHaveLength(7);
    expect(rollup.map(row => row.plannedCents)).toEqual([215000, 110000, 185000, 140000, 30000, 35000, 109656]);
  });

  it("reconciles the wedding plan to the $11,900 budget after the venue payment", () => {
    expect(budgetStatus(1190000, 365344, 824656)).toEqual({ totalCents: 1190000, varianceCents: 0, isOnBudget: true });
  });
});
