import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import ChatListItem from "../../components/chat/ChatListItem.jsx";
import { fetchAllUsersAsFriends, fetchGroupChats } from "../../data/friends.js";
import { getOrCreateThread } from "../../data/messages.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function FriendListRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hent venner når komponenten loader
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friendsData = await fetchAllUsersAsFriends();
        const groupsData = await fetchGroupChats();
        const allChats = [...friendsData, ...groupsData];
        setFriends(allChats);
      } catch (error) {
        console.error("Error loading friends:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, []);

  // Filtrer den nuværende bruger ud
  const friendsWithoutMe = friends.filter((friend) => friend.id !== user?.id);

  const handleFriendClick = async (friendId) => {
    if (isCreatingThread) return;

    setIsCreatingThread(true);
    try {
      // Tjek eller opret thread
      const thread = await getOrCreateThread(user.id, friendId);

      if (thread && thread.thread_id) {
        // Naviger til chatten
        navigate(`/chat/${thread.thread_id}`);
      }
    } catch (error) {
      console.error("Error creating/finding thread:", error);
    } finally {
      setIsCreatingThread(false);
    }
  };

  const filteredFriends = friendsWithoutMe.filter((friend) =>
    friend.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 flex flex-col w-screen h-screen overflow-hidden"
      style={{ backgroundColor: "#3F4D54" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 text-white transition-all duration-300">
        <div className="flex items-center flex-1 gap-3">
          <Link
            to="/chat"
            className="text-white transition-all duration-300 hover:text-gray-300"
            aria-label="Tilbage"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold">New Chat</h1>
          {showSearch && (
            <div className="relative flex-1 ml-3">
              <input
                type="text"
                placeholder="Search friends..."
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-1 pl-3 pr-10 text-sm text-white transition-all border rounded-full bg-white/20 placeholder-white/70 border-white/30 focus:outline-none focus:bg-white/30 focus:border-white"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="text-white transition-all duration-300 hover:text-gray-300"
            aria-label={showSearch ? "Close search" : "Search"}
          >
            <svg
              className="w-6 h-6 transition-all duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {showSearch ? (
                <path
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <>
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <path
                    strokeLinecap="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35"
                  />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Friends container med hvid baggrund */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white rounded-t-3xl">
        {/* Friends list */}
        <div className="flex-1 min-h-0 px-4 py-2 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading friends...</p>
            </div>
          ) : (
            <ChatListItem
              friends={searchQuery ? filteredFriends : friendsWithoutMe}
              onFriendClick={handleFriendClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
