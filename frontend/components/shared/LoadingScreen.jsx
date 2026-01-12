import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabaseClient";
/**
 * LoadingScreen.jsx
 */

import logoYellow from "../../assets/icons/logoLineUp-Yellow.svg";
import logoDark from "../../assets/icons/logoLineUp-Dark.svg";

export default function LoadingScreen() {
  const [isYellowActive, setIsYellowActive] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Check onboarding status
        const onboardingComplete = window.localStorage.getItem("onboarding_complete");
        
        // Check auth session
        const { data: { session } } = await supabase.auth.getSession();
        const hasAuthToken = Boolean(session?.access_token);
        
        // Check remember me
        const rememberMe = window.localStorage.getItem("rememberMe");

        console.log("🔍 LoadingScreen checks:", {
          onboardingComplete,
          hasAuthToken,
          rememberMe
        });

        // Wait minimum 2 seconds for animation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Routing logic:
        // 1. No onboarding_complete → GetStarted
        if (!onboardingComplete || onboardingComplete !== "true") {
          console.log("📋 No onboarding → redirecting to GetStarted");
          navigate("/get-started", { replace: true });
          return;
        }

        // 2. Has onboarding but no auth → Login
        if (!hasAuthToken) {
          console.log("🔐 Not logged in → redirecting to Login");
          navigate("/login", { replace: true });
          return;
        }

        // 3. Has everything → Home
        console.log("✅ All checks passed → redirecting to Home");
        navigate("/", { replace: true });
        
      } catch (error) {
        console.error("❌ LoadingScreen error:", error);
        // On error, default to login
        navigate("/login", { replace: true });
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);

  const backgroundColor = isYellowActive
    ? "var(--color-primary-purple)"
    : "var(--color-primary-yellow)";
    
  return (
    <div className="relative min-h-screen z-9999">
      <main
        className="loading-screen min-h-screen flex items-center justify-center text-center transition-colors duration-1000 relative z-10"
        style={{ backgroundColor }}
      >
        <div className="flex flex-col items-center gap-3 w-[65%] max-w-2xl">
          <div
            className="relative w-full logo-pulse"
            style={{ aspectRatio: "435 / 140" }}
          >
            <img
              src={logoYellow}
              alt="Mojah Web Consulting logo yellow"
              className="absolute inset-0 object-contain w-full h-full transition-opacity duration-700"
              style={{ opacity: isYellowActive ? 1 : 0 }}
            />
            <img
              src={logoDark}
              alt="Mojah Web Consulting logo purple"
              className="absolute inset-0 object-contain w-full h-full transition-opacity duration-700"
              style={{ opacity: isYellowActive ? 0 : 1 }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
