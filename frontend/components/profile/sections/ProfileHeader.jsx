import { useEffect, useState } from "react";
import { Link, useNavigation } from "react-router";
import { supabase } from "../../../lib/supabaseClient";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Profile Header Komponent
 * Viser profilbillede, stats, navn og action knapper (Edit/Share eller Connect)
 * Uses Supabase client directly for data fetching
 */
export default function ProfileHeader({ profileData, isOwnProfile = true }) {
  console.log(profileData);

  // Display full name if it exists (new users), otherwise show username (old users)
  const displayName = profileData?.username || profileData?.displayname || "User";
  const userImage = profileData?.user_image || "";
  const userBio =
    profileData?.user_bio || profileData?.user_desc || "No bio yet";
  const userCity = profileData?.city || "";
  const connectionsCount = profileData?.connections_count || 0;
  const notesCount = profileData?.notes_count || 0;
  const verified = profileData?.verified || false;

  return (
    <section>
      <div className="relative px-6 pt-10 pb-8 text-center text-white bg-secondary-slate rounded-4xl">
        {/* Profilbillede */}
        <div className="absolute -translate-x-1/2 left-1/2 top-4">
          <div className="w-36 h-36 rounded-full border-[6px] border-neutral-light-gray overflow-hidden bg-gray-300">
            {userImage ? (
              <img
                src={userImage}
                alt={`${displayName}'s profile`}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-4xl text-gray-500">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 mb-6 grid grid-cols-3 text-[13px]">
          <div className="flex flex-col">
            <span className="text-[20px] font-semibold leading-tight">
              {connectionsCount}
            </span>
            <span className="text-[12px] text-gray-200">Connections</span>
          </div>
          <div />
          <div className="flex flex-col">
            <span className="text-[20px] font-semibold leading-tight">
              {notesCount}
            </span>
            <span className="text-[12px] text-gray-200">Notes</span>
          </div>
        </div>

        {/* Navn + rolle */}
        <div className="flex items-center justify-center gap-1 mb-1">
          <h1 className="text-[20px] font-semibold">{displayName}</h1>
          {verified && <span className="text-[16px]">✅</span>}
        </div>
        <p className="text-[12px] text-gray-200 mb-6">
          {userBio}
          {userCity && ` • ${userCity}`}
        </p>

        {/* Knapper (Edit / Share profile eller Connect) */}
        <div className="flex justify-center gap-3">
          {isOwnProfile ? (
            <>
              <Link
                to="/edit-profile"
                className="flex-1 py-3 rounded-full bg-gradient-to-b from-secondary-gradient-light to-secondary-gradient-dark text-[14px] font-medium border border-secondary-border-gray shadow text-center"
              >
                Edit profile
              </Link>
              <button className="flex-1 py-3 rounded-full bg-gradient-to-b from-secondary-gradient-light to-secondary-gradient-dark text-[14px] font-medium border border-secondary-border-gray shadow">
                Share profile
              </button>
            </>
          ) : (
            <>
              <button className="flex-1 py-3 rounded-full bg-gradient-to-b from-secondary-gradient-light to-secondary-gradient-dark text-[14px] font-medium border border-secondary-border-gray shadow">
                Connect
              </button>
              <button className="flex-1 py-3 rounded-full bg-gradient-to-b from-secondary-gradient-light to-secondary-gradient-dark text-[14px] font-medium border border-secondary-border-gray shadow">
                Message
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
