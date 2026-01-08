import { Link, useLoaderData, useParams, useRevalidator } from "react-router";

import { getCurrentUserProfile, getProfileById, getCurrentUser } from "../lib/api";

// Profile sections
import ProfileHeader from "../components/profile/sections/ProfileHeader";
import BasicInfo from "../components/profile/sections/BasicInfo";
import ArtistsSection from "../components/profile/sections/ArtistsSection";
import VideosSection from "../components/profile/sections/VideosSection";
import CollaborationsSection from "../components/profile/sections/CollaborationsSection";
import QuestionsSection from "../components/profile/sections/QuestionsSection";
import SpotifyEmbed from "../components/profile/shared/SpotifyEmbed";

export async function clientLoader({ params }) {
  console.log("profile clientLoader: Starting to load profile", params);

  try {
    const currentUser = await getCurrentUser();
    const userId = params.userId;
    
    // If userId is provided, load that user's profile, otherwise load current user's profile
    const profile = userId 
      ? await getProfileById(userId)
      : await getCurrentUserProfile();
    
    // Check if viewing own profile
    const isOwnProfile = !userId || (currentUser && userId === currentUser.id);
    
    console.log("profile clientLoader: Fetched profile", profile, "isOwnProfile:", isOwnProfile);
    return { profile, isOwnProfile };
  } catch (error) {
    console.error("profile clientLoader: Failed to load profile", error);
    return { error: error.message, profile: null, isOwnProfile: false };
  }
}

/**
 * ProfileScreen
 * Displays user profile in read-only mode
 */
export default function ProfileScreen() {
  const loaderData = useLoaderData();
  const params = useParams();
  const revalidator = useRevalidator();

  const profileData = loaderData?.profile;
  const isOwnProfile = loaderData?.isOwnProfile;

  // Callback to refresh profile data after connection changes
  const handleConnectionChange = () => {
    revalidator.revalidate();
  };

  // If profile is not yet loaded, return null (let React Router handle it)
  if (!profileData && !loaderData?.error) {
    return null;
  }

  // Show error message if there was an error loading the profile
  if (loaderData?.error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-neutral-light-gray">
        <div className="p-6 text-center bg-white shadow-sm rounded-4xl">
          <h2 className="mb-2 text-xl font-bold text-red-600">Error Loading Profile</h2>
          <p className="text-gray-600">{loaderData.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 pb-24 bg-neutral-light-gray">
      <div className="relative w-full h-full">
        {/* Gradient overlays */}
        <div className="absolute inset-x-0 top-0 h-6 pointer-events-none bg-gradient-to-b from-neutral-light-gray to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-6 pointer-events-none bg-gradient-to-t from-neutral-light-gray to-transparent" />
        <div className="flex flex-col gap-3.5 h-full overflow-y-auto scroll-smooth pb-4">
          {/* Profile Header */}
          <ProfileHeader 
            profileData={profileData} 
            isOwnProfile={isOwnProfile}
            onConnectionChange={handleConnectionChange}
          />

          {/* About Section */}
          <section>
            <div className="px-6 pt-4 pb-5 bg-white shadow-sm rounded-4xl">
              {/* Tabs */}
              <div className="flex items-center justify-center gap-10 mb-4 text-[15px]">
                <button className="pb-1 font-semibold border-b-2 text-neutral-black border-neutral-black">
                  About
                </button>

                <Link to="/notes">
                  <button className="pb-1 text-gray-400">Notes</button>
                </Link>
              </div>

              {/* Basic Info */}
              <BasicInfo profileData={profileData} />

              {/* Dynamic Sections */}
              <div className="mt-4 space-y-4">
                {profileData.spotify_url && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Spotify</h3>
                    <SpotifyEmbed spotifyUrl={profileData.spotify_url} />
                  </div>
                )}
                <ArtistsSection artists={profileData.artists || []} />
                <VideosSection videos={profileData.videos || []} />
                <CollaborationsSection
                  collaborations={profileData.collaborations || []}
                />
                <QuestionsSection questions={profileData.questions || []} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
