export type ShareAccessType = "View" | "Edit";

export interface ShareLink {
  token: string;
  tripId: string;
  accessType: ShareAccessType;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
}

export interface ShareValidation {
  valid: boolean;
  tripId: string | null;
  accessType: ShareAccessType | null;
}
