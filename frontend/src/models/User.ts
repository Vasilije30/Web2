export type UserRole = "User" | "Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
