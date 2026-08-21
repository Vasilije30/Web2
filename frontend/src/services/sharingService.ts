import { sharingApi } from "./apiClients";
import type { ShareAccessType, ShareLink, ShareValidation } from "../models/ShareLink";

export async function createShareLink(
  tripId: string,
  accessType: ShareAccessType,
  expiresInHours: number,
): Promise<ShareLink> {
  const response = await sharingApi.post<ShareLink>(`/api/trips/${tripId}/shares`, {
    accessType,
    expiresInHours,
  });
  return response.data;
}

export async function getShareLinks(tripId: string): Promise<ShareLink[]> {
  const response = await sharingApi.get<ShareLink[]>(`/api/trips/${tripId}/shares`);
  return response.data;
}

export async function revokeShareLink(tripId: string, token: string): Promise<void> {
  await sharingApi.delete(`/api/trips/${tripId}/shares/${token}`);
}

/** Anonymous - works without being logged in. */
export async function validateShareToken(token: string): Promise<ShareValidation> {
  const response = await sharingApi.get<ShareValidation>(`/api/shares/${token}`);
  return response.data;
}
