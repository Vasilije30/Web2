import { identityApi } from "./apiClients";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../models/Auth";
import type { User } from "../models/User";

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const response = await identityApi.post<AuthResponse>("/api/auth/register", request);
  return response.data;
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await identityApi.post<AuthResponse>("/api/auth/login", request);
  return response.data;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await identityApi.get<User>("/api/auth/me");
  return response.data;
}
