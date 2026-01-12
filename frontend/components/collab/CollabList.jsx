/**
 * CollabList.jsx - Collaboration List Component
 * ==============================================
 * FORMÅL: Viser liste af collaborations med filtering og sorting
 * 
 * FEATURES:
 * 1. **Filtering**: Search query og genre filter
 * 2. **Sorting**: Recommended, time, location, paid
 * 3. **Save**: Bookmark functionality via local state
 * 4. **Expand**: En kollab ad gangen kan være expanded
 * 5. **Start Chat**: Integration med chat system
 * 
 * FILTERING LOGIC:
 * - Search query: Match titel ELLER beskrivelse
 * - Genre filter: Collaboration skal have mindst én matching genre
 * - Filtre kombineres med AND logic (begge skal matche)
 * 
 * SORTING OPTIONS:
 * - "recommended": Original rækkefølge (default)
 * - "time": Nyeste først (created_at DESC)
 * - "location": Alfabetisk efter location
 * - "paid": Betalte gigs først, så ubetalte
 * 
 * DATA NORMALISERING:
 * Backend endpoints returnerer forskellige field names:
 * - collab_title / title / name
 * - collab_description / description / body
 * - collab_genres / genres
 * Vi normaliserer alt til consistent format for filtering
 * 
 * STATE MANAGEMENT:
 * - expandedId: Hvilket kort er expanded (null = ingen)
 * - savedIds: Set af saved collaboration IDs (local state kun)
 * 
 * SAVED FUNCTIONALITY:
 * Pt. kun local state (ikke persistent i database)
 * TODO: Persist til database via saved_collaborations tabel
 * 
 * PROPS:
 * - className: Custom CSS classes
 * - variant: Display variant ("card" pt.)
 * - searchQuery: Search string fra parent
 * - selectedGenres: Array af genre strings
 * - sortBy: Sort option string
 * - collaborations: Raw data array fra backend
 * - onStartChat: Callback for chat start
 * - creatingThread: Loading state for chat
 * - currentUserId: For ownership checks
 * 
 * LAVET AF: Anders Flæng
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CollabCard from "./CollabCard.jsx";

export default function CollabList({
  className = "",
  variant = "card",
  searchQuery = "",
  selectedGenres = [],
  sortBy = "recommended",
  collaborations = [],
  onStartChat,
  creatingThread,
  currentUserId,
}) {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  // Toggle save state for en collaboration
  // Pt. kun local - skal persist til database senere
  const toggleSave = (collabId) => {
    setSavedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(collabId)) {
        newSet.delete(collabId);
      } else {
        newSet.add(collabId);
      }
      return newSet;
    });
  };

  // FILTERING: Search query og genres
  const filteredCollabs = collaborations.filter((raw) => {
    // Normalize data first
    const collab = {
      id: raw.id || raw.collab_id || raw.collabId || raw._id,
      title: raw.title || raw.collab_title || raw.name || "Untitled",
      description:
        raw.description ||
        raw.collab_description ||
        raw.body ||
        "No description",
      genres:
        Array.isArray(raw.genres) && raw.genres.length
          ? raw.genres
          : Array.isArray(raw.collab_genres)
            ? raw.collab_genres
            : [],
      location: raw.location || raw.collab_location || "",
      paid:
        typeof raw.paid !== "undefined"
          ? raw.paid
          : typeof raw.collab_paid !== "undefined"
            ? raw.collab_paid
            : null,
    };

    // Search query filter (title or description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        collab.title.toLowerCase().includes(query) ||
        collab.description.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Genre filter
    if (selectedGenres.length > 0) {
      const hasMatchingGenre = collab.genres.some((genre) =>
        selectedGenres.includes(genre)
      );
      if (!hasMatchingGenre) return false;
    }

    return true;
  });

  // Apply sorting
  const sortedCollabs = [...filteredCollabs].sort((a, b) => {
    if (sortBy === "time") {
      // Newest first (most recent created_at)
      const dateA = new Date(a.created_at || a.collab_created_at || 0);
      const dateB = new Date(b.created_at || b.collab_created_at || 0);
      return dateB - dateA;
    } else if (sortBy === "location") {
      // Alphabetical by location
      const locA = (a.location || a.collab_location || "").toLowerCase();
      const locB = (b.location || b.collab_location || "").toLowerCase();
      return locA.localeCompare(locB);
    } else if (sortBy === "paid") {
      // Only show paid gigs
      const paidA = a.paid || a.collab_paid || false;
      const paidB = b.paid || b.collab_paid || false;
      if (!paidA && !paidB) return 0;
      if (!paidA) return 1; // Move unpaid to end
      if (!paidB) return -1; // Keep paid at start
      return 0;
    }
    // Default: "recommended" - keep original order
    return 0;
  });

  // Filter out unpaid when sortBy is "paid"
  const finalCollabs =
    sortBy === "paid"
      ? sortedCollabs.filter((c) => c.paid || c.collab_paid)
      : sortedCollabs;

  return (
    <div className={` ${className}`.trim()}>
      {finalCollabs.length === 0 ? (
        <p className="text-gray-600">No collaborations found.</p>
      ) : (
        <div
          className={
            variant === "compact"
              ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-10 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3"
          }
        >
          {finalCollabs.map((raw) => {
            // Render compact variant (simple list) when requested
            if (variant === "compact") {
              const collab = {
                id: raw.id || raw.collab_id || raw.collabId || raw._id,
                title: raw.title || raw.collab_title || raw.name || "Untitled",
                description:
                  raw.description ||
                  raw.collab_description ||
                  raw.body ||
                  "No description",
                genres:
                  Array.isArray(raw.genres) && raw.genres.length
                    ? raw.genres
                    : Array.isArray(raw.collab_genres)
                      ? raw.collab_genres
                      : [],
                location: raw.location || raw.collab_location || "",
                created_at:
                  raw.created_at || raw.createdAt || raw.created || null,
                paid:
                  typeof raw.paid !== "undefined"
                    ? raw.paid
                    : typeof raw.collab_paid !== "undefined"
                      ? raw.collab_paid
                      : null,
              };

              return (
                <div
                  key={collab.id || collab.title}
                  className="p-3 bg-white border border-gray-300 rounded-lg text-[#4D3F54]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{collab.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {collab.description}
                      </p>
                    </div>
                    <div className="text-sm text-right text-gray-500">
                      {collab.paid === true && (
                        <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                          Paid
                        </span>
                      )}
                      {collab.paid === false && (
                        <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded">
                          Unpaid
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {collab.genres &&
                      collab.genres.length > 0 &&
                      collab.genres.map((g) => (
                        <span
                          key={g}
                          className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded"
                        >
                          {g}
                        </span>
                      ))}

                    {collab.location && (
                      <span className="px-2 py-1 text-xs text-gray-600 rounded bg-gray-50">
                        {collab.location}
                      </span>
                    )}
                  </div>

                  {collab.created_at && (
                    <p className="mt-2 text-xs text-gray-500">
                      Created:{" "}
                      {new Date(collab.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            }

            // Default variant - use CollabCard with exact styling
            return (
              <CollabCard
                key={raw.collab_id}
                collaboration={raw}
                onStartChat={onStartChat}
                creatingThread={creatingThread}
                savedIds={savedIds}
                toggleSave={toggleSave}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                currentUserId={currentUserId}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
