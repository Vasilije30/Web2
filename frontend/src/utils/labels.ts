/**
 * Srpski nazivi za enum vrednosti koje backend šalje na engleskom, plus boja bedža uz njih.
 * Drži se odvojeno od komponenti da bi ih i lista i forma i kalendar delili iz istog izvora.
 */

export const activityStatuses = ["Planned", "Reserved", "Completed", "Cancelled"] as const;
export type ActivityStatusKey = (typeof activityStatuses)[number];

export const activityStatusLabels: Record<ActivityStatusKey, string> = {
  Planned: "Planirano",
  Reserved: "Rezervisano",
  Completed: "Završeno",
  Cancelled: "Otkazano",
};

export const activityStatusBadges: Record<ActivityStatusKey, string> = {
  Planned: "badge-info",
  Reserved: "badge-warning",
  Completed: "badge-success",
  Cancelled: "badge-danger",
};

/** Boje događaja u kalendaru — usklađene sa bedževima iz liste aktivnosti. */
export const activityStatusColors: Record<ActivityStatusKey, string> = {
  Planned: "var(--blue-500)",
  Reserved: "var(--amber-500)",
  Completed: "var(--green-600)",
  Cancelled: "var(--slate-400)",
};

export const expenseCategories = [
  "Transport",
  "Accommodation",
  "Food",
  "Tickets",
  "Shopping",
  "Other",
] as const;
export type ExpenseCategoryKey = (typeof expenseCategories)[number];

export const expenseCategoryLabels: Record<ExpenseCategoryKey, string> = {
  Transport: "Prevoz",
  Accommodation: "Smeštaj",
  Food: "Hrana",
  Tickets: "Ulaznice",
  Shopping: "Kupovina",
  Other: "Ostalo",
};
