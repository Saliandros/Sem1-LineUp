import React, { useState } from "react";
/**
 * Subscription.jsx
 * Step 5: Present plan choices (monthly/yearly) before finalizing onboarding.
 * Props:
 *  - onStartTrial(plan): called with selectedPlan when user starts trial
 *  - onSkip(): skip subscription and finish onboarding
 * Internal state: selectedPlan ('monthly' | 'yearly'). Defaults to yearly.
 */
import logoLineUpDark from "../../assets/icons/logoLineUp-Dark.svg";

export function Subscription({ onStartTrial, onSkip }) {
  const [selectedPlan, setSelectedPlan] = useState("yearly");

  return (
    <div className="w-full max-w-md mx-auto p-4">
      {/* Logo/Header */}
      <div className="text-center mb-4 flex items-center justify-center gap-2">
        <img src={logoLineUpDark} alt="LineUp" className="h-7" />
        <span className="text-2xl font-bold text-primary-yellow">PRO</span>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Get full access to LineUp
      </h2>

      {/* Features List */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-gray-700 text-sm">Unlimited collabs</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-gray-700 text-sm">Unlimited connections</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-gray-700 text-sm">Advanced insights</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-gray-700 text-sm">See detailed reviews</span>
        </div>
      </div>

      {/* Pricing Options */}
      <div className="space-y-3 mb-5">
        {/* Monthly Plan */}
        <button
          onClick={() => setSelectedPlan("monthly")}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-full border-2 transition ${
            selectedPlan === "monthly"
              ? "border-primary-yellow bg-white"
              : "border-gray-300 bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Radio Circle */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              selectedPlan === "monthly"
                ? "border-primary-yellow"
                : "border-gray-300"
            }`}>
              {selectedPlan === "monthly" && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary-yellow"></div>
              )}
            </div>
            
            <div className="text-left">
              <div className="font-semibold text-gray-800 text-sm">Monthly</div>
              <div className="text-xs text-gray-600">58 kr. / month</div>
            </div>
          </div>
          <div className="font-bold text-gray-800 text-sm">58 kr.</div>
        </button>

        {/* Yearly Plan */}
        <button
          onClick={() => setSelectedPlan("yearly")}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-full border-2 transition relative ${
            selectedPlan === "yearly"
              ? "border-primary-yellow bg-white"
              : "border-gray-300 bg-white"
          }`}
        >
          {/* HIT Badge */}
          <div className="absolute -top-2 left-10 bg-primary-yellow text-gray-800 text-xs font-bold px-2 py-0.5 rounded">
            HIT
          </div>

          <div className="flex items-center gap-3">
            {/* Radio Circle */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              selectedPlan === "yearly"
                ? "border-primary-yellow"
                : "border-gray-300"
            }`}>
              {selectedPlan === "yearly" && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary-yellow"></div>
              )}
            </div>
            
            <div className="text-left">
              <div className="font-semibold text-gray-800 text-sm">Yearly</div>
              <div className="text-xs text-gray-600">29 kr. / month</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="font-bold text-gray-800 text-sm">348 kr.</div>
            <div className="bg-primary-yellow text-gray-800 text-xs font-semibold px-2 py-0.5 rounded">
              save 50%
            </div>
          </div>
        </button>
      </div>

      {/* Start Trial Button */}
      <button
        onClick={() => onStartTrial(selectedPlan)}
        className="w-full py-2.5 bg-primary-yellow text-gray-800 font-semibold rounded-full hover:opacity-90 transition mb-3"
      >
        Start my free 7-day trial
      </button>

      {/* Terms and Privacy */}
      <p className="text-center text-xs text-gray-600 mb-3">
        <a href="/terms" className="underline hover:opacity-80" style={{ color: '#4D3F54' }}>Terms of use</a> and{" "}
        <a href="/privacy" className="underline hover:opacity-80" style={{ color: '#4D3F54' }}>Privacy Policy</a>
      </p>

      {/* Skip for now */}
      <div className="w-full flex justify-center">
        <button
          onClick={onSkip}
          className="text-gray-600 text-sm font-medium underline cursor-pointer"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
