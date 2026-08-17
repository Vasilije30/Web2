import { identityApi, tripPlanningApi, sharingApi } from "./apiClients";

export interface ServiceHealth {
  service: string;
  healthy: boolean;
}

async function checkOne(client: typeof identityApi, label: string): Promise<ServiceHealth> {
  try {
    await client.get("/api/health");
    return { service: label, healthy: true };
  } catch {
    return { service: label, healthy: false };
  }
}

export async function checkAllServices(): Promise<ServiceHealth[]> {
  return Promise.all([
    checkOne(identityApi, "Identity.Service"),
    checkOne(tripPlanningApi, "TripPlanning.Service"),
    checkOne(sharingApi, "Sharing.Service"),
  ]);
}
