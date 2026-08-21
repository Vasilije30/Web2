import type { ExpenseCategory } from "./Expense";

export interface ExpenseInput {
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
}
