import React from "react";
import { useLoaderData, Link } from "react-router";
import { ChatMessages, ChatInput } from "../../components/chat/Chat.jsx";
import { fetchAllUsersAsFriends, getFriendsMap } from "../../data/friends.js";
import { fetchMessages, getThread, getThreadParticipants, sendMessage } from "../../data/messages.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

// Modal for adding more people to existing group
function AddMorePeopleModal({
  currentMemberIds,
  onClose,
  onAddMembers,
  availableFriends,
}) {
  const [selectedFriends, setSelectedFriends] = React.useState([]);

  const toggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleAddMembers = () => {
    if (selectedFriends.length > 0) {
      onAddMembers(selectedFriends);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "#3F4D54" }}
    >
      <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 text-white">
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-lg font-semibold">Add People</h2>
        <button
          onClick={handleAddMembers}
          disabled={selectedFriends.length === 0}
          className={`font-semibold transition-all duration-300 ${
            selectedFriends.length > 0
              ? "text-white hover:text-gray-300"
              : "text-gray-500"
          }`}
        >
          Add more to conversation
        </button>
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white rounded-t-3xl">
        <div className="flex-1 min-h-0 overflow-auto">
          <ul className="divide-y divide-gray-100">
            {availableFriendsWithoutSelf.map((friend) => {
              const avatar = friend.avatar || "/assets/icons/user-circle.svg";
              const isSelected = selectedFriends.includes(friend.id);

              return (
                <li key={friend.id}>
                  <button
                    onClick={() => toggleFriend(friend.id)}
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
                        isSelected
                          ? "bg-[#3F4D54] border-[#3F4D54]"
                          : "border-gray-300"
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
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const membersParam = url.searchParams.get("members");

  if (!membersParam) {
    throw new Response("No members specified", { status: 400 });
  }

  const memberIds = membersParam.split(",");
  
  // Find eksisterende gruppe thread med disse deltagere
  // Dette er en simplificeret version - i praksis skulle vi søge i database
  const allFriends = await fetchAllUsersAsFriends();
  const friendsMap = await getFriendsMap();
  
  const members = memberIds.map((id) => ({
    id,
    name: friendsMap[id] || allFriends.find(f => f.id === id)?.title || "Unknown",
    avatar: allFriends.find((f) => f.id === id)?.avatar,
  }));

  const availableFriends = allFriends.filter((f) => !memberIds.includes(f.id));
  const groupName = members.map((m) => m.name.split(" ")[0]).join(", ");

  // Prøv at finde en gruppe thread med disse medlemmer
  // For nu bruger vi localStorage data hvis tilgængelig
  let groupThread = null;
  let initialMessages = [];
  
  try {
    const storedGroups = JSON.parse(localStorage.getItem("groupChats")) || [];
    const matchingGroup = storedGroups.find(group => 
      group.memberIds && 
      group.memberIds.length === memberIds.length &&
      group.memberIds.every(id => memberIds.includes(id))
    );
    
    if (matchingGroup && matchingGroup.id) {
      // Hent thread fra database
      groupThread = await getThread(matchingGroup.id);
      if (groupThread) {
        initialMessages = await fetchMessages(matchingGroup.id);
      }
    }
  } catch (error) {
    console.error("Error loading group thread:", error);
  }

  return {
    groupName,
    members,
    memberIds,
    chatId: groupThread?.thread_id || `group-${memberIds.sort().join("-")}`,
    availableFriends,
    friendsMap,
    groupThread,
    initialMessages: initialMessages || [],
  };
}

export default function GroupChatPage() {
  const {
    groupName,
    members,
    memberIds,
    chatId,
    availableFriends,
    friendsMap,
    groupThread,
    initialMessages,
  } = useLoaderData();
  const { user } = useAuth();

  const [showAddPeopleModal, setShowAddPeopleModal] = React.useState(false);
  const [messages, setMessages] = React.useState(initialMessages || []);
  const [customGroupName, setCustomGroupName] = React.useState("");
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [showMembersDropdown, setShowMembersDropdown] = React.useState(false);
  const [groupAvatar, setGroupAvatar] = React.useState("");
  const [isRealGroup, setIsRealGroup] = React.useState(!!groupThread);
  const messagesEndRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  const currentUserProfile = React.useMemo(
    () => availableFriends.find((f) => f.id === user?.id),
    [availableFriends, user?.id]
  );
  const userAvatar =
    currentUserProfile?.avatar ||
    user?.user_image ||
    "/assets/icons/user-circle.svg";
  const memberIdsWithSelf = React.useMemo(() => {
    if (!user?.id) return memberIds;
    const set = new Set(memberIds);
    set.add(user.id);
    return Array.from(set);
  }, [memberIds, user?.id]);
  const membersWithSelf = React.useMemo(() => {
    if (!user?.id) return members;
    const hasSelf = members.some((m) => m.id === user.id);
    if (hasSelf) return members;
    const selfEntry = {
      id: user.id,
      name: currentUserProfile?.title || "You",
      avatar: userAvatar,
    };
    return [...members, selfEntry];
  }, [members, user?.id, currentUserProfile?.title, userAvatar]);

  // Set initial messages from loader data
  React.useEffect(() => {
    setMessages(initialMessages || []);
  }, [initialMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText) => {
    if (!user?.id) return;

    if (isRealGroup && groupThread?.thread_id) {
      // Real group chat - send to database
      try {
        const result = await sendMessage(groupThread.thread_id, user.id, messageText);
        if (result) {
          // Transform database message to display format
          const displayMessage = {
            id: result.message_id || result.id,
            type: "user",
            content: result.message_content,
            senderId: result.user_id,
            avatar: userAvatar,
            created_at: result.created_at,
          };
          setMessages(prev => [...prev, displayMessage]);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message");
      }
    } else {
      // Demo mode - add message to display but don't persist
      const newMessage = {
        id: `m${Date.now()}`,
        type: "user",
        content: messageText,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        avatar: userAvatar,
      };
      setMessages((prev) => [...prev, newMessage]);
    }
  };

  const handleSaveGroupName = (newName) => {
    if (newName.trim()) {
      setCustomGroupName(newName.trim());
    }
    setIsEditingName(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const displayName = customGroupName || groupName;

  const availableFriendsWithoutSelf = React.useMemo(
    () => availableFriends.filter((f) => f.id !== user?.id),
    [availableFriends, user?.id]
  );

  const decoratedMessages = React.useMemo(
    () =>
      messages.map((m) => ({
        ...m,
        avatar:
          m.avatar ||
          (m.type === "user" ? userAvatar : "/assets/icons/user-circle.svg"),
      })),
    [messages, userAvatar]
  );

  // Persist group chat so it shows up under Groups tab
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = JSON.parse(localStorage.getItem("groupChats")) || [];
      const payload = {
        id: chatId,
        title: displayName,
        memberIds: memberIdsWithSelf,
        members: memberIdsWithSelf,
        avatar: groupAvatar || "",
      };
      const idx = stored.findIndex((g) => g.id === chatId);
      if (idx >= 0) {
        stored[idx] = { ...stored[idx], ...payload };
      } else {
        stored.push(payload);
      }
      localStorage.setItem("groupChats", JSON.stringify(stored));
    } catch (err) {
      console.error("Failed to persist group chat locally:", err);
    }
  }, [chatId, displayName, groupAvatar, memberIds]);

  return (
    <div
      className="fixed inset-0 flex flex-col w-screen h-screen overflow-hidden"
      style={{ backgroundColor: "#3F4D54" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 text-white">
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

          <div className="relative">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden transition-all rounded-full cursor-pointer bg-white/20 hover:bg-white/30 group"
            >
              {groupAvatar ? (
                <img
                  src={groupAvatar}
                  alt="Group avatar"
                  className="object-cover w-full h-full"
                />
              ) : (
                <svg
                  className="w-6 h-6 text-white transition-transform group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div>
            {isEditingName ? (
              <input
                type="text"
                defaultValue={displayName}
                autoFocus
                onBlur={(e) => handleSaveGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveGroupName(e.target.value);
                  } else if (e.key === "Escape") {
                    setIsEditingName(false);
                  }
                }}
                className="px-2 py-1 text-xl font-semibold text-white border rounded bg-white/20 border-white/30 focus:outline-none focus:bg-white/30"
              />
            ) : (
              <h1
                className="text-xl font-semibold transition-colors cursor-pointer hover:text-gray-300"
                onClick={() => setIsEditingName(true)}
              >
                {displayName}
              </h1>
            )}
            <div className="relative">
              <button
                onClick={() => setShowMembersDropdown(!showMembersDropdown)}
                className="flex items-center gap-1 text-xs transition-colors text-white/70 hover:text-white"
              >
                {membersWithSelf.length} members
                <svg
                  className={`w-3 h-3 transition-transform ${showMembersDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showMembersDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg py-2 min-w-[200px] z-50">
                  {membersWithSelf.map((member) => (
                    <Link
                      key={member.id}
                      to={`/chat/${member.id}`}
                      className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-gray-50"
                      onClick={() => setShowMembersDropdown(false)}
                    >
                      <div className="flex-shrink-0 w-8 h-8 overflow-hidden bg-gray-300 rounded-full">
                        <img
                          src={member.avatar || "/assets/icons/user-circle.svg"}
                          alt={member.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {member.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat container */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white rounded-t-3xl">
        <div className="flex-1 min-h-0 overflow-auto">
          <ChatMessages messages={decoratedMessages} friendAvatar={null} />
          <div ref={messagesEndRef} />
        </div>
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
