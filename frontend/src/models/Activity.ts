export type ActivityStatus = "Planned" | "Reserved" | "Completed" | "Cancelled";

export interface Activity {
  id: string;
  tripId: string;
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
