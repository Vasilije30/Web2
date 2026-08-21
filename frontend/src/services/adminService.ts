import { identityApi, tripPlanningApi } from "./apiClients";
import type { AdminTripSummary } from "../models/AdminTripSummary";
import type { AdminUserSummary } from "../models/AdminUserSummary";
import type { UserRole } from "../models/User";

export async function getAllUsers(): Promise<AdminUserSummary[]> {
  const response = await identityApi.get<AdminUserSummary[]>("/api/admin/users");
  return response.data;
}

export async function updateUserRole(userId: string, role: UserRole): Promise<AdminUserSummary> {
  const response = await identityApi.put<AdminUserSummary>(`/api/admin/users/${userId}/role`, { role });
  return response.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await identityApi.delete(`/api/admin/users/${userId}`);
}

export async function getAllTrips(): Promise<AdminTripSummary[]> {
  const response = await tripPlanningApi.get<AdminTripSummary[]>("/api/admin/trips");
  return response.data;
}
