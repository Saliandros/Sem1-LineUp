// step 4: frontend/components/onboarding/Interests.jsx

// denne komponent bruges i onboarding flowet til at vælge brugerens interesser
// brugeren kan vælge mellem flere foruddefinerede interesser
// og baseret på valget kan vi tilpasse brugeroplevelsen senere

// denne funktion er i denne version lavet til at blive vist på profil siden
// på denne måde er det ikke bindende og kun brugeren kan tilpasse sine interesser senere

import React, { useState } from "react";


const interestOptions = [
  "Connect to fellow musicians",
  "Promote my music",
  "Find a band to play with",
  "Find services for my music"
];

export function Interests({ selectedInterests, onChange, onContinue, onSkip }) {
  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      onChange(selectedInterests.filter(item => item !== interest));
    } else {
      onChange([...selectedInterests, interest]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8">I am looking to</h2>
      
      <div className="space-y-4 mb-8">
        {interestOptions.map((interest) => {
          const isSelected = selectedInterests.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-full border-2 transition ${
                isSelected 
                  ? "border-primary-yellow bg-white" 
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            >
              {/* Checkbox Circle */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                isSelected 
                  ? "border-primary-yellow bg-primary-yellow" 
                  : "border-gray-300"
              }`}>
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              
              {/* Text */}
              <span className="text-left text-gray-800 font-medium">{interest}</span>
            </button>
          );
        })}
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        disabled={selectedInterests.length === 0}
        className={`w-full py-3 rounded-full font-semibold transition ${
          selectedInterests.length > 0
            ? "bg-primary-yellow text-gray-800 hover:opacity-90"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Continue
      </button>

      {/* Skip for now */}
      <div className="w-full flex justify-center mt-4">
        <button
          onClick={onSkip}
          className="text-gray-600 font-medium underline cursor-pointer"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
