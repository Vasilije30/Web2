import { tripPlanningApi, withShareToken } from "./apiClients";
import type { BudgetSummary } from "../models/BudgetSummary";
import type { Expense } from "../models/Expense";
import type { ExpenseInput } from "../models/ExpenseInput";

export async function getExpenses(tripId: string, shareToken?: string): Promise<Expense[]> {
  const response = await tripPlanningApi.get<Expense[]>(`/api/trips/${tripId}/expenses`, withShareToken(shareToken));
  return response.data;
}

export async function createExpense(tripId: string, input: ExpenseInput, shareToken?: string): Promise<Expense> {
  const response = await tripPlanningApi.post<Expense>(
    `/api/trips/${tripId}/expenses`,
    input,
    withShareToken(shareToken),
  );
  return response.data;
}

export async function updateExpense(
  tripId: string,
  expenseId: string,
  input: ExpenseInput,
  shareToken?: string,
): Promise<Expense> {
  const response = await tripPlanningApi.put<Expense>(
    `/api/trips/${tripId}/expenses/${expenseId}`,
    input,
    withShareToken(shareToken),
  );
  return response.data;
}

export async function deleteExpense(tripId: string, expenseId: string, shareToken?: string): Promise<void> {
  await tripPlanningApi.delete(`/api/trips/${tripId}/expenses/${expenseId}`, withShareToken(shareToken));
}

export async function getBudgetSummary(tripId: string, shareToken?: string): Promise<BudgetSummary> {
  const response = await tripPlanningApi.get<BudgetSummary>(
    `/api/trips/${tripId}/budget`,
    withShareToken(shareToken),
  );
  return response.data;
}
