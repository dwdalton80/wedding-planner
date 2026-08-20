export type PlannerTracker = "wedding" | "honeymoon";

export type StarterPlannerItem = {
  id: string;
  tracker: PlannerTracker;
  majorCategory: string;
  label: string;
  plannedCents: number;
  spentCents: number;
  sortOrder: number;
};

export const STARTER_SETTINGS = {
  weddingDate: "2027-07-11",
  guestCount: 125,
  weddingBudgetCents: 1190000,
  honeymoonBudgetCents: 500000,
  venueCostPaidCents: 365344,
  venueName: "Cottonwood Barn",
  venueCapacity: 300,
};

export const WEDDING_STARTER_ITEMS: StarterPlannerItem[] = [
  { id: "photographer", tracker: "wedding", majorCategory: "Photography, Services & Entertainment", label: "Photographer", plannedCents: 135000, spentCents: 0, sortOrder: 1 },
  { id: "attire", tracker: "wedding", majorCategory: "Attire, Beauty & Accessories", label: "Attire", plannedCents: 90000, spentCents: 0, sortOrder: 2 },
  { id: "beauty", tracker: "wedding", majorCategory: "Attire, Beauty & Accessories", label: "Beauty", plannedCents: 20000, spentCents: 0, sortOrder: 3 },
  { id: "catering-staff", tracker: "wedding", majorCategory: "Food & Beverage", label: "Catering Staff", plannedCents: 85000, spentCents: 0, sortOrder: 4 },
  { id: "alcohol", tracker: "wedding", majorCategory: "Food & Beverage", label: "Alcohol", plannedCents: 55000, spentCents: 0, sortOrder: 5 },
  { id: "hospitality", tracker: "wedding", majorCategory: "Food & Beverage", label: "Hospitality", plannedCents: 25000, spentCents: 0, sortOrder: 6 },
  { id: "food-hospitality-buffer", tracker: "wedding", majorCategory: "Food & Beverage", label: "Food & Hospitality Buffer", plannedCents: 20000, spentCents: 0, sortOrder: 7 },
  { id: "flowers", tracker: "wedding", majorCategory: "Flowers & Décor", label: "Flowers", plannedCents: 50000, spentCents: 0, sortOrder: 8 },
  { id: "decor", tracker: "wedding", majorCategory: "Flowers & Décor", label: "Décor", plannedCents: 65000, spentCents: 0, sortOrder: 9 },
  { id: "signage", tracker: "wedding", majorCategory: "Flowers & Décor", label: "Signage", plannedCents: 25000, spentCents: 0, sortOrder: 10 },
  { id: "bartender", tracker: "wedding", majorCategory: "Photography, Services & Entertainment", label: "Bartender", plannedCents: 30000, spentCents: 0, sortOrder: 11 },
  { id: "security", tracker: "wedding", majorCategory: "Photography, Services & Entertainment", label: "Security", plannedCents: 30000, spentCents: 0, sortOrder: 12 },
  { id: "dj-buffer", tracker: "wedding", majorCategory: "Photography, Services & Entertainment", label: "DJ Buffer", plannedCents: 20000, spentCents: 0, sortOrder: 13 },
  { id: "invitations", tracker: "wedding", majorCategory: "Stationery & Guest Keepsakes", label: "Invitations", plannedCents: 20000, spentCents: 0, sortOrder: 14 },
  { id: "programs", tracker: "wedding", majorCategory: "Stationery & Guest Keepsakes", label: "Programs", plannedCents: 5000, spentCents: 0, sortOrder: 15 },
  { id: "guest-extras", tracker: "wedding", majorCategory: "Stationery & Guest Keepsakes", label: "Guest Extras", plannedCents: 5000, spentCents: 0, sortOrder: 16 },
  { id: "cake", tracker: "wedding", majorCategory: "Cake & Desserts", label: "Cake", plannedCents: 30000, spentCents: 0, sortOrder: 17 },
  { id: "desserts", tracker: "wedding", majorCategory: "Cake & Desserts", label: "Desserts", plannedCents: 5000, spentCents: 0, sortOrder: 18 },
  { id: "license", tracker: "wedding", majorCategory: "Closeout & Contingency", label: "License", plannedCents: 10000, spentCents: 0, sortOrder: 19 },
  { id: "tips", tracker: "wedding", majorCategory: "Closeout & Contingency", label: "Tips", plannedCents: 40000, spentCents: 0, sortOrder: 20 },
  { id: "last-minute-reserve", tracker: "wedding", majorCategory: "Closeout & Contingency", label: "Last-Minute Reserve", plannedCents: 59656, spentCents: 0, sortOrder: 21 },
];

export const HONEYMOON_STARTER_ITEMS: StarterPlannerItem[] = [
  { id: "flights", tracker: "honeymoon", majorCategory: "Honeymoon", label: "Flights", plannedCents: 160000, spentCents: 0, sortOrder: 1 },
  { id: "accommodations", tracker: "honeymoon", majorCategory: "Honeymoon", label: "Accommodations", plannedCents: 150000, spentCents: 0, sortOrder: 2 },
  { id: "dining", tracker: "honeymoon", majorCategory: "Honeymoon", label: "Dining", plannedCents: 75000, spentCents: 0, sortOrder: 3 },
  { id: "activities", tracker: "honeymoon", majorCategory: "Honeymoon", label: "Activities", plannedCents: 50000, spentCents: 0, sortOrder: 4 },
  { id: "local-transit", tracker: "honeymoon", majorCategory: "Honeymoon", label: "Local Transit", plannedCents: 25000, spentCents: 0, sortOrder: 5 },
  { id: "travel-protection", tracker: "honeymoon", majorCategory: "Honeymoon", label: "Travel Protection", plannedCents: 40000, spentCents: 0, sortOrder: 6 },
];

export const ALL_STARTER_ITEMS = [...WEDDING_STARTER_ITEMS, ...HONEYMOON_STARTER_ITEMS];
