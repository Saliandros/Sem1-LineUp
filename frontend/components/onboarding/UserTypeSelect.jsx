/**
 * UserTypeSelect.jsx - Onboarding Step 2
 * =======================================
 * FORMÅL: Vælg bruger type (musician vs service-provider)
 * 
 * BRUGER TYPER:
 * - 'musician': Musikere der søger samarbejder og services
 * - 'service-provider': Folk der tilbyder services til musikere
 *   (producers, sound engineers, fotografer, etc.)
 * 
 * UI DESIGN:
 * - To store kort med hover effekt
 * - Selected state med gul border (brand color)
 * - Checkmark animation når valgt
 * - Continue knap disabled indtil valg
 * 
 * STATE MANAGEMENT:
 * - userType state er i parent component (GetStartedRoute)
 * - Vi modtager setUserType som prop til at opdatere
 * - Controlled component pattern
 * 
 * PROPS:
 * - userType: Current selected value
 * - setUserType: Setter function
 * - onContinue: Callback når Continue klikkes
 * 
 * HVORFOR VIGTIGT:
 * user_type gemmes i profiles table og bruges til:
 * - Filtrering af content
 * - Personalisering af features
 * - Matchmaking algoritmer
 * 
 * LAVET AF: Jimmi Larsen
 */

import React from "react";

export function UserTypeSelect({ userType, setUserType, onContinue }) {
  return (
    <>
      <div className="space-y-4">
        {/* I am a musician */}
        <button
          onClick={() => setUserType('musician')}
          className={`w-full bg-white border-2 rounded-3xl p-6 text-center transition ${
            userType === 'musician' ? 'border-primary-yellow' : 'border-gray-300 hover:border-primary-yellow'
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">I am a musician</h3>
          <p className="text-sm text-gray-600 mb-4">I am a musician looking for collaborations and services</p>
          <div className="flex justify-center">
            <div className={`w-8 h-8 rounded-full border-2 transition flex items-center justify-center ${
              userType === 'musician' ? 'border-primary-yellow bg-primary-yellow' : 'border-gray-300'
            }`}>
              <svg className={`w-5 h-5 text-white transition ${userType === 'musician' ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Not a musician */}
        <button
          onClick={() => setUserType('service-provider')}
          className={`w-full bg-white border-2 rounded-3xl p-6 text-center transition ${
            userType === 'service-provider' ? 'border-primary-yellow' : 'border-gray-300 hover:border-primary-yellow'
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Not a musician</h3>
          <p className="text-sm text-gray-600 mb-4">I want to provide services for musicians</p>
          <div className="flex justify-center">
            <div className={`w-8 h-8 rounded-full border-2 transition flex items-center justify-center ${
              userType === 'service-provider' ? 'border-primary-yellow bg-primary-yellow' : 'border-gray-300'
            }`}>
              <svg className={`w-5 h-5 text-white transition ${userType === 'service-provider' ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={onContinue}
          disabled={!userType}
          className={`font-semibold px-12 py-3 rounded-full transition ${
            userType ? 'bg-primary-yellow text-gray-800 hover:opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </>
  );
}
