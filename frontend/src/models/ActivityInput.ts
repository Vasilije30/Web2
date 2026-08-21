import type { ActivityStatus } from "./Activity";

export interface ActivityInput {
  destinationId: string | null;
  name: string;
  date: string;
  time: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  estimatedCost: number;
  status: ActivityStatus;
}
