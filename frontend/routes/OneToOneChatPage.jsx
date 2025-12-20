import { useEffect, useRef, useState } from "react";
import { useLoaderData, Link } from "react-router";
import { ChatMessages, ChatInput } from "../components/Chat.jsx";
import {
  fetchAllUsersAsFriends,
  getFriendsMap,
  getUserProfile,
} from "../data/friends.js";
import { fetchMessages, transformMessages } from "../data/messages.js";
import { sendMessage, getOrCreateThread, getThread } from "../data/messages.js";
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
function AddPeopleModal({ currentFriendId, onClose, availableFriends }) {
  const [selectedFriends, setSelectedFriends] = useState([]);

  const toggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
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
            <Link
              to={`/chat/group?members=${currentFriendId},${selectedFriends.join(",")}`}
              className="font-semibold text-white transition-all duration-300 hover:text-gray-300"
            >
              Add to conversation
            </Link>
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
  const [friends, setFriends] = useState([]);
  const [availableFriends, setAvailableFriends] = useState([]);
  const [otherUserId, setOtherUserId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

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

  const friendName = otherUser?.title || otherUser?.displayname || "Unknown";
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

  // Opret currentUser objekt med data fra friends
  const currentUser = {
    id: user?.id,
    avatar:
      myProfile?.user_image ||
      myProfile?.avatar ||
      "/assets/icons/user-circle.svg",
    username: myProfile?.username || user?.username,
  };

  // Transformér beskederne til Chat komponents format
  const transformedMessages = transformMessages(
    rawMessages,
    user?.id,
    currentUser.avatar,
    friendAvatar
  );

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

    setIsLoading(true);
    try {
      console.log("Sending message to thread:", chatId);
      const result = await sendMessage(chatId, user.id, messageText);
      console.log("Message sent:", result);

      // Hent opdaterede beskeder
      const updatedMessages = await fetchMessages(chatId);
      console.log("Updated messages:", updatedMessages);
      setRawMessages(updatedMessages);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Fejl ved sending af besked: " + error.message);
    } finally {
      setIsLoading(false);
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
          <div>
            <h1 className="text-xl font-semibold">{friendName}</h1>
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
          onClose={() => setShowAddPeopleModal(false)}
          availableFriends={filteredFriends}
        />
      )}

      {/* Chat container */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white rounded-t-3xl">
        <div className="flex-1 min-h-0 overflow-auto">
          <ChatMessages
            messages={transformedMessages}
            currentUser={currentUser}
            friendAvatar={friendAvatar}
          />
          <div ref={messagesEndRef} />
        </div>
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
