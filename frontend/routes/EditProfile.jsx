import { data, Form, useNavigate } from "react-router";
import { useProfileData } from "../hooks/useProfileData";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { updateProfileWithImage } from "../lib/profileApi.js";
import { useImageUpload } from "../hooks/useImageUpload.js";
import { useLoaderData } from "react-router";

// Import komponenter
import SocialMediaLinks from "../components/profile/shared/SocialMediaLinks";
import SpotifyLinkInput from "../components/profile/edit/SpotifyLinkInput";
import EditableTagList from "../components/profile/edit/EditableTagList";
import EditableReview from "../components/profile/edit/EditableReview";
import EditableVideos from "../components/profile/edit/EditableVideos";
import EditableQuestions from "../components/profile/edit/EditableQuestions";
import ArtistsSection from "../components/profile/sections/ArtistsSection";
import CollaborationsSection from "../components/profile/sections/CollaborationsSection";
import { getCurrentUserProfile } from "../lib/api";

export async function clientLoader() {
  console.log("EditProfile clientLoader: Starting to load profile");

  try {
    const profile = await getCurrentUserProfile();
    console.log("EditProfile clientLoader: Fetched profile", profile);

    return { userData: profile };
  } catch (error) {
    console.error("EditProfile clientLoader: Failed to load profile", error);

    throw new Response("Failed to load profile", {
      status: 500,
      statusText: error.message,
    });
  }
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { userData } = useLoaderData();

  // Use new field names - start with empty strings, placeholders will show current data
  const [displayname, setDisplayname] = useState("");
  const [userBio, setUserBio] = useState("");
  const [userDesc, setUserDesc] = useState("");
  const [city, setCity] = useState("");
  const [userPhone, setUserPhone] = useState("");
  
  // Parse interests from comma-separated string to array
  const [interests, setInterests] = useState(() => {
    if (!userData.interests) return [];
    return userData.interests.split(',').map(i => i.trim()).filter(Boolean);
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interestOptions = [
    "Connect to fellow musicians",
    "Promote my music",
    "Find a band to play with",
    "Find services for my music"
  ];

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(item => item !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const {
    selectedImageFile,
    imagePreview,
    submitError,
    setSubmitError,
    handleImageChange,
  } = useImageUpload();

  const fileInputRef = useRef();
  const profile = useProfileData();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      console.log("Submitting profile data:", {
        displayname,
        user_bio: userBio,
        user_desc: userDesc,
        city,
        user_phone: userPhone,
        interests,
      });
      
      // Don't pass imageFile if not selected - let backend handle image upload only if file present
      // Use original values if fields are empty (not changed)
      const result = await updateProfileWithImage(
        {
          displayname: displayname || userData.displayname,
          user_bio: userBio || userData.user_bio,
          user_desc: userDesc || userData.user_desc,
          city: city || userData.city,
          user_phone: userPhone || userData.user_phone,
          interests: interests.join(', '), // Convert array back to comma-separated string
        },
        selectedImageFile // This will be null if no image selected
      );
      
      console.log("Profile update result:", result);
      navigate("/profile");
    } catch (error) {
      console.error("Profile update error:", error);
      setSubmitError(error.message);
      setIsSubmitting(false);
    }
  };

  // ============================================
  // JSX RENDER
  // ============================================
  return (
    <div className="flex justify-center items-center p-2.5 pb-24 lg:pb-2.5">
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-6 pointer-events-none bg-gradient-to-b to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-6 pointer-events-none bg-gradient-to-t to-transparent" />
        <div className="h-full overflow-y-auto scroll-smooth">
          {/* Profilbillede */}
          <section className="pb-6">
            <div className="flex flex-col items-center gap-3 pt-4 pb-2">
              <div className="overflow-hidden border rounded-full shadow-sm w-36 h-36 border-neutral-light-border">
                <img
                  src={
                    imagePreview ||
                    userData.user_image ||
                    "https://via.placeholder.com/400x400?text=No+Image"
                  }
                  alt="Profile picture"
                  className="object-cover w-full h-full"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="text-[15px] font-semibold text-neutral-dark-gray hover:text-neutral-black"
              >
                Edit picture
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </section>

          {/* Edit Form */}
          <section className="pb-6 ">
            <div className="bg-white rounded-4xl px-3.5 pt-4 pb-5 shadow-sm">
              <div className="flex items-center justify-center gap-10 mb-4 text-[15px]">
                <button className="pb-1 font-semibold border-b-2 text-neutral-black border-neutral-black">
                  About
                </button>
                <button className="pb-1 text-gray-400">Notes</button>
              </div>

              <Form
                onSubmit={handleSubmit}
                className="space-y-4 text-left text-[14px] text-neutral-black"
              >
                {/* Display Name */}
                <div>
                  <label className="block mb-1 font-medium">Name</label>
                  <input
                    type="text"
                    value={displayname}
                    onChange={(e) => setDisplayname(e.target.value)}
                    placeholder={userData.displayname}
                    className="w-full rounded-2xl border border-neutral-border px-4 py-2.5 text-[14px] bg-neutral-light-bg focus:outline-none focus:ring-2 focus:ring-neutral-black placeholder:text-gray-400"
                  />
                </div>
                
                {/* City */}
                <div>
                  <label className="block mb-1 font-medium">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={userData.city}
                    className="w-full rounded-2xl border border-neutral-border px-4 py-2.5 text-[14px] bg-neutral-light-bg focus:outline-none focus:ring-2 focus:ring-neutral-black placeholder:text-gray-400"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block mb-1 font-medium">Phone</label>
                  <input
                    type="tel"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder={userData.user_phone}
                    className="w-full rounded-2xl border border-neutral-border px-4 py-2.5 text-[14px] bg-neutral-light-bg focus:outline-none focus:ring-2 focus:ring-neutral-black placeholder:text-gray-400"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block mb-1 font-medium">User Bio</label>
                  <input
                    type="text"
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                    placeholder={userData.user_bio}
                    className="w-full rounded-2xl border border-neutral-border px-4 py-2.5 text-[14px] bg-neutral-light-bg focus:outline-none focus:ring-2 focus:ring-neutral-black placeholder:text-gray-400"
                  />
                </div>

                {/* About me */}
                <div>
                  <label className="block mb-1 font-medium">About me</label>
                  <textarea
                    rows={4}
                    value={userDesc}
                    onChange={(e) => setUserDesc(e.target.value)}
                    placeholder={userData.user_desc}
                    className="w-full rounded-2xl border border-neutral-border px-4 py-2.5 text-[14px] bg-neutral-light-bg resize-none focus:outline-none focus:ring-2 focus:ring-neutral-black placeholder:text-gray-400"
                  />
                </div>

                {/* Interests */}
                <div>
                  <label className="block mb-3 font-medium">I am looking to</label>
                  <div className="grid grid-cols-2 gap-3">
                    {interestOptions.map((interest) => {
                      const isSelected = interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-4 rounded-2xl transition text-center text-[13px] font-medium leading-tight ${
                            isSelected 
                              ? "bg-primary-purple text-white" 
                              : "bg-neutral-light-bg text-neutral-black border border-neutral-border hover:border-primary-purple/50"
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {submitError && <p className="text-red-500">{submitError}</p>}

                {/* What I am looking for */}
                {/* <EditableTagList
                  title="What I am looking for"
                  tags={["Band", "Jam Sessions", "New Friends"]}
                  selectedTags={profile.lookingFor}
                  onToggle={(tag) =>
                    profile.toggleItem(
                      profile.lookingFor,
                      tag,
                      profile.setLookingFor
                    )
                  }
                /> */}

                {/* Genres */}
                {/* <EditableTagList
                  title="Genres"
                  tags={["Indie", "Pop", "Acoustic"]}
                  selectedTags={profile.genres}
                  onToggle={(tag) =>
                    profile.toggleItem(profile.genres, tag, profile.setGenres)
                  }
                /> */}

                {/* Social Media */}
                {/* <SocialMediaLinks /> */}

                {/* Spotify */}
                {/* <div className="space-y-3">
                  <p className="font-medium">Spotify</p>
                  <SpotifyLinkInput
                    value={profile.spotifyUrl}
                    onChange={profile.setSpotifyUrl}
                  />
                </div> */}

                {/* Featured Review */}
                {/* <EditableReview
                  rating={profile.reviewRating}
                  count={profile.reviewCount}
                  text={profile.reviewText}
                  onRatingChange={profile.setReviewRating}
                  onCountChange={profile.setReviewCount}
                  onTextChange={profile.setReviewText}
                /> */}

                {/* Videos */}
                {/* <EditableVideos
                  videos={profile.videos}
                  onChange={profile.setVideos}
                /> */}

                {/* Artists I like */}
                {/* <div className="space-y-3">
                  <ArtistsSection artists={profile.artists} />
                </div> */}

                {/* Past Collaborations */}
                {/* <div className="space-y-3">
                  <CollaborationsSection
                    collaborations={profile.collaborations}
                  />
                </div> */}

                {/* Questions */}
                {/* <EditableQuestions
                  questions={profile.questions}
                  onChange={profile.setQuestions}
                /> */}

                {/* Save Button */}
                <div className="pt-4 flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-12 py-3 text-base font-semibold text-black rounded-full bg-primary-yellow hover:bg-primary-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </Form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
