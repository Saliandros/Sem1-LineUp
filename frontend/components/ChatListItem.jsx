import { useState } from "react";
import { href, Link, NavLink, useFetcher } from "react-router";

// A list of friends you can start chats with (not a generic sidebar)

function FriendItem({ friend, onFriendClick, onDeleteChat }) {
  const [isHovered, setIsHovered] = useState(false);
  const { id, title, lastMessage, timestamp, members, avatar: customAvatar } = friend;
  
  const isGroup = members && members.length > 0;
  const chatUrl = isGroup 
    ? `/chat/group?members=${id}` 
    : href("/chat/:threadId", { threadId: id });
  
  const handleClick = (e) => {
    if (onFriendClick) {
      e.preventDefault();
      onFriendClick(id);
    }
  };
  
  // Hvis ingen onClick handler, brug NavLink for navigation
  const Component = onFriendClick ? 'button' : NavLink;
  const componentProps = onFriendClick 
    ? { onClick: handleClick, className: "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left" }
    : { 
        to: chatUrl,
        className: ({ isActive }) => [
          "flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors",
          isActive && "bg-gray-100"
        ].filter(Boolean).join(" ")
      };
  
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDeleteChat) {
      onDeleteChat(id);
    }
  };
  
  return (
    <li 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Component {...componentProps}>
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {isGroup ? (
            customAvatar ? (
              <img src={customAvatar} alt={title} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            )
          ) : (
            customAvatar ? (
              <img src={customAvatar} alt={title} className="w-full h-full object-cover" />
            ) : (
              <img src="/assets/icons/user-circle.svg" alt={title} className="w-full h-full object-cover" />
            )
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{title}</h3>
            {timestamp && <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{timestamp}</span>}
          </div>
          {lastMessage && <p className="text-sm text-gray-600 truncate">{lastMessage}</p>}
        </div>
        
        {/* Delete button - vises ved hover */}
        {isHovered && onDeleteChat && (
          <button
            onClick={handleDelete}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-lg z-10"
            aria-label="Delete chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        )}
      </Component>
    </li>
  );
}

function Friends({ friends = [], onFriendClick, onDeleteChat }) {
  return (
    <nav aria-label="Friends list">
      <ul className="divide-y divide-gray-100">
        {friends.map((f) => (
          <FriendItem 
            key={f.id} 
            friend={f} 
            onFriendClick={onFriendClick}
            onDeleteChat={onDeleteChat}
          />
        ))}
      </ul>
    </nav>
  );
}

export default function ChatListItem({ friends, onFriendClick, onDeleteChat, activeChatIds = [] }) {
  return (
    <section className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <Friends friends={friends} onFriendClick={onFriendClick} onDeleteChat={onDeleteChat} />
      </div>
    </section>
  );
}