import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function PublicLayout() {
  const { isAuthenticated, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (initializing) return;

    // Allow /get-started even if authenticated (user is completing onboarding)
    if (location.pathname === "/get-started") {
      return;
    }

    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      console.log("✅ Authenticated user - redirecting to home");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, initializing, navigate, location.pathname]);

  return <Outlet />;
}