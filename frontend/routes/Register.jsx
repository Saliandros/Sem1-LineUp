/**
 * Register.jsx
 * Registration flow without marketing carousel.
 * Step map:
 *   0: Signup (account creation)
 *   1: User type selection
 *   2: User information (profile basics)
 *   3: Interests selection
 *   4: Subscription offer -> then loading + redirect
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
import { updateProfile } from "../lib/api";

export default function Register() {
  const navigate = useNavigate();
  
  // Core navigation state
  const [onboardingStep, setOnboardingStep] = useState(0); // 0 = signup, 1 = user type, 2 = info, 3 = interests, 4 = subscription
  const [showLoading, setShowLoading] = useState(false);

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
      // Save registration data to database
      const saveRegistrationData = async () => {
        try {
          console.log("📊 Saving registration data:", {
            user_type: userType,
            name: userInfo.name,
            phone: userInfo.phone,
            birthDate: userInfo.birthDate,
            city: userInfo.city,
            countryCode: userInfo.countryCode,
            interests: selectedInterests,
          });

          const result = await updateProfile({
            user_type: userType,
            username: userInfo.name?.split(' ')[0] || 'user',
            full_name: userInfo.name || '', // Store full name in dedicated field
            user_phone: userInfo.phone,
            birth_date: userInfo.birthDate,
            city: userInfo.city,
            country_code: userInfo.countryCode || '+45',
            interests: selectedInterests.length > 0 ? selectedInterests : null,
          });
          
          console.log("✅ Registration data saved successfully:", result);
        } catch (error) {
          console.error("❌ Failed to save registration data:", error);
        }
      };

      saveRegistrationData();

      const timer = setTimeout(() => {
        // Redirect to home
        window.location.href = "/";
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showLoading, userType, userInfo, selectedInterests]);

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
              <Progress value={(onboardingStep / 5) * 100} className="mb-8" />
            </div>
          </div>

          <div className="flex items-center justify-center min-h-screen px-4 pt-24">
            <div className="w-full max-w-md pb-8">
              <SignupForm
                onSuccess={() => setOnboardingStep(1)}
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
              <Progress value={(onboardingStep / 5) * 100} className="mb-8" />
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
              <Progress value={(onboardingStep / 5) * 100} className="mb-8" />
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
              <Progress value={(onboardingStep / 5) * 100} className="mb-8" />
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
              <Progress value={(onboardingStep / 5) * 100} className="mb-8" />
            </div>
          </div>

          <div className="flex items-center justify-center min-h-screen px-4 pt-32">
            <div className="w-full max-w-md pb-8">
              <Subscription
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
