import { useEffect, useState } from "react";
import { useLoaderData, Link } from "react-router";
import Navbar from "../components/Navbar.jsx";
import ChatListItem from "../components/ChatListItem.jsx";
import { getUserThreads, deleteThread, getUserGroupThreads, getThreadParticipantsWithProfiles } from "../data/messages.js";
import { fetchAllUsersAsFriends } from "../data/friends.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { supabase } from "../lib/supabaseClient.js";

export async function loader() {
  // Denne loader kræver auth context - vi henter det gennem useAuth i komponenten
  // Returnerer bare empty, komponenten henter data når mounted
  return { activeChats: [], groups: [] };
}

export default function ChatListRoute() {
  const { user } = useAuth();
  const [activeChats, setActiveChats] = useState([]);
  const [allFriends, setAllFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("chats");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Hent threads og alle venner fra databasen når komponenten loader
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      try {
        const threads = await getUserThreads(user.id);
        const allUsersAsFriends = await fetchAllUsersAsFriends();

        // Filter threads til kun 1-on-1 chats (2 deltagere)
        const oneOnOneChats = [];
        
        for (const thread of threads) {
          // Hent participants for denne thread
          const { data: participants, error } = await supabase
            .from("thread_participants")
            .select("user_id")
            .eq("thread_id", thread.thread_id);

          if (error) {
            console.error("Error fetching participants:", error);
            continue;
          }

          // Kun threads med præcis 2 deltagere er 1-on-1 chats
          if (participants && participants.length === 2) {
            const otherUserId = participants
              .map(p => p.user_id)
              .find(id => id !== user.id);

            if (otherUserId) {
              const friendData = allUsersAsFriends.find(
                (f) => f.id === otherUserId
              );

              oneOnOneChats.push({
                id: thread.thread_id,
                title: friendData?.title || friendData?.displayname || "Unknown",
                avatar: friendData?.user_image || friendData?.avatar,
                currentUser: {
                  id: user.id,
                  avatar: user.user_image,
                  username: user.username,
                },
              });
            }
          }
        }

        setActiveChats(oneOnOneChats);
        setAllFriends(allUsersAsFriends);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Hent gruppe threads fra databasen
  useEffect(() => {
    const loadGroupData = async () => {
      if (!user?.id) return;

      try {
        const groupThreads = await getUserGroupThreads(user.id);
        
        // For hver gruppe thread, hent deltagernes navne til at lave en titel
        const groupsWithTitles = await Promise.all(
          groupThreads.map(async (thread) => {
            console.log("🏷️ Processing group thread:", thread.thread_id, "group_name:", thread.group_name);
            
            const participants = await getThreadParticipantsWithProfiles(thread.thread_id);
            console.log("🏷️ Participants for thread:", thread.thread_id, participants);
            
            // Brug gruppe navn hvis det findes, ellers brug deltager navne
            let title = thread.group_name;
            if (!title) {
              const participantNames = participants
                .filter(p => p.id !== user.id) // Udeluk nuværende bruger
                .map(p => p.displayname || "Unknown")
                .slice(0, 3); // Kun de første 3 navne
              
              title = participantNames.join(", ");
              if (participants.length > 4) { // 3 andre + nuværende bruger
                title += "...";
              }
            }

            console.log("🏷️ Final group title:", title);

            return {
              id: thread.thread_id,
              title: title || "Group Chat",
              memberIds: participants.map(p => p.id),
              members: participants.map(p => p.displayname || "Unknown"),
              avatar: thread.group_image || null, // Brug det uploadede gruppe billede
              created: thread.created_at,
            };
          })
        );

        setGroups(groupsWithTitles);
      } catch (error) {
        console.error("Error loading group data:", error);
      }
    };

    loadGroupData();
  }, [user?.id]);

  // Lyt efter gruppe billede opdateringer
  useEffect(() => {
    const handleGroupImageUpdate = (event) => {
      const { threadId, imageUrl } = event.detail;
      
      // Opdater det specifikke gruppe billede i state
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === threadId 
            ? { ...group, avatar: imageUrl }
            : group
        )
      );
    };

    window.addEventListener('groupImageUpdated', handleGroupImageUpdate);
    
    return () => {
      window.removeEventListener('groupImageUpdated', handleGroupImageUpdate);
    };
  }, []);

  const filteredChats = activeChats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((group) =>
    group.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteChat = async (chatId) => {
    const previousChats = activeChats;
    setActiveChats((prev) => prev.filter((chat) => chat.id !== chatId));
    try {
      await deleteThread(chatId);
    } catch (error) {
      console.error("Failed to delete thread:", error);
      // Gendan hvis det fejler
      setActiveChats(previousChats);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    const previousGroups = groups;
    setGroups((prev) => prev.filter((group) => group.id !== groupId));
    try {
      // Slet gruppe thread fra databasen
      await deleteThread(groupId);
    } catch (error) {
      console.error("Failed to delete group thread:", error);
      // Gendan hvis det fejler
      setGroups(previousGroups);
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col w-screen h-screen overflow-hidden z-999"
      style={{ backgroundColor: "#3F4D54" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 text-white transition-all duration-300">
        <div className="flex items-center flex-1 gap-3">
          <Link
            to="/"
            className="text-white transition-all duration-300 hover:text-gray-300"
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

          <h1 className="text-xl font-semibold">Messages</h1>
          {showSearch && (
            <div className="relative flex-1 ml-3">
              <input
                type="text"
                placeholder="Search..."
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
          <Link
            to="/chat/new"
            className="text-white transition-all duration-300 hover:text-gray-300"
            aria-label="New chat"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Chat container med hvid baggrund */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white rounded-t-3xl">
        {/* Tabs */}
        <div className="flex items-center flex-shrink-0 px-4">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-3 text-lg ${activeTab === "chats" ? "font-semibold text-black" : "font-medium text-gray-400"}`}
          >
            Chats
          </button>
          <div className="w-px h-6 mx-2 bg-gray-300" />
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 py-3 text-lg ${activeTab === "groups" ? "font-semibold text-black" : "font-medium text-gray-400"}`}
          >
            Groups
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 min-h-0 px-4 py-2 overflow-auto">
          {activeTab === "chats" ? (
            <ChatListItem
              friends={searchQuery ? filteredChats : activeChats}
              onDeleteChat={handleDeleteChat}
            />
          ) : (
            <ChatListItem
              friends={searchQuery ? filteredGroups : groups}
              onDeleteChat={handleDeleteGroup}
            />
          )}
        </div>
      </div>

      {/* Navbar vises nederst */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>
    </div>
  );
}
