import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function PublicLayout() {
  const { isAuthenticated, initializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initializing) return;

    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      console.log("✅ Authenticated user - redirecting to home");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, initializing, navigate]);

  return <Outlet />;
}