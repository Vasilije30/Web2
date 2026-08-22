import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loading } from "../common/Feedback";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) {
    return <Loading label="Provera ovlašćenja..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
