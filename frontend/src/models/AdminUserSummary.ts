import type { UserRole } from "./User";

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}
