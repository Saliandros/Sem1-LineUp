import { useEffect, useRef, useState } from "react";
import { useLoaderData, Link } from "react-router";
import { ChatMessages, ChatInput } from "../components/Chat.jsx";
import {
  fetchAllUsersAsFriends,
  getFriendsMap,
  getUserProfile,
} from "../data/friends.js";
import { fetchMessages, transformMessages, transformGroupMessages } from "../data/messages.js";
import { sendMessage, getOrCreateThread, getThread, addParticipantsToThread, getThreadParticipants, createGroupThread, updateGroupName, updateGroupImage } from "../data/messages.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { supabase } from "../lib/supabaseClient.js";

// Simple friend item for selection (without last message)
function SelectableFriendItem({ friend, isSelected, onToggle }) {
  const avatar = friend.avatar || "/assets/icons/user-circle.svg";

  return (
    <li>
      <button
        onClick={() => onToggle(friend.id)}
        className="flex items-center w-full gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
      >
        <div className="flex-shrink-0 w-12 h-12 overflow-hidden bg-gray-300 rounded-full">
          <img
            src={avatar}
            alt={friend.title}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-sm font-semibold text-gray-900">
            {friend.title}
          </h3>
        </div>
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            isSelected ? "bg-[#3F4D54] border-[#3F4D54]" : "border-gray-300"
          }`}
        >
          {isSelected && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </button>
    </li>
  );
}

// Modal for converting 1-to-1 chat to group
function AddPeopleModal({ currentFriendId, onClose, availableFriends, onAddPeople, threadId }) {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  const toggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleAddPeople = async () => {
    if (selectedFriends.length === 0) return;
    
    setIsAdding(true);
    try {
      await onAddPeople(selectedFriends);
      onClose();
    } catch (error) {
      console.error("Error adding people:", error);
      alert("Failed to add people to chat");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="fixed inset-0 flex flex-col bg-white"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: "#3F4D54" }}
      >
        <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
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
            </button>
            <h1 className="text-xl font-semibold">Add people</h1>
          </div>
          {selectedFriends.length > 0 && (
            <button
              onClick={handleAddPeople}
              disabled={isAdding}
              className={`font-semibold transition-all duration-300 ${
                isAdding 
                  ? "text-gray-500" 
                  : "text-white hover:text-gray-300"
              }`}
            >
              {isAdding ? "Adding..." : "Add to conversation"}
            </button>
          )}
        </div>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white rounded-t-3xl">
          <div className="flex-1 min-h-0 overflow-auto">
            <ul className="divide-y divide-gray-100">
              {availableFriends.map((friend) => (
                <SelectableFriendItem
                  key={friend.id}
                  friend={friend}
                  isSelected={selectedFriends.includes(friend.id)}
                  onToggle={toggleFriend}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function loader({ params }) {
  const { threadId } = params;

  // Verificer at tråden eksisterer i databasen
  const thread = await getThread(threadId);
  if (!thread) {
    throw new Response("Thread not found", { status: 404 });
  }

  const rawMessages = await fetchMessages(threadId);

  return {
    thread,
    threadId,
    chatId: threadId,
    initialMessages: rawMessages,
  };
}

export default function OneToOneChatPage() {
  const { thread, threadId, chatId, initialMessages } = useLoaderData();
  const { user } = useAuth();

  const [showAddPeopleModal, setShowAddPeopleModal] = useState(false);
  const [rawMessages, setRawMessages] = useState(initialMessages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [friends, setFriends] = useState([]);
  const [availableFriends, setAvailableFriends] = useState([]);
  const [otherUserId, setOtherUserId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [threadData, setThreadData] = useState(thread);
  const [allParticipants, setAllParticipants] = useState([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [realtimeChannel, setRealtimeChannel] = useState(null);

  // Hent venner når komponenten loader
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friendsData = await fetchAllUsersAsFriends();
        setFriends(friendsData);
        setAvailableFriends(friendsData);
      } catch (error) {
        console.error("Error loading friends:", error);
      }
    };

    loadFriends();
  }, []);

  // Hent nuværende brugers profil
  useEffect(() => {
    const loadCurrentUserProfile = async () => {
      if (user?.id) {
        try {
          const profile = await getUserProfile(user.id);
          console.log("🖼️ Loaded current user profile:", profile);
          console.log("🖼️ user_image URL:", profile?.user_image);
          setCurrentUserProfile(profile);
        } catch (error) {
          console.error("Error loading current user profile:", error);
        }
      }
    };

    loadCurrentUserProfile();
  }, [user?.id]);

  // Setup realtime subscription for new messages
  useEffect(() => {
    if (!threadId || !user?.id) return;

    console.log("🔴 Setting up realtime subscription for thread:", threadId);

    // Create channel
    const channel = supabase
      .channel(`messages-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => {
          console.log("🔴 New message received:", payload.new);
          
          // Only add message if it's not from the current user (to avoid duplicates)
          if (payload.new.user_id !== user.id) {
            setRawMessages(prev => {
              // Check if message already exists to prevent duplicates
              const exists = prev.some(msg => msg.message_id === payload.new.message_id);
              if (exists) return prev;
              
              return [...prev, payload.new];
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("🔴 Realtime subscription status:", status);
      });

    setRealtimeChannel(channel);

    // Cleanup on unmount
    return () => {
      console.log("🔴 Cleaning up realtime subscription");
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [threadId, user?.id]);

  // Hent thread participants for at finde den anden bruger
  useEffect(() => {
    const loadOtherUser = async () => {
      if (!threadId || !user?.id) return;

      try {
        const { data: participants, error } = await supabase
          .from("thread_participants")
          .select("user_id, profiles(id, displayname, user_image)")
          .eq("thread_id", threadId);

        if (error) throw error;

        console.log("🔍 All participants loaded:", participants);
        
        // Gem alle deltagere til brug i titel generation
        setAllParticipants(participants || []);

        // Find den anden bruger (ikke den nuværende bruger)
        const otherParticipant = participants?.find(p => p.user_id !== user.id);
        if (otherParticipant) {
          setOtherUserId(otherParticipant.user_id);
          // Find friend data
          const friendData = friends.find(f => f.id === otherParticipant.user_id);
          setOtherUser(friendData || {
            id: otherParticipant.user_id,
            title: otherParticipant.profiles?.displayname || "Unknown",
            user_image: otherParticipant.profiles?.user_image,
          });
        }
      } catch (error) {
        console.error("Error loading thread participants:", error);
      }
    };

    if (friends.length > 0) {
      loadOtherUser();
    }
  }, [threadId, user?.id, friends]);

  // Generer titel baseret på om det er gruppechat eller 1-on-1
  const getChatTitle = () => {
    console.log("🏷️ Generating chat title. Participants:", allParticipants);
    console.log("🏷️ Participants count:", allParticipants?.length);
    
    // Hvis der ingen deltagere er endnu, vis loading eller fallback
    if (!allParticipants || allParticipants.length === 0) {
      return "Loading...";
    }
    
    if (allParticipants.length <= 2) {
      // 1-on-1 chat - brug den anden persons navn
      const title = otherUser?.title || otherUser?.displayname || "Unknown";
      console.log("🏷️ 1-on-1 chat title:", title);
      return title;
    } else {
      // Gruppechat - først tjek om der er et group_name
      if (threadData?.group_name) {
        console.log("🏷️ Using saved group name:", threadData.group_name);
        return threadData.group_name;
      }
      
      // Ellers brug navnene på alle deltagere (undtagen dig selv)
      const otherParticipantNames = allParticipants
        .filter(p => p.user_id !== user?.id)
        .map(p => p.profiles?.displayname || "Unknown")
        .slice(0, 3); // Kun de første 3 navne
      
      let title = otherParticipantNames.join(", ");
      if (allParticipants.length > 4) { // 3 andre + dig selv
        title += "...";
      }
      const groupTitle = title || "Group Chat";
      console.log("🏷️ Generated group title from participants:", groupTitle, "from names:", otherParticipantNames);
      return groupTitle;
    }
  };

  const chatTitle = getChatTitle();
  const friendAvatar =
    otherUser?.user_image ||
    otherUser?.avatar ||
    "/assets/icons/user-circle.svg";

  const filteredFriends = friends.filter(
    (friend) =>
      friend.id !== user?.id && // Fjern dig selv
      friend.id !== otherUserId // Fjern den person du allerede chatter med
  );

  // Find din egen profil i friends data
  const myProfile = friends.find((f) => f.id === user?.id);

  // Opret currentUser objekt med data fra profile eller friends
  const currentUser = {
    id: user?.id,
    avatar:
      currentUserProfile?.user_image ||
      myProfile?.user_image ||
      myProfile?.avatar ||
      "/assets/icons/user-circle.svg",
    username: currentUserProfile?.displayname || myProfile?.username || myProfile?.title || user?.email?.split('@')[0],
  };

  console.log("🖼️ CurrentUser object:", currentUser);
  console.log("🖼️ CurrentUser avatar:", currentUser.avatar);

  // Transformér beskederne til Chat komponents format
  const transformedMessages = (() => {
    if (allParticipants && allParticipants.length > 2) {
      // Gruppechat - opret participants map
      const participantsMap = {};
      allParticipants.forEach(participant => {
        participantsMap[participant.user_id] = {
          avatar: participant.profiles?.user_image || "/assets/icons/user-circle.svg",
          name: participant.profiles?.displayname || "Unknown"
        };
      });
      
      console.log("🔄 Using group message transform with participants:", participantsMap);
      return transformGroupMessages(rawMessages, user?.id, participantsMap, currentUser.avatar);
    } else {
      // 1-til-1 chat - brug original funktion  
      console.log("🔄 Using regular message transform");
      return transformMessages(rawMessages, user?.id, currentUser.avatar, friendAvatar, otherUser?.displayname || otherUser?.title);
    }
  })();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transformedMessages]);

  const handleSendMessage = async (messageText) => {
    if (!user?.id || !chatId) {
      console.error("Missing user or chat data", { userId: user?.id, chatId });
      return;
    }

    setIsSendingMessage(true);
    try {
      console.log("Sending message to thread:", chatId);
      const result = await sendMessage(chatId, user.id, messageText);
      console.log("Message sent:", result);

      // Add the new message immediately (optimistic update)
      if (result) {
        setRawMessages(prev => [...prev, result]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Fejl ved sending af besked: " + error.message);
    } finally {
      // Keep typing indicator visible for a short moment
      setTimeout(() => {
        setIsSendingMessage(false);
      }, 500);
    }
  };

  const handleAddPeople = async (selectedFriendIds) => {
    if (!chatId || !user?.id || !otherUserId) {
      console.error("Missing required data for creating group");
      return;
    }

    try {
      console.log("Creating new group chat with participants:", [user.id, otherUserId, ...selectedFriendIds]);
      
      // Opret en ny gruppe thread med alle deltagere
      const newGroupThread = await createGroupThread(
        user.id, 
        [otherUserId, ...selectedFriendIds], // Andre deltagere (ikke skaberen)
        null // Ingen custom gruppe navn endnu
      );

      console.log("New group thread created:", newGroupThread);

      // Naviger direkte til den nye gruppe thread
      window.location.href = `/chat/${newGroupThread.thread_id}`;
      
    } catch (error) {
      console.error("Error creating group chat:", error);
      throw error;
    }
  };

  // Håndter title editing
  const handleTitleClick = () => {
    // Kun tillad editing for gruppechats (mere end 2 deltagere)
    if (allParticipants && allParticipants.length > 2) {
      setIsEditingTitle(true);
      setEditedTitle(threadData?.group_name || chatTitle);
    }
  };

  const handleTitleSave = async () => {
    if (!editedTitle.trim() || !threadId) return;

    try {
      await updateGroupName(threadId, editedTitle.trim());
      
      // Opdater lokal thread data
      setThreadData(prev => ({
        ...prev,
        group_name: editedTitle.trim()
      }));
      
      setIsEditingTitle(false);
      console.log("✅ Group name updated successfully");
    } catch (error) {
      console.error("Error updating group name:", error);
    }
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setEditedTitle("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  // Håndter gruppe image upload
  const handleImageClick = () => {
    if (allParticipants && allParticipants.length > 2) {
      fileInputRef.current?.click();
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !threadId) return;

    // Valider fil type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Valider fil størrelse (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);

    try {
      // Brug backend upload API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'images');

      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      // Hent auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const response = await fetch(`${API_BASE}/api/uploads/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const uploadResult = await response.json();
      const imageUrl = uploadResult.url;

      // Opdater thread med nyt billede URL
      await updateGroupImage(threadId, imageUrl);

      // Opdater lokal state
      setThreadData(prev => ({
        ...prev,
        group_image: imageUrl
      }));

      // Trigger en custom event så ChatList kan opdatere
      window.dispatchEvent(new CustomEvent('groupImageUpdated', { 
        detail: { threadId, imageUrl } 
      }));

      console.log("✅ Group image updated successfully");
    } catch (error) {
      console.error("Error uploading group image:", error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      // Clear file input
      event.target.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col w-screen h-screen overflow-hidden"
      style={{ backgroundColor: "#3F4D54" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 text-white shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/chat"
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
          <div className="flex items-center gap-3">
            {/* Profilbillede */}
            <div className="relative flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-300 rounded-full">
              {allParticipants && allParticipants.length > 2 ? (
                // Gruppe chat - vis gruppe billede eller ikon
                <>
                  <button 
                    onClick={handleImageClick}
                    className="relative w-full h-full transition-opacity hover:opacity-80"
                    disabled={isUploadingImage}
                  >
                    {threadData?.group_image ? (
                      <img
                        src={threadData.group_image}
                        alt="Group avatar"
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.src = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-white/20">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Loading overlay */}
                    {isUploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </button>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </>
              ) : (
                // 1-til-1 chat - vis den anden persons billede
                <img
                  src={friendAvatar}
                  alt={chatTitle}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.src = "/assets/icons/user-circle.svg";
                  }}
                />
              )}
            </div>
            
            {/* Titel section */}
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="px-2 py-1 text-lg font-semibold text-white bg-transparent border border-white/30 rounded focus:outline-none focus:border-white"
                  autoFocus
                  maxLength={50}
                />
                <button
                  onClick={handleTitleSave}
                  className="text-green-400 hover:text-green-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleTitleCancel}
                  className="text-red-400 hover:text-red-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{chatTitle}</h1>
                {allParticipants && allParticipants.length > 2 && (
                  <button
                    onClick={handleTitleClick}
                    className="text-white/60 hover:text-white transition-colors"
                    title="Click to edit group name"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAddPeopleModal(true)}
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {showAddPeopleModal && (
        <AddPeopleModal
          currentFriendId={otherUserId}
          threadId={chatId}
          onClose={() => setShowAddPeopleModal(false)}
          availableFriends={filteredFriends}
          onAddPeople={handleAddPeople}
        />
      )}

      {/* Chat container */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white rounded-t-3xl">
        <div className="flex-1 min-h-0 overflow-auto">
          <ChatMessages
            messages={transformedMessages}
            currentUser={currentUser}
            friendAvatar={friendAvatar}
            showTyping={isSendingMessage}
          />
          <div ref={messagesEndRef} />
        </div>
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
