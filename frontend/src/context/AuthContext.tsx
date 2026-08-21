import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../models/User";
import * as authService from "../services/authService";

const TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (typeof payload.exp !== "number") return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser && !isTokenExpired(storedToken)) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser) as User);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    setIsInitializing(false);
  }, []);

  function setSession(nextUser: User, nextToken: string) {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setToken(nextToken);
  }

  async function login(email: string, password: string) {
    const response = await authService.login({ email, password });
    setSession(response.user, response.token);
  }

  async function register(name: string, email: string, password: string) {
    const response = await authService.register({ name, email, password });
    setSession(response.user, response.token);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, isInitializing, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
