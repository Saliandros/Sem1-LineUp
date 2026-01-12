import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "../components/shared/LoadingScreen";

export default function Login() {
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Disable scrolling on mount, re-enable on unmount
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPassword = (password) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);

    // Validate email
    let hasError = false;
    if (!email || !isValidEmail(email)) {
      setEmailError(
        email ? "Please enter a valid email address" : "Email is required"
      );
      hasError = true;
    } else {
      setEmailError("");
    }

    // Validate password
    setPasswordTouched(true);
    if (!password || !isValidPassword(password)) {
      hasError = true;
    }

    // Don't proceed if there are errors
    if (hasError) {
      return;
    }

    // Save remember me preference to localStorage
    if (rememberMe) {
      try {
        window.localStorage.setItem("rememberMe", "true");
      } catch (e) {
        console.warn("Failed to save remember me preference", e);
      }
    }

    // Call backend login
    setIsLoggingIn(true);
    try {
      await signIn(email, password);
      // After signIn, useEffect will handle the routing based on onboarding status
      setIsLoggingIn(false);
    } catch (error) {
      setLoginError(error.message || "Failed to login. Please try again.");
      setIsLoggingIn(false);
    }
  };

  if (isLoggingIn) {
    return <LoadingScreen />;
  }

  return (
    <main className="flex items-center justify-center max-h-screen min-h-screen px-4 overflow-hidden bg-neutral-light-gray">
      <div className="w-full max-w-md space-y-6">
        <div className="mb-8 space-y-3 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Login</h1>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
          {/* Dummy fields to trick browser autofill */}
          <input type="text" name="fake-username" style={{ display: "none" }} />
          <input
            type="password"
            name="fake-password"
            style={{ display: "none" }}
          />

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Enter your E-mail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              onFocus={(e) => e.target.removeAttribute("readonly")}
              readOnly
              autoComplete="off"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow text-sm ${
                emailError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-500">{emailError}</p>
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
              onFocus={(e) => e.target.removeAttribute("readonly")}
              onBlur={() => setPasswordTouched(true)}
              readOnly
              autoComplete="off"
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow text-sm ${
                passwordTouched
                  ? isValidPassword(password)
                    ? "border-green-500"
                    : "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {passwordTouched && (
              <div className="absolute -translate-y-1/2 right-3 top-1/2">
                {isValidPassword(password) ? (
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
            )}
          </div>

          {/* Remember Me */}
          <label
            htmlFor="rememberMe"
            className="flex items-center cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-6 h-6 mr-3">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                  rememberMe
                    ? "bg-primary-yellow border-primary-yellow"
                    : "border-gray-300"
                }`}
              >
                {rememberMe && (
                  <svg
                    className="w-4 h-4 text-gray-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-800">Remember Me</span>
          </label>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 mt-2 font-semibold text-gray-800 transition rounded-full bg-primary-yellow hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </form>

        {loginError && (
          <div className="p-3 border border-red-200 rounded-lg bg-red-50">
            <p className="text-sm text-red-700">{loginError}</p>
          </div>
        )}

        <p className="my-6 text-sm text-center text-gray-500">or</p>

        <div className="space-y-4">
          <button
            type="button"
            className="w-full py-3 font-medium text-gray-800 transition bg-white border-2 border-gray-300 rounded-full hover:bg-gray-50"
          >
            Login with Google
          </button>
          <button
            type="button"
            className="w-full py-3 font-medium text-gray-800 transition bg-white border-2 border-gray-300 rounded-full hover:bg-gray-50"
          >
            Login with AppleID
          </button>
        </div>

        <div className="mt-6 text-sm text-center text-gray-600">
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign up here
          </a>
        </div>
      </div>
    </main>
  );
}
