import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { searchProfiles, getConnections, getCurrentUser } from "../../lib/api";

export default function Search({ closeSearch }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [connectionIds, setConnectionIds] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);

  // Load current user and connections on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUserId(user?.id);

        const connections = await getConnections();
        // Extract all user IDs from connections (both user_id_1 and user_id_2)
        const ids = new Set();
        connections.forEach(conn => {
          ids.add(conn.user_id_1);
          ids.add(conn.user_id_2);
        });
        setConnectionIds(ids);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          console.log("🔍 Searching for:", searchQuery);
          const results = await searchProfiles(searchQuery);
          console.log("✅ Search results:", results);
          setSearchResults(results);
        } catch (error) {
          console.error("❌ Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
    closeSearch();
  };

  return (
    <section className="fixed top-0 left-0 z-10 w-full h-screen fade-in bg-neutral-light-gray">
      <header className="flex justify-between p-4 gap-1.5">
        <div className="flex gap-2.5 w-full p-2.5 bg-input-background items-center rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M11.334 11.333L14.0007 13.9997"
              stroke="#555555"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667C8.80864 12.6667 10.144 12.0676 11.1096 11.0995C12.0718 10.1348 12.6667 8.80354 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333Z"
              stroke="#555555"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            className="w-full bg-transparent outline-none"
            placeholder="Search for users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
        <button
          onClick={closeSearch}
          className="text-sm cursor-pointer min-w-auto"
        >
          Cancel
        </button>
      </header>

      {/* Search Results */}
      <div className="px-4 py-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 80px)" }}>
        {isSearching && (
          <div className="text-center text-gray-500 py-8">
            Searching...
          </div>
        )}

        {!isSearching && searchQuery.trim().length > 0 && searchResults.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No users found
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((profile) => {
              const isConnected = connectionIds.has(profile.id);
              const isCurrentUser = profile.id === currentUserId;
              
              return (
                <div
                  key={profile.id}
                  onClick={() => handleProfileClick(profile.id)}
                  className="flex items-center gap-3 p-3 bg-white rounded-2xl cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                    {profile.user_image ? (
                      <img
                        src={profile.user_image}
                        alt={profile.displayname || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl text-gray-500">
                        {(profile.displayname || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {profile.displayname || "User"}
                      </h3>
                      {isCurrentUser && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                          You
                        </span>
                      )}
                      {!isCurrentUser && isConnected && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                          Connected
                        </span>
                      )}
                    </div>
                    {profile.user_bio && (
                      <p className="text-sm text-gray-500 truncate">
                        {profile.user_bio}
                      </p>
                    )}
                    {profile.city && (
                      <p className="text-xs text-gray-400">
                        {profile.city}
                      </p>
                    )}
                  </div>
                  {profile.user_type && (
                    <span className="text-xs px-2 py-1 bg-primary-yellow rounded-full text-gray-800">
                      {profile.user_type}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
