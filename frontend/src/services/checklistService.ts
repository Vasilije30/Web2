import { tripPlanningApi, withShareToken } from "./apiClients";
import type { ChecklistItem } from "../models/ChecklistItem";
import type { ChecklistItemInput } from "../models/ChecklistItemInput";

export async function getChecklistItems(tripId: string, shareToken?: string): Promise<ChecklistItem[]> {
  const response = await tripPlanningApi.get<ChecklistItem[]>(
    `/api/trips/${tripId}/checklist-items`,
    withShareToken(shareToken),
  );
  return response.data;
}

export async function createChecklistItem(
  tripId: string,
  input: ChecklistItemInput,
  shareToken?: string,
): Promise<ChecklistItem> {
  const response = await tripPlanningApi.post<ChecklistItem>(
    `/api/trips/${tripId}/checklist-items`,
    input,
    withShareToken(shareToken),
  );
  return response.data;
}

export async function updateChecklistItem(
  tripId: string,
  itemId: string,
  input: ChecklistItemInput,
  shareToken?: string,
): Promise<ChecklistItem> {
  const response = await tripPlanningApi.put<ChecklistItem>(
    `/api/trips/${tripId}/checklist-items/${itemId}`,
    input,
    withShareToken(shareToken),
  );
  return response.data;
}

export async function deleteChecklistItem(tripId: string, itemId: string, shareToken?: string): Promise<void> {
  await tripPlanningApi.delete(`/api/trips/${tripId}/checklist-items/${itemId}`, withShareToken(shareToken));
}
