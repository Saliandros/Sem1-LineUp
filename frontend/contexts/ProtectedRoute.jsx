import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, initializing, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
