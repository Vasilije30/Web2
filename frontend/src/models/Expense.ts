export type ExpenseCategory = "Transport" | "Accommodation" | "Food" | "Tickets" | "Shopping" | "Other";

export interface Expense {
  id: string;
  tripId: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
}
