import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "../models/User";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  setSession: (user: User, token: string) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("accessToken"));

  function setSession(nextUser: User, nextToken: string) {
    localStorage.setItem("accessToken", nextToken);
    setUser(nextUser);
    setToken(nextToken);
  }

  function clearSession() {
    localStorage.removeItem("accessToken");
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, setSession, clearSession }}>
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
