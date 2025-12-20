import { useState, useEffect } from "react";
import CollabList from "../components/collab/CollabList.jsx";
import FriendsList from "../components/FriendsList.jsx";
import { useLoaderData } from "react-router";
import { useAuth } from "../contexts/AuthContext.jsx";
import { fetchAllUsersAsFriends } from "../data/friends.js";
import { supabase } from "../lib/supabaseClient.js";
import { useChat } from "../hooks/useChat.js";

// Genre liste til filtering
const genreList = [
  "Question",
  "Concert",
  "Equipment",
  "Tutorial",
  "Music-theory",
  "Recording",
  "Guitar",
  "Singing",
  "Strings",
  "Saxophones",
  "Keys",
];

export async function clientLoader() {
  try {
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
    // Fetch both collaborations and friends in parallel
    const [collaborationsRes, friends] = await Promise.all([
      fetch(`${API_BASE}/api/collaborations`),
      fetchAllUsersAsFriends(),
    ]);

    console.log("Response status:", collaborationsRes.status);

    if (!collaborationsRes.ok) {
      const errorText = await collaborationsRes.text();
      console.error("Backend error response:", errorText);
      throw new Error(
        `Backend error ${collaborationsRes.status}: ${errorText}`
      );
    }

    const data = await collaborationsRes.json();
    console.log("Fetched data:", data);
    return {
      collaborations: data.collaborations || data || [],
      friends: friends || [],
      error: null,
    };
  } catch (err) {
    console.error("Failed to fetch collaborations:", err);
    return { collaborations: [], friends: [], error: err.message };
  }
}

