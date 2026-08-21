import { tripPlanningApi, withShareToken } from "./apiClients";
import type { Trip } from "../models/Trip";
import type { TripInput } from "../models/TripInput";

export async function getTrips(): Promise<Trip[]> {
  const response = await tripPlanningApi.get<Trip[]>("/api/trips");
  return response.data;
}

export async function getTrip(tripId: string, shareToken?: string): Promise<Trip> {
  const response = await tripPlanningApi.get<Trip>(`/api/trips/${tripId}`, withShareToken(shareToken));
  return response.data;
}

export async function createTrip(input: TripInput): Promise<Trip> {
  const response = await tripPlanningApi.post<Trip>("/api/trips", input);
  return response.data;
}

export async function updateTrip(tripId: string, input: TripInput, shareToken?: string): Promise<Trip> {
  const response = await tripPlanningApi.put<Trip>(`/api/trips/${tripId}`, input, withShareToken(shareToken));
  return response.data;
}

export async function deleteTrip(tripId: string): Promise<void> {
  await tripPlanningApi.delete(`/api/trips/${tripId}`);
}
