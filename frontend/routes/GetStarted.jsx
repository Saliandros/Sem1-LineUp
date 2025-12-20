/**
 * GetStarted.jsx
 * Master controller for the onboarding flow.
 * 
 * Step map:
 *   0: Carousel (marketing slides)
 *   1: Signup (account creation via Supabase Auth)
 *   2: User type selection (musician/service-provider)
 *   3: User information (name, phone, birthdate, city)
 *   4: Interests selection
 *   5: Subscription offer -> then loading + save data + redirect
 * 
 * Data flow:
 *   - Steps 1-5 collect data in component state
 *   - When user finishes (step 5), showLoading is set to true
 *   - useEffect triggers saveOnboardingData() which calls updateProfile()
 *   - updateProfile() saves all collected data to profiles table
 *   - After 4s, redirect to home page with onboarding_complete flag
 * 
 * Persistence:
 *   - Auth data: handled by Supabase Auth (email/password)
 *   - Profile data: saved to database via PUT /api/profiles
 *   - Completion flag: stored in localStorage for next visit
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Progress } from "../components/ui/progress";
import { Carousel } from "../components/onboarding/Carousel";
import { SignupForm } from "../components/onboarding/SignupForm";
import { UserTypeSelect } from "../components/onboarding/UserTypeSelect";
import { UserInformation } from "../components/onboarding/UserInformation";
import { Interests } from "../components/onboarding/Interests";
import { Subscription } from "../components/onboarding/Subscription";
import LoadingScreen from "../components/LoadingScreen";
import { updateProfile } from "../lib/api";

export default function GetStarted() {
  const navigate = useNavigate();
  
  // Core navigation & phase state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [showNextStep, setShowNextStep] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0); // 0 = carousel, 1 = sign up, 2 = next step, etc.
  const [showLoading, setShowLoading] = useState(false); // Loading state for final redirect

  const [userType, setUserType] = useState(null); // 'musician' or 'service-provider'
  const [userInfo, setUserInfo] = useState({ name: "" }); // User information state
  const [selectedInterests, setSelectedInterests] = useState([]); // Interests state
  const [selectedSubscription, setSelectedSubscription] = useState(null); // Subscription plan

  // Phone validation helper
  const isValidPhoneNumber = (phone, countryCode) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/\s/g, '');
    switch (countryCode) {
      case '+45': return /^\d{8}$/.test(cleanPhone);
      case '+1': return /^\d{10}$/.test(cleanPhone);
      case '+44': return /^\d{10,11}$/.test(cleanPhone);
      case '+46': return /^\d{9,10}$/.test(cleanPhone);
      case '+47': return /^\d{8}$/.test(cleanPhone);
      case '+49': return /^\d{10,11}$/.test(cleanPhone);
      default: return cleanPhone.length >= 8;
    }
  };

  // Handle loading and redirect after onboarding completion
  useEffect(() => {
    if (showLoading) {
      // Save onboarding data to database
      const saveOnboardingData = async () => {
        try {
          console.log("📊 Saving onboarding data:", {
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
            username: userInfo.name?.split(' ')[0] || 'user', // Use first name as username
            full_name: userInfo.name || '', // Store full name in dedicated field
            user_phone: userInfo.phone,
            birth_date: userInfo.birthDate,
            city: userInfo.city,
            country_code: userInfo.countryCode || '+45',
            interests: selectedInterests.length > 0 ? selectedInterests : null,
          });
          
          console.log("✅ Onboarding data saved successfully:", result);
        } catch (error) {
          console.error("❌ Failed to save onboarding data:", error);
          // Continue anyway - don't block the redirect
        }
      };

      saveOnboardingData();

      // Persist onboarding completion flag
      try {
        window.localStorage.setItem("onboarding_complete", "true");
      } catch (e) {
        console.warn("Failed to persist onboarding completion", e);
      }

      const timer = setTimeout(() => {
        // Redirect to root since home is served at '/'
        window.location.href = '/';
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showLoading, userType, userInfo, selectedInterests]);

  // Skip entire onboarding if already completed earlier
  useEffect(() => {
    try {
      const done = window.localStorage.getItem("onboarding_complete");
      if (done === "true") {
        // This should normally not happen - login should handle this
        // But just in case, redirect to home
        console.log("⚠️ User already completed onboarding, redirecting to home");
        window.location.href = '/';
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev + 1);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev - 1);
  };

  // Reset position when reaching the end for infinite loop
  useEffect(() => {
    if (currentSlide === slides.length) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(0);
      }, 500);
    } else if (currentSlide === -1) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(slides.length - 1);
      }, 500);
    }
  }, [currentSlide]);

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (showLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-light-gray px-4">
      <Carousel
        slides={slides}
        currentSlide={currentSlide}
        isTransitioning={isTransitioning}
        onPrev={prevSlide}
        onNext={nextSlide}
        onDot={(index) => {
          setIsTransitioning(true);
          setCurrentSlide(index);
        }}
        onGetStarted={() => {
          setShowNextStep(true);
          setOnboardingStep(1);
        }}
      />

      {/* Sign Up Section - Step 1 */}
      {showNextStep && onboardingStep === 1 && (
        <div className="fixed inset-0 bg-neutral-light-gray z-50 overflow-y-auto">
          {/* Progress Bar - Fixed at top */}
          <div className="fixed top-0 left-0 right-0 bg-neutral-light-gray pt-16 px-4 z-10">
            <div className="w-full max-w-md mx-auto">
              <Progress value={(onboardingStep / 5) * 100} className="mb-8" />
            </div>
          </div>
          
          <div className="flex items-center justify-center min-h-screen px-4 pt-24">
            <div className="w-full max-w-md pb-8">
              <SignupForm
                onSuccess={() => setOnboardingStep(2)}
              />
            </div>
          </div>
        </div>
      )}

      {/* User Type Selection - Step 2 */}
      {showNextStep && onboardingStep === 2 && (
        <div className="fixed inset-0 bg-neutral-light-gray z-50 overflow-y-auto">
          {/* Progress Bar - Fixed at top */}
          <div className="fixed top-0 left-0 right-0 bg-neutral-light-gray pt-16 px-4 z-10">
            <div className="w-full max-w-md mx-auto">
              <Progress value={(onboardingStep / 5) * 100} className="mb-8" />
            </div>
          </div>
          
          <div className="flex items-center justify-center min-h-screen px-4 pt-32">
            <div className="w-full max-w-md pb-8">
              <UserTypeSelect
                userType={userType}
                setUserType={setUserType}
                onContinue={() => setOnboardingStep(3)}
              />
            </div>
          </div>
        </div>
      )}

      {/* User Information - Step 3 */}
      {showNextStep && onboardingStep === 3 && (
        <div className="fixed inset-0 bg-neutral-light-gray z-50 overflow-y-auto">
          {/* Progress Bar - Fixed at top */}
          <div className="fixed top-0 left-0 right-0 bg-neutral-light-gray pt-16 px-4 z-10">
            <div className="w-full max-w-md mx-auto">
              <Progress value={(onboardingStep / 5) * 100} className="mb-8" />
            </div>
          </div>
          
          <div className="flex items-center justify-center min-h-screen px-4 pt-32">
            <div className="w-full max-w-md pb-8">
              <UserInformation
                userInfo={userInfo}
                onChange={setUserInfo}
              />
              <button
                onClick={() => setOnboardingStep(4)}
                disabled={
                  !userInfo.name || 
                  userInfo.name.trim().split(/\s+/).filter(w => w.length > 0).length < 2 ||
                  !userInfo.phone ||
                  !isValidPhoneNumber(userInfo.phone, userInfo.countryCode || '+45') ||
                  !userInfo.birthDate ||
                  !userInfo.city
                }
                className="w-full bg-primary-yellow text-gray-800 font-semibold py-3 rounded-full hover:opacity-90 transition mt-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interests - Step 4 */}
      {showNextStep && onboardingStep === 4 && (
        <div className="fixed inset-0 bg-neutral-light-gray z-50 overflow-y-auto">
          {/* Progress Bar - Fixed at top */}
          <div className="fixed top-0 left-0 right-0 bg-neutral-light-gray pt-16 px-4 z-10">
            <div className="w-full max-w-md mx-auto">
              <Progress value={(onboardingStep / 5) * 100} className="mb-8" />
            </div>
          </div>
          
          <div className="flex items-center justify-center min-h-screen px-4 pt-32">
            <div className="w-full max-w-md pb-8">
              <Interests
                selectedInterests={selectedInterests}
                onChange={setSelectedInterests}
                onContinue={() => setOnboardingStep(5)}
                onSkip={() => setOnboardingStep(5)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Subscription - Step 5 */}
      {showNextStep && onboardingStep === 5 && !showLoading && (
        <div className="fixed inset-0 bg-neutral-light-gray z-50 overflow-y-auto">
          {/* Progress Bar - Fixed at top */}
          <div className="fixed top-0 left-0 right-0 bg-neutral-light-gray pt-16 px-4 z-10">
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

      {/* Loading Screen */}
    </main>
  );
}

const slides = [
  {
    title: "Make connections with musicians",
    image: "/mobile1.png",
  },
  {
    title: "Post Requests",
    image: "/mobile2.png",
  },
  {
    title: "Find the right service for you",
    image: "/mobile3.png",
  },
];
