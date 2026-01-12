/**
 * SignupForm.jsx - Onboarding Step 1
 * ===================================
 * FORMÅL: Indsamle email og password credentials til ny bruger
 * 
 * VIGTIG DETALJE:
 * Denne komponent OPRETTER IKKE brugeren!
 * Den indsamler kun credentials og sender dem videre til parent.
 * Selve bruger oprettelsen sker i GetStartedRoute efter alle onboarding steps.
 * 
 * VALIDATION:
 * - Email: Standard email regex validation
 * - Password: Minimum 8 tegn (Supabase krav)
 * - Repeat Password: Skal matche password
 * - Real-time feedback med grønne/røde ikoner
 * 
 * UI PATTERNS:
 * - "Touched" state tracker om felt har været fokuseret
 * - Validation vises kun efter felt er touched (bedre UX)
 * - Visual feedback med checkmarks og x'er
 * - Disabled continue knap indtil valid
 * 
 * BROWSER AUTOFILL HACK:
 * Vi bruger dummy fields og readonly attribut for at forhindre
 * browser autofill der kan forstyrre onboarding flowet
 * 
 * PROPS:
 * - onContinue(email, password): Callback med credentials når valid
 * 
 * FLOW:
 * User indtaster → Validation → Continue → Parent modtager credentials
 * 
 * LAVET AF: Jimmi Larsen
 */

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

// Email validation regex - standard format check
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Password validation rules
const passwordValidation = {
  minLength: (password) => password.length >= 8,
};

const isValidPassword = (password) => passwordValidation.minLength(password);

// Password match check - både match og ikke tom
const passwordsMatch = (password, repeatPassword) =>
  password === repeatPassword && repeatPassword.length > 0;

export function SignupForm({ onContinue }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [repeatPasswordTouched, setRepeatPasswordTouched] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleContinue = () => {
    console.log("🔵 SignupForm: Collecting credentials");
    if (onContinue) onContinue(email, password);
    console.log("✅ SignupForm: Credentials passed to parent");
  }
  return (
    <>
      <div className="mb-8 space-y-3 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Sign up</h2>
        <p className="text-sm text-gray-600">
          By continuing you agree to LineUp!<br />
          Terms of use and Privacy Policy
        </p>
      </div>

      <form className="space-y-5" autoComplete="off">
        {/* Dummy fields to trick browser autofill */}
        <input type="text" name="fake-username" style={{ display: 'none' }} />
        <input type="password" name="fake-password" style={{ display: 'none' }} />
        
        {/* Email */}
        <div className="relative">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={(e) => e.target.removeAttribute('readonly')}
            onBlur={() => setEmailTouched(true)}
            readOnly
            autoComplete="off"
            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow text-sm ${
              emailTouched ? (isValidEmail(email) ? "border-green-500" : "border-red-500") : "border-gray-300"
            }`}
          />
          {emailTouched && (
            <div className="absolute -translate-y-1/2 right-3 top-1/2">
              {isValidEmail(email) ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={(e) => {
              e.target.removeAttribute('readonly');
              setPasswordFocused(true);
            }}
            onBlur={() => {
              setPasswordFocused(false);
              setPasswordTouched(true);
            }}
            readOnly
            autoComplete="off"
            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow text-sm ${
              passwordTouched ? (isValidPassword(password) ? "border-green-500" : "border-red-500") : "border-gray-300"
            }`}
          />
          {passwordTouched && (
            <div className="absolute -translate-y-1/2 right-3 top-1/2">
              {isValidPassword(password) ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          )}

          {passwordFocused && (
            <div className="absolute left-0 right-0 z-10 p-4 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg top-full">
              <p className="mb-2 text-xs font-semibold text-gray-700">Password must contain:</p>
              <div className="space-y-1 text-xs">
                <div className={`flex items-center gap-2 ${passwordValidation.minLength(password) ? "text-green-600" : "text-gray-500"}`}>
                  {passwordValidation.minLength(password) ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    </svg>
                  )}
                  <span>At least 8 characters</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Repeat */}
        <div className="relative">
          <input
            type="password"
            name="repeat-password"
            placeholder="Repeat your password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            onFocus={(e) => e.target.removeAttribute('readonly')}
            onBlur={() => setRepeatPasswordTouched(true)}
            readOnly
            autoComplete="off"
            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow text-sm ${
              repeatPasswordTouched
                ? passwordsMatch(password, repeatPassword)
                  ? "border-green-500"
                  : "border-red-500"
                : "border-gray-300"
            }`}
          />
          {repeatPasswordTouched && (
            <div className="absolute -translate-y-1/2 right-3 top-1/2">
              {passwordsMatch(password, repeatPassword) ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            setEmailTouched(true);
            setPasswordTouched(true);
            setRepeatPasswordTouched(true);
            if (
              isValidEmail(email) &&
              isValidPassword(password) &&
              passwordsMatch(password, repeatPassword)
            ) {
              handleContinue();
            }
          }}
          disabled={
            !(
              isValidEmail(email) &&
              isValidPassword(password) &&
              passwordsMatch(password, repeatPassword)
            )
          }
          className="w-full py-3 mt-2 font-semibold text-gray-800 transition rounded-full bg-primary-yellow hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </form>

      <div className="my-6 text-sm text-center text-gray-500">or</div>

      <div className="space-y-4">
        <button type="button" className="w-full py-3 font-medium text-gray-800 transition bg-white border-2 border-gray-300 rounded-full hover:bg-gray-50">
          Sign up with Google
        </button>
        <button type="button" className="w-full py-3 font-medium text-gray-800 transition bg-white border-2 border-gray-300 rounded-full hover:bg-gray-50">
          Sign up with AppleID
        </button>
      </div>

      <div className="mt-6 text-sm text-center text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => {
            // Mark onboarding as complete for existing users
            window.localStorage.setItem("onboarding_complete", "true");
            navigate("/login");
          }}
          className="font-semibold text-blue-600 hover:underline"
        >
          Log In
        </button>
      </div>
    </>
  );
}
