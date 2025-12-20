import LoadingScreen from "../components/LoadingScreen";

/**
 * InitialLoad - Shows LoadingScreen on app startup
 * LoadingScreen handles routing logic based on:
 * - onboarding_complete status
 * - auth token
 * - rememberMe preference
 */
export default function InitialLoad() {
  return <LoadingScreen />;
}
