export type BudgetItem = {
  majorCategory: string;
  plannedCents: number;
  spentCents: number;
};

export const WEDDING_CATEGORY_ORDER = [
  "Photography, Services & Entertainment",
  "Attire, Beauty & Accessories",
  "Food & Beverage",
  "Flowers & Décor",
  "Stationery & Guest Keepsakes",
  "Cake & Desserts",
  "Closeout & Contingency",
] as const;

export function sumCents(items: BudgetItem[], key: "plannedCents" | "spentCents") {
  return items.reduce((total, item) => total + item[key], 0);
}

export function categoryRollup(items: BudgetItem[]) {
  const plannedTotal = sumCents(items, "plannedCents");
  return WEDDING_CATEGORY_ORDER.map(name => {
    const entries = items.filter(item => item.majorCategory === name);
    const plannedCents = sumCents(entries, "plannedCents");
    const spentCents = sumCents(entries, "spentCents");
    return {
      name,
      plannedCents,
      spentCents,
      remainingCents: plannedCents - spentCents,
      share: plannedTotal === 0 ? 0 : plannedCents / plannedTotal,
    };
  });
}

export function budgetStatus(weddingBudgetCents: number, venueCostPaidCents: number, plannedCents: number) {
  const totalCents = venueCostPaidCents + plannedCents;
  const varianceCents = weddingBudgetCents - totalCents;
  return { totalCents, varianceCents, isOnBudget: varianceCents >= 0 };
}
