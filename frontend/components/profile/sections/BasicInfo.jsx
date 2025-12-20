import TagList from "../shared/TagList";
import SocialMediaLinks from "../shared/SocialMediaLinks";
import SpotifyEmbed from "../shared/SpotifyEmbed";
import ReviewSnippet from "../shared/ReviewSnippet";
import { getCurrentUserProfile } from "../../../lib/api";

/**
 * Basic Info Komponent
 * Viser grundlæggende profil information (name, headline, about, tags, spotify, review, social media)
 * Receives profileData as prop from parent route
 */

export default function BasicInfo({ profileData }) {
  const aboutMe = profileData?.user_desc || "No description yet.";
  const lookingFor = profileData?.user_interest || [];
  const genres = profileData?.user_genre || [];
  const spotifyUrl = profileData?.user_music || "";

  // Social media from jsonb field
  const socialMedia = profileData?.user_social || {};

  // Artist data
  const artistData = profileData?.user_artist || "";

  // Default review data (you might want to add these fields to your database)
  const reviewRating = 5;
  const reviewCount = 0;
  const reviewText =
    "“Freja’s music feels like a late-night conversation you didn’t know you needed — tender, nostalgic, and full of quiet strength. Her sound drifts somewhere between dream and reality, and you can’t help but get lost in it.” – Anna";


  // No profile data state
  if (!profileData) {
    return (
      <div className="space-y-4 text-left text-[14px] text-neutral-black">
        <p className="text-gray-500">No profile data found. Please complete your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left text-[14px] text-neutral-black">
      {/* About me */}
      <div>
        <p className="mb-1 font-semibold text-[15px]">About me</p>
        <p className="text-[15px] leading-relaxed whitespace-pre-line">
          {aboutMe}
        </p>
      </div>

      {/* What I am looking for */}
      {lookingFor.length > 0 && (
        <TagList
          title="What I am looking for"
          tags={lookingFor}
          variant="dark"
        />
      )}

      {/* Genres */}
      {genres.length > 0 && (
        <TagList title="Genres" tags={genres} variant="dark" />
      )}

      {/* Spotify */}
      {spotifyUrl && (
        <div className="space-y-2">
          <p className="font-semibold text-[15px]">Spotify</p>
          <SpotifyEmbed spotifyUrl={spotifyUrl} />
        </div>
      )}

      {/* Featured review - Only show if there's review data */}
      {reviewText && (
        <div className="space-y-2">
          <p className="font-semibold text-[15px]">Featured review</p>
          <ReviewSnippet
            rating={reviewRating}
            count={reviewCount}
            text={reviewText}
          />
        </div>
      )}

      {/* Social media */}
      <SocialMediaLinks />
    </div>
  );
}
