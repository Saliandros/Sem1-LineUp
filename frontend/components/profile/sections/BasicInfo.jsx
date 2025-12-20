import { MapPin, Phone } from "lucide-react";

/**
 * Basic Info Komponent
 * Viser grundlæggende profil information (name, headline, about, tags, contact)
 * Receives profileData as prop from parent route
 */

export default function BasicInfo({ profileData }) {
  const city = profileData?.city || "";
  const phone = profileData?.user_phone || "";
  const bio = profileData?.user_bio || "";
  const aboutMe = profileData?.user_desc || "";
  
  // Parse interests from comma-separated string
  const interests = profileData?.interests 
    ? profileData.interests.split(',').map(i => i.trim()).filter(Boolean)
    : [];

  // All available interest options
  const interestOptions = [
    "Connect to fellow musicians",
    "Promote my music",
    "Find a band to play with",
    "Find services for my music"
  ];

  // No profile data state
  if (!profileData) {
    return (
      <div className="space-y-4 text-left text-[14px] text-neutral-black">
        <p className="text-gray-500">No profile data found. Please complete your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-left text-[14px] text-neutral-black">
      {/* Bio */}
      <div>
        <p className="mb-1 font-semibold text-[15px]">User Bio</p>
        <p className="text-[15px] leading-relaxed text-gray-400">
          {bio || "No Information written"}
        </p>
      </div>

      {/* About me */}
      <div>
        <p className="mb-1 font-semibold text-[15px]">About me</p>
        <p className="text-[15px] leading-relaxed whitespace-pre-line text-gray-400">
          {aboutMe || "No Information written"}
        </p>
      </div>

      {/* Contact Info */}
      {(city || phone) && (
        <div>
          <p className="mb-2 font-semibold text-[15px]">Contact</p>
          <div className="space-y-1 text-[15px]">
            {city && (
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                {city}
              </p>
            )}
            {phone && (
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                {phone}
              </p>
            )}
          </div>
        </div>
      )}

      {/* What I am looking for */}
      <div>
        <p className="mb-2 font-semibold text-[15px]">I am looking to</p>
        <div className="grid grid-cols-2 gap-2">
          {interestOptions.map((interest, idx) => {
            const isSelected = interests.includes(interest);
            return (
              <div
                key={idx}
                className={`px-3 py-2 text-[13px] font-medium text-center rounded-2xl ${
                  isSelected
                    ? "bg-primary-purple text-white"
                    : "bg-white text-neutral-black border-2 border-neutral-border"
                }`}
              >
                {interest}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
