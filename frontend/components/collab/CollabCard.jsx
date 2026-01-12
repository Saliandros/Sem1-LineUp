/**
 * CollabCard.jsx - Collaboration Display Component
 * =================================================
 * FORMÅL: Viser én collaboration request som et kort med actions
 * 
 * FEATURES:
 * - Vis titel, beskrivelse, location, genres
 * - "Save" funktionalitet (bookmark)
 * - Expand/collapse lang beskrivelse
 * - "Start Chat" med collaboration owner
 * - Delete (kun hvis du er owner)
 * 
 * DATA NORMALISERING:
 * Backend returnerer forskellige field names afhængig af endpoint.
 * Vi normaliserer data til consistent format:
 * - collab_title → title
 * - collab_description → description
 * - collab_genres → genres
 * Etc.
 * 
 * SAVE FUNCTIONALITY:
 * Users kan "save" collaborations for senere
 * - Gemmes i local state (ikke persistent pt.)
 * - Gul stjerne når saved
 * - Toggle on/off
 * 
 * EXPAND/COLLAPSE:
 * Lange beskrivelser truncates
 * - "Read more" knap åbner fuld tekst
 * - "Show less" lukker igen
 * - Controlled via expandedId state i parent
 * 
 * DELETE FUNCTIONALITY:
 * - Kun synlig hvis currentUserId === collaboration.user_id
 * - Confirmation dialog før sletning
 * - API call: DELETE /api/collaborations/:id
 * - Page reload efter success (simpel data sync)
 * 
 * START CHAT:
 * - onStartChat callback trigger thread creation
 * - Navigerer til chat med collaboration owner
 * - Loading state under thread creation
 * 
 * PROPS:
 * - collaboration: Collaboration data objekt
 * - onStartChat: Callback for chat start
 * - creatingThread: Loading state
 * - savedIds: Array af saved collaboration IDs
 * - toggleSave: Toggle save state
 * - expandedId: Hvilket kort er expanded
 * - setExpandedId: Setter for expanded state
 * - currentUserId: For at tjekke ownership
 * 
 * STYLING:
 * - Card design med shadow og hover effects
 * - Yellow accent color (brand)
 * - Responsive images
 * - Icon buttons for actions
 * 
 * LAVET AF: Anders Flæng
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function CollabCard({
  collaboration,
  onStartChat,
  creatingThread,
  savedIds,
  toggleSave,
  expandedId,
  setExpandedId,
  currentUserId, // Tjek om user ejer denne collaboration
}) {
  const navigate = useNavigate();
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  const handleDeleteCollab = async () => {
    if (!confirm("Are you sure you want to delete this collaboration?")) return;
    
    const collabId = collaboration.collab_id || collaboration.id;
    
    try {
      const VITE_API_URL = import.meta.env.VITE_API_URL;
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        alert('Not authenticated');
        return;
      }

      console.log('Deleting collab:', collabId);
      console.log('User ID:', currentUserId);
      console.log('Collab owner:', collaboration.user_id);
      
      const response = await fetch(`${VITE_API_URL}/api/collaborations/${collabId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Delete response:', response.status, data);
      
      if (response.ok) {
        alert('Collaboration deleted successfully');
        window.location.reload();
      } else {
        alert(`Failed to delete collaboration: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting collaboration:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Normalize raw data (same logic as CollabList)
  const collab = {
    id:
      collaboration.id ||
      collaboration.collab_id ||
      collaboration.collabId ||
      collaboration._id,
    title:
      collaboration.title ||
      collaboration.collab_title ||
      collaboration.name ||
      "Untitled",
    description:
      collaboration.description ||
      collaboration.collab_description ||
      collaboration.body ||
      "No description",
    genres:
      Array.isArray(collaboration.genres) && collaboration.genres.length
        ? collaboration.genres
        : Array.isArray(collaboration.collab_genres)
          ? collaboration.collab_genres
          : [],
    location: collaboration.location || collaboration.collab_location || "",
    created_at:
      collaboration.created_at ||
      collaboration.createdAt ||
      collaboration.created ||
      null,
    paid:
      typeof collaboration.paid !== "undefined"
        ? collaboration.paid
        : typeof collaboration.collab_paid !== "undefined"
          ? collaboration.collab_paid
          : null,
    image:
      collaboration.image ||
      collaboration.collab_image ||
      collaboration.media ||
      null,
    user_id: collaboration.user_id,
    author:
      (collaboration.profiles && {
        username: collaboration.profiles.username,
        image: collaboration.profiles.user_image,
      }) ||
      (collaboration.profile && {
        username: collaboration.profile.username,
        image: collaboration.profile.user_image,
      }) ||
      (collaboration.user && {
        username: collaboration.user.username,
        image: collaboration.user.user_image,
      }) ||
      null,
  };

  const shortDesc =
    collab.description && collab.description.length > 100
      ? collab.description.slice(0, 100).trim() + "..."
      : collab.description;

  const isExpanded = expandedId === collab.id;
  const displayDesc = isExpanded ? collab.description : shortDesc;
  const showReadMore = true;

  // Extract dynamic keyword from description
  const getKeywordFromDescription = (desc) => {
    if (!desc) return collab.genres[0] || "musician";
    const keywords = [
      "Vocalist",
      "vocalist",
      "singer",
      "Singer",
      "Producer",
      "producer",
      "beats",
      "Beats",
      "Guitarist",
      "guitarist",
      "guitar",
      "Guitar",
      "Bassist",
      "bassist",
      "bass",
      "Bass",
      "Drummer",
      "drummer",
      "drums",
      "Drums",
      "Composer",
      "composer",
      "composition",
      "Composition",
      "Engineer",
      "engineer",
      "mixing",
      "Mixing",
      "Lyricist",
      "lyricist",
      "lyrics",
      "Lyrics",
      "DJ",
      "dj",
      "remix",
      "Remix",
      "Pianist",
      "pianist",
      "keys",
      "Keys",
    ];

    for (const keyword of keywords) {
      if (desc.toLowerCase().includes(keyword.toLowerCase())) {
        return keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
      }
    }
    return collab.genres[0] || "musician";
  };

  const dynamicKeyword = getKeywordFromDescription(collab.description);

  // Calculate relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="p-4 overflow-hidden bg-white text-[#4D3F54] rounded-lg">
      <div className="">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center justify-center w-10 h-10 overflow-hidden rounded-full border-[0.6px] border-gray-200"
              aria-label="View profile"
            >
              {collab.author && collab.author.image ? (
                <img
                  src={collab.author.image}
                  alt={collab.author.username || "user"}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-sm font-bold text-gray-600 bg-gray-200">
                  {collab.author?.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </button>
            <div className="text-sm text-[#4D3F54]">
              <div className="font-medium">
                {(collab.author?.username || "Someone").split(" ")[0]}
                <span className="ml-1" style={{ color: "#4D3F54" }}>
                  requested
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="bookmark"
              onClick={() => toggleSave(collab.id)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill={savedIds.has(collab.id) ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{
                  color: savedIds.has(collab.id) ? "#FFCF70" : "#999999",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5v14l7-5 7 5V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"
                />
              </svg>
            </button>
            {currentUserId === collab.user_id && (
              <div className="relative">
                <button 
                  onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                  className="p-2 text-gray-600 rounded-md hover:bg-gray-100"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                  </svg>
                </button>
                {showDeleteMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={() => {
                        handleDeleteCollab();
                        setShowDeleteMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 mb-3 border-b border-gray-200" />

        <h3
          className="mt-4 font-bold text-[18px]"
          style={{
            color: "#000000",
            fontWeight: 700,
          }}
        >
          {collab.title}
        </h3>

        <div
          className="flex flex-col gap-2 mt-3"
          style={{
            color: "#555555",
            fontSize: "16px",
            fontWeight: 400,
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            {collab.genres.map((g) => (
              <span
                key={g}
                className="px-2 rounded-full"
                style={{
                  border: "1px solid #555555",
                  height: "28px",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                #{g}
              </span>
            ))}
            {collab.paid === true && (
              <span
                className="px-2 rounded-full"
                style={{
                  border: "1px solid #555555",
                  height: "28px",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                #paid-gig
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap">
            {collab.location && <span>{collab.location}</span>}
            {collab.created_at && (
              <span style={{ color: "#555555" }}>
                {collab.location ? " - " : ""}
                {getRelativeTime(collab.created_at)}
              </span>
            )}
          </div>
        </div>

        {collab.image ? (
          <div className="flex justify-center mt-4">
            <img
              src={collab.image}
              alt="collab"
              className="object-cover w-full"
              style={{
                borderRadius: "25px",
                height: "220px",
              }}
            />
          </div>
        ) : null}

        <p className="mt-4 leading-relaxed text-[16px] font-normal text-neutral-grey w-full">
          {displayDesc}
        </p>

        <div className="flex items-center justify-between mt-4">
          {showReadMore ? (
            <button
              onClick={() => setExpandedId(isExpanded ? null : collab.id)}
              className="font-bold text-base text-[#555555]"
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={() => onStartChat(collab.user_id)}
            disabled={creatingThread}
            className="inline-flex items-center gap-2 px-2 py-2 leading-none rounded-full min-w-fit primary-btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#2F2F2F"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>Start a chat </span>
          </button>
        </div>
      </div>
    </div>
  );
}