export default function Services() {
  const loaderData = useLoaderData();
  const collaborations = loaderData?.collaborations || [];
  const friends = loaderData?.friends || [];
  const { user } = useAuth();
  const [allFriends, setAllFriends] = useState([]);
  const { startChat, creatingThread } = useChat(user);

  useEffect(() => {
    if (friends && user?.id) {
      const filteredFriends = friends.filter((f) => f.id !== user.id);
      setAllFriends(filteredFriends);
    } else {
      setAllFriends(friends || []);
    }
  }, [friends, user?.id]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showMoreGenres, setShowMoreGenres] = useState(false);
  const [genreSearchQuery, setGenreSearchQuery] = useState("");
  const [showSortBy, setShowSortBy] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const availableGenres = genreList;

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setGenreSearchQuery("");
  };

  const filteredGenres = availableGenres.filter((genre) =>
    genre.toLowerCase().includes(genreSearchQuery.toLowerCase())
  );

  return (
    <main className="p-4 pb-24 ">
      <div className="flex flex-col gap-4 mx-auto">
        <div
          className={`w-full h-9 overflow-hidden transition-all duration-400 ease-in-out ${
            showFilters ? "max-h-0 opacity-0" : "max-h-9 opacity-100"
          }`}
        >
          <div className="flex items-center gap-2 h-9">
            <div className="relative flex items-center flex-1 h-9">
              <svg
                className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 stroke-neutral-grey"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 pl-12 text-base font-medium border-0 rounded-lg h-9 bg-input-background text-neutral-grey focus:outline-none placeholder:text-neutral-grey placeholder:opacity-70"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-3 px-3 h-9 text-base text-[#4D3F54] bg-neutral-light-gray transition rounded-lg hover:opacity-80"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round" />
                <line x1="6" y1="12" x2="18" y2="12" strokeLinecap="round" />
                <line x1="8" y1="18" x2="16" y2="18" strokeLinecap="round" />
              </svg>
              Filter
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="">
            <div
              className={` w-full bg-[#F5F5F5] border border-[#CCCCCC] rounded-[25px] overflow-hidden box-border transition-all duration-400 ease-in-out ${
                showFilters
                  ? "max-h-[1000px] opacity-100 p-4"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="">
                <div className="flex items-center justify-between mb-6">
                  {/* Sort By Group */}
                  <div className="border border-[#CCCCCC] rounded-[25px] overflow-hidden">
                    <button
                      onClick={() => setShowSortBy(!showSortBy)}
                      className="flex items-center gap-2 px-3 py-2 transition hover:bg-gray-50"
                    >
                      <svg
                        className="w-5 h-5 stroke-neutral-grey"
                        fill="none"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <line
                          x1="4"
                          y1="6"
                          x2="20"
                          y2="6"
                          strokeLinecap="round"
                        />
                        <line
                          x1="6"
                          y1="12"
                          x2="18"
                          y2="12"
                          strokeLinecap="round"
                        />
                        <line
                          x1="8"
                          y1="18"
                          x2="16"
                          y2="18"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-[16px] font-medium text-neutral-grey">
                        {sortBy === "time"
                          ? "Time"
                          : sortBy === "location"
                            ? "Location"
                            : sortBy === "paid"
                              ? "Paid"
                              : "Sort by"}
                      </span>
                    </button>

                    {/* Sort By Dropdown */}
                    <div
                      className={`border-t border-[#E5E5E5] overflow-hidden transition-all duration-300 ease-in-out ${
                        showSortBy
                          ? "max-h-[200px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSortBy(sortBy === "time" ? "recommended" : "time");
                          setShowSortBy(false);
                        }}
                        className="block w-full px-4 py-3 text-base text-left text-neutral-grey border-b border-[#E5E5E5] transition hover:bg-gray-50"
                      >
                        Time
                      </button>
                      <button
                        onClick={() => {
                          setSortBy(
                            sortBy === "location" ? "recommended" : "location"
                          );
                          setShowSortBy(false);
                        }}
                        className="block w-full px-4 py-3 text-base text-left text-neutral-grey border-b border-[#E5E5E5] transition hover:bg-gray-50"
                      >
                        Location
                      </button>
                      <button
                        onClick={() => {
                          setSortBy(sortBy === "paid" ? "recommended" : "paid");
                          setShowSortBy(false);
                        }}
                        className="block w-full px-4 py-3 text-base text-left transition text-neutral-grey hover:bg-gray-50"
                      >
                        Paid
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-base font-medium text-neutral-grey"
                  >
                    Close
                  </button>
                </div>

                {/* Genre Filter */}
                <div className="mb-4">
                  <label className="block mb-3 text-base font-medium text-neutral-grey">
                    Genre
                  </label>

                  {/* Search Input */}
                  <div className="flex items-center w-full gap-2 p-2.5 mb-3 rounded-full bg-neutral-light-gray">
                    <input
                      className="w-full px-2 bg-transparent border-none outline-none text-neutral-grey"
                      placeholder="Search..."
                      type="search"
                      value={genreSearchQuery}
                      onChange={(e) => setGenreSearchQuery(e.target.value)}
                      aria-label="Search genres"
                    />
                  </div>

                  {/* Available Genres */}
                  <div
                    className={`overflow-hidden transition-all duration-600 ease-in-out ${
                      showMoreGenres ? "max-h-[500px]" : "max-h-[100px]"
                    }`}
                  >
                    <div className="flex flex-wrap gap-2">
                      {filteredGenres.map((genre) => {
                        const isSelected = selectedGenres.includes(genre);
                        return (
                          <button
                            key={genre}
                            onClick={() => toggleGenre(genre)}
                            className={`px-3 h-7 inline-flex items-center leading-none transition border rounded-full hover:border-gray-500 ${
                              isSelected
                                ? "bg-neutral-black border-neutral-black text-white"
                                : "bg-transparent border-neutral-grey text-neutral-grey"
                            }`}
                          >
                            {genre}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {filteredGenres.length > 8 && (
                    <button
                      onClick={() => setShowMoreGenres(!showMoreGenres)}
                      className="mt-3 text-sm font-medium text-neutral-grey"
                    >
                      {showMoreGenres ? "See less" : "See more"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <CollabList
          variant="card"
          searchQuery={searchQuery}
          selectedGenres={selectedGenres}
          sortBy={sortBy}
          collaborations={collaborations}
          onStartChat={startChat}
          creatingThread={creatingThread}
        />
      </div>
    </main>
  );
}
