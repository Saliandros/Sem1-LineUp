import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "../components/LoadingScreen";

export default function ProtectedLayout() {
  const { isAuthenticated, initializing } = useAuth();
  const navigate = useNavigate();
  const [shouldShowLoading, setShouldShowLoading] = useState(true);

  // Show LoadingScreen initially while auth is initializing
  if (initializing || shouldShowLoading) {
    // Once auth is initialized, LoadingScreen will handle routing
    if (!initializing && shouldShowLoading) {
      // Let LoadingScreen take over - it will redirect after 2 seconds
      return <LoadingScreen />;
    }
    // Still initializing auth
    return null;
  }

  // After LoadingScreen redirects, if user comes back and is not authenticated
  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  return <Outlet />;
}
