/**
 * Register.jsx
 * Registration flow without marketing carousel.
 * Same as GetStarted.jsx but without the carousel (step 0) and without marking onboarding_complete.
 * 
 * Step map:
 *   0: Signup (account creation via Supabase Auth)
 *   1: User type selection (musician/service-provider)
 *   2: User information (name, phone, birthdate, city)
 *   3: Interests selection
 *   4: Subscription offer -> then loading + redirect
 * 
 * Data flow:
 *   - Steps 0-4 collect data in component state
 *   - When user finishes (step 4), showLoading is set to true
 *   - Subscription component handles signUp() and updateProfile()
 *   - After completion, redirect to home page WITHOUT setting onboarding_complete
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Progress } from "../components/ui/progress";
import { SignupForm } from "../components/onboarding/SignupForm";
import { UserTypeSelect } from "../components/onboarding/UserTypeSelect";
import { UserInformation } from "../components/onboarding/UserInformation";
import { Interests } from "../components/onboarding/Interests";
import { Subscription } from "../components/onboarding/Subscription";
import LoadingScreen from "../components/LoadingScreen";

export default function Register() {
  const navigate = useNavigate();
  
  // Core navigation state
  const [onboardingStep, setOnboardingStep] = useState(0); // 0 = signup, 1 = user type, 2 = info, 3 = interests, 4 = subscription
  const [showLoading, setShowLoading] = useState(false);

  const [email, setEmail] = useState(""); // Email from SignupForm
  const [password, setPassword] = useState(""); // Password from SignupForm
  const [userType, setUserType] = useState(null); // 'musician' or 'service-provider'
  const [userInfo, setUserInfo] = useState({ name: "" }); // User information state
  const [selectedInterests, setSelectedInterests] = useState([]); // Interests state
  const [selectedSubscription, setSelectedSubscription] = useState(null); // Subscription plan

  // Phone validation helper
  const isValidPhoneNumber = (phone, countryCode) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/\s/g, "");
    switch (countryCode) {
      case "+45":
        return /^\d{8}$/.test(cleanPhone);
      case "+1":
        return /^\d{10}$/.test(cleanPhone);
      case "+44":
        return /^\d{10,11}$/.test(cleanPhone);
      case "+46":
        return /^\d{9,10}$/.test(cleanPhone);
      case "+47":
        return /^\d{8}$/.test(cleanPhone);
      case "+49":
        return /^\d{10,11}$/.test(cleanPhone);
      default:
        return cleanPhone.length >= 8;
    }
  };

  // Handle loading and redirect after registration completion
  useEffect(() => {
    if (showLoading) {
      const timer = setTimeout(() => {
        // Redirect to home without setting onboarding_complete
        // This allows existing users to register without being marked as new
        window.location.href = "/";
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showLoading]);

  if (showLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="flex items-center justify-center min-h-screen px-4 bg-neutral-light-gray">
      {/* Signup Section - Step 0 */}
      {onboardingStep === 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-light-gray">
          {/* Progress Bar - Fixed at top */}
          <div className="fixed top-0 left-0 right-0 z-10 px-4 pt-16 bg-neutral-light-gray">
            <div className="w-full max-w-md mx-auto">
              <Progress value={(onboardingStep / 4) * 100} className="mb-8" />
            </div>
          </div>

          <div className="flex items-center justify-center min-h-screen px-4 pt-24">
            <div className="w-full max-w-md pb-8">
              <SignupForm
                onContinue={(email, password) => {
                  console.log("🟢 Register: Credentials collected, moving to step 1");
                  setEmail(email);
                  setPassword(password);
                  setOnboardingStep(1);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* User Type Selection - Step 1 */}
      {onboardingStep === 1 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-light-gray">
          {/* Progress Bar - Fixed at top */}
          <div className="fixed top-0 left-0 right-0 z-10 px-4 pt-16 bg-neutral-light-gray">
            <div className="w-full max-w-md mx-auto">
              <Progress value={(onboardingStep / 4) * 100} className="mb-8" />
            </div>
          </div>

          <div className="flex items-center justify-center min-h-screen px-4 pt-32">
            <div className="w-full max-w-md pb-8">
              <UserTypeSelect
                userType={userType}
                setUserType={setUserType}
                onContinue={() => setOnboardingStep(2)}
              />
            </div>
          </div>
        </div>
      )}

      {/* User Information - Step 2 */}
      {onboardingStep === 2 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-light-gray">
          {/* Progress Bar - Fixed at top */}
          <div className="fixed top-0 left-0 right-0 z-10 px-4 pt-16 bg-neutral-light-gray">
            <div className="w-full max-w-md mx-auto">
              <Progress value={(onboardingStep / 4) * 100} className="mb-8" />
            </div>
          </div>

          <div className="flex items-center justify-center min-h-screen px-4 pt-32">
            <div className="w-full max-w-md pb-8">
              <UserInformation userInfo={userInfo} onChange={setUserInfo} />
              <button
                onClick={() => setOnboardingStep(3)}
                disabled={
                  !userInfo.name ||
                  userInfo.name
                    .trim()
                    .split(/\s+/)
                    .filter((w) => w.length > 0).length < 2 ||
                  !userInfo.phone ||
                  !isValidPhoneNumber(
                    userInfo.phone,
                    userInfo.countryCode || "+45"
                  ) ||
                  !userInfo.birthDate ||
                  !userInfo.city
                }
                className="w-full py-3 mt-6 font-semibold text-gray-800 transition rounded-full bg-primary-yellow hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interests - Step 3 */}
      {onboardingStep === 3 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-light-gray">
          {/* Progress Bar - Fixed at top */}
          <div className="fixed top-0 left-0 right-0 z-10 px-4 pt-16 bg-neutral-light-gray">
            <div className="w-full max-w-md mx-auto">
              <Progress value={(onboardingStep / 4) * 100} className="mb-8" />
            </div>
          </div>

          <div className="flex items-center justify-center min-h-screen px-4 pt-32">
            <div className="w-full max-w-md pb-8">
              <Interests
                selectedInterests={selectedInterests}
                onChange={setSelectedInterests}
                onContinue={() => setOnboardingStep(4)}
                onSkip={() => setOnboardingStep(4)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Subscription - Step 4 */}
      {onboardingStep === 4 && !showLoading && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-light-gray">
          {/* Progress Bar - Fixed at top */}
          <div className="fixed top-0 left-0 right-0 z-10 px-4 pt-16 bg-neutral-light-gray">
            <div className="w-full max-w-md mx-auto">
              <Progress value={(onboardingStep / 4) * 100} className="mb-8" />
            </div>
          </div>

          <div className="flex items-center justify-center min-h-screen px-4 pt-32">
            <div className="w-full max-w-md pb-8">
              <Subscription
                email={email}
                password={password}
                userType={userType}
                userInfo={userInfo}
                selectedInterests={selectedInterests}
                onStartTrial={(plan) => {
                  setSelectedSubscription(plan);
                  setShowLoading(true);
                }}
                onSkip={() => {
                  setShowLoading(true);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
