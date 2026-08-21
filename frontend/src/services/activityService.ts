import { tripPlanningApi, withShareToken } from "./apiClients";
import type { Activity } from "../models/Activity";
import type { ActivityInput } from "../models/ActivityInput";

export async function getActivities(tripId: string, shareToken?: string): Promise<Activity[]> {
  const response = await tripPlanningApi.get<Activity[]>(
    `/api/trips/${tripId}/activities`,
    withShareToken(shareToken),
  );
  return response.data;
}

export async function createActivity(tripId: string, input: ActivityInput, shareToken?: string): Promise<Activity> {
  const response = await tripPlanningApi.post<Activity>(
    `/api/trips/${tripId}/activities`,
    input,
    withShareToken(shareToken),
  );
  return response.data;
}

export async function updateActivity(
  tripId: string,
  activityId: string,
  input: ActivityInput,
  shareToken?: string,
): Promise<Activity> {
  const response = await tripPlanningApi.put<Activity>(
    `/api/trips/${tripId}/activities/${activityId}`,
    input,
    withShareToken(shareToken),
  );
  return response.data;
}

export async function deleteActivity(tripId: string, activityId: string, shareToken?: string): Promise<void> {
  await tripPlanningApi.delete(`/api/trips/${tripId}/activities/${activityId}`, withShareToken(shareToken));
}
