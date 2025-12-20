import React from 'react';

const countryCodes = [
  { code: '+45', country: 'DK', flag: '🇩🇰' },
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+46', country: 'SE', flag: '🇸🇪' },
  { code: '+47', country: 'NO', flag: '🇳🇴' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Generate array of days (1-31)
const days = Array.from({ length: 31 }, (_, i) => i + 1);

// Generate array of years (from 1924 to current year)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1924 + 1 }, (_, i) => currentYear - i);

export function UserInformation({ userInfo, onChange }) {
  const [nameTouched, setNameTouched] = React.useState(false);
  const [nameFocused, setNameFocused] = React.useState(false);
  const [phoneTouched, setPhoneTouched] = React.useState(false);

  // Validate that name contains at least 2 words (first and last name)
  const isValidName = (name) => {
    const trimmed = name.trim();
    const words = trimmed.split(/\s+/).filter(word => word.length > 0);
    return words.length >= 2;
  };

  // Validate phone number based on country code
  const isValidPhone = (phone, countryCode) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/\s/g, '');
    
    switch (countryCode) {
      case '+45': // Denmark - 8 digits
        return /^\d{8}$/.test(cleanPhone);
      case '+1': // US - 10 digits
        return /^\d{10}$/.test(cleanPhone);
      case '+44': // UK - 10-11 digits
        return /^\d{10,11}$/.test(cleanPhone);
      case '+46': // Sweden - 9-10 digits
        return /^\d{9,10}$/.test(cleanPhone);
      case '+47': // Norway - 8 digits
        return /^\d{8}$/.test(cleanPhone);
      case '+49': // Germany - 10-11 digits
        return /^\d{10,11}$/.test(cleanPhone);
      default:
        return cleanPhone.length >= 8;
    }
  };

  const showNameError = nameTouched && userInfo.name && !isValidName(userInfo.name);
  const showPhoneError = phoneTouched && userInfo.phone && !isValidPhone(userInfo.phone, userInfo.countryCode || '+45');

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="mb-4 relative">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          First & Last Name
        </label>
        <input
          type="text"
          id="name"
          placeholder="Enter your first and last name"
          value={userInfo.name || ''}
          onChange={(e) => onChange({ ...userInfo, name: e.target.value })}
          onFocus={() => setNameFocused(true)}
          onBlur={() => {
            setNameFocused(false);
            setNameTouched(true);
          }}
          autoComplete="off"
          className={`appearance-none border rounded-lg w-full py-2.5 px-3 pr-12 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent ${
            nameTouched ? (isValidName(userInfo.name) ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
          }`}
        />
        {nameTouched && (
          <div className="absolute right-3 top-[42px]">
            {isValidName(userInfo.name) ? (
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
        {nameFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            <p className="text-xs font-semibold text-gray-700 mb-2">Name must contain:</p>
            <div className="space-y-1 text-xs">
              <div className={`flex items-center gap-2 ${isValidName(userInfo.name) ? "text-green-600" : "text-gray-500"}`}>
                {isValidName(userInfo.name) ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="w-4 h-4 flex items-center justify-center">•</span>
                )}
                <span>Both first and last name</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4 relative">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
          Phone Number
        </label>
        <div className="flex gap-2">
          {/* Country Code Dropdown */}
          <select
            value={userInfo.countryCode || '+45'}
            onChange={(e) => {
              onChange({ ...userInfo, countryCode: e.target.value });
              if (phoneTouched) setPhoneTouched(false);
            }}
            className="appearance-none border border-gray-300 rounded-lg py-2.5 px-3 text-gray-700 text-base leading-tight focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent w-24"
          >
            {countryCodes.map((item) => (
              <option key={item.code} value={item.code}>
                {item.country} {item.code}
              </option>
            ))}
          </select>

          {/* Phone Number Input */}
          <div className="relative flex-1">
            <input
              type="tel"
              id="phone"
              placeholder="Phone number"
              value={userInfo.phone || ''}
              onChange={(e) => onChange({ ...userInfo, phone: e.target.value })}
              onBlur={() => setPhoneTouched(true)}
              className={`appearance-none border rounded-lg w-full py-2.5 px-3 pr-12 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent ${
                phoneTouched ? (isValidPhone(userInfo.phone, userInfo.countryCode || '+45') ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
              }`}
            />
            {phoneTouched && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValidPhone(userInfo.phone, userInfo.countryCode || '+45') ? (
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
        </div>
        {showPhoneError && (
          <p className="mt-1 text-sm text-red-500">
            {(() => {
              const code = userInfo.countryCode || '+45';
              switch (code) {
                case '+45': return 'Danish phone numbers must be 8 digits';
                case '+1': return 'US phone numbers must be 10 digits';
                case '+44': return 'UK phone numbers must be 10-11 digits';
                case '+46': return 'Swedish phone numbers must be 9-10 digits';
                case '+47': return 'Norwegian phone numbers must be 8 digits';
                case '+49': return 'German phone numbers must be 10-11 digits';
                default: return 'Please enter a valid phone number';
              }
            })()}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="birthDate">
          Date of Birth
        </label>
        <input
          type="date"
          id="birthDate"
          value={userInfo.birthDate || ''}
          max={new Date().toISOString().split('T')[0]}
          onChange={(e) => onChange({ ...userInfo, birthDate: e.target.value })}
          className="appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
          style={{
            colorScheme: 'light',
          }}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">
          Where do you live
        </label>
        <input
          type="text"
          id="city"
          placeholder="Enter your city"
          value={userInfo.city || ''}
          onChange={(e) => onChange({ ...userInfo, city: e.target.value })}
          className="appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
        />
      </div>
    </div>
  );
}