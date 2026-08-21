import { tripPlanningApi, withShareToken } from "./apiClients";
import type { Destination } from "../models/Destination";
import type { DestinationInput } from "../models/DestinationInput";

export async function getDestinations(tripId: string, shareToken?: string): Promise<Destination[]> {
  const response = await tripPlanningApi.get<Destination[]>(
    `/api/trips/${tripId}/destinations`,
    withShareToken(shareToken),
  );
  return response.data;
}

export async function createDestination(
  tripId: string,
  input: DestinationInput,
  shareToken?: string,
): Promise<Destination> {
  const response = await tripPlanningApi.post<Destination>(
    `/api/trips/${tripId}/destinations`,
    input,
    withShareToken(shareToken),
  );
  return response.data;
}

export async function updateDestination(
  tripId: string,
  destinationId: string,
  input: DestinationInput,
  shareToken?: string,
): Promise<Destination> {
  const response = await tripPlanningApi.put<Destination>(
    `/api/trips/${tripId}/destinations/${destinationId}`,
    input,
    withShareToken(shareToken),
  );
  return response.data;
}

export async function deleteDestination(tripId: string, destinationId: string, shareToken?: string): Promise<void> {
  await tripPlanningApi.delete(`/api/trips/${tripId}/destinations/${destinationId}`, withShareToken(shareToken));
}
