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

  const [username, setUsername] = useState(userData.username || "");
  const [userBio, setUserBio] = useState(userData.user_bio || "");
  const [userDesc, setUserDesc] = useState(userData.user_desc || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await updateProfileWithImage(
        {
          username,
          user_bio: userBio,
          user_desc: userDesc,
        },
        selectedImageFile
      );
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
      navigate("/profile");
    }
  };

  // ============================================
  // JSX RENDER
  // ============================================
  return (
    <div className="flex justify-center items-center p-2.5">
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
                    userData?.user_image ||
                    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80"
                  }
                  alt="profile"
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
                {/* UserName */}
                <div>
                  <label className="block mb-1 font-medium">User Name</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-border px-4 py-2.5 text-[14px] bg-neutral-light-bg focus:outline-none focus:ring-2 focus:ring-neutral-black"
                  />
                </div>
                {/* UserBio */}
                <div>
                  <label className="block mb-1 font-medium">User Bio</label>
                  <input
                    type="text"
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-border px-4 py-2.5 text-[14px] bg-neutral-light-bg focus:outline-none focus:ring-2 focus:ring-neutral-black"
                  />
                </div>

                {/* About me */}
                <div>
                  <label className="block mb-1 font-medium">About me</label>
                  <textarea
                    rows={4}
                    value={userDesc}
                    onChange={(e) => setUserDesc(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-border px-4 py-2.5 text-[14px] bg-neutral-light-bg resize-none focus:outline-none focus:ring-2 focus:ring-neutral-black"
                  />
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
                <div className="flex justify-between pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-2 py-1 text-base font-medium text-black rounded-full bg-primary-yellow disabled:opacity-50"
                  >
                    {isSubmitting ? "..." : "Save"}
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
