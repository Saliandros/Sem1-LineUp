import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "../components/LoadingScreen";

export default function ProtectedLayout() {
  const { isAuthenticated, initializing } = useAuth();
  const navigate = useNavigate();
  const [shouldShowLoading, setShouldShowLoading] = useState(true);

  useEffect(() => {
    // Check if we should show loading screen
    const checkOnboarding = async () => {
      const onboardingComplete = window.localStorage.getItem("onboarding_complete");
      
      // If onboarding is complete and auth is ready, don't show loading
      if (onboardingComplete === "true" && !initializing) {
        setShouldShowLoading(false);
      }
    };

    checkOnboarding();
  }, [initializing]);

  // Show LoadingScreen only on first visit or if onboarding not complete
  if (initializing) {
    return null; // Still initializing auth
  }

  if (shouldShowLoading && !isAuthenticated) {
    // Let LoadingScreen handle routing
    return <LoadingScreen />;
  }

  // After LoadingScreen redirects, if user comes back and is not authenticated
  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  return <Outlet />;
}
