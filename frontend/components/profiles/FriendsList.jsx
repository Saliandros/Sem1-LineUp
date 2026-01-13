/**
 * FriendsList.jsx - Horizontal Scrollable Friends Component
 * ==========================================================
 * FORMÅL: Viser en horizontal scrollbar liste af venner med interaktiv menu
 * 
 * FEATURES:
 * 1. **Drag-to-Scroll**: Mouse drag for at scrolle gennem venner
 * 2. **Context Menu**: Klik på ven for at åbne menu med actions
 * 3. **Actions**: "Show Profile" og "Start Chat"
 * 4. **Brand Styling**: Gul ring omkring avatars (LineUp brand)
 * 
 * LAVET AF: Omar Gaal & Hani Zaghmout (styling), Jimmi Larsen (chat integration)
 */

import { useRef, useState } from "react";
import { useNavigate } from "react-router";

export default function FriendsList({
  friends = [],
  onFriendClick,
  creatingThread = false,
}) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dragDistanceRef = useRef(0);
  
  // Menu state
  const [selectedFriend, setSelectedFriend] = useState(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    dragDistanceRef.current = 0;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    dragDistanceRef.current = Math.abs(walk);
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleFriendClick = (friend) => {
    // Kun åbn menu hvis der ikke er sket drag
    if (dragDistanceRef.current < 5) {
      setSelectedFriend(friend);
    }
  };

  const handleShowProfile = () => {
    if (selectedFriend) {
      navigate(`/profile/${selectedFriend.id}`);
      setSelectedFriend(null);
    }
  };

  const handleStartChat = () => {
    if (selectedFriend && onFriendClick) {
      onFriendClick(selectedFriend.id);
      setSelectedFriend(null);
    }
  };

  const handleCloseMenu = () => {
    setSelectedFriend(null);
  };

  return (
    <>
      <div className="overflow-hidden relative z-0 lg:mt-6 lg:ml-0 w-full">
        {/* Friends container - Draggable */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex gap-6 px-4 pt-2 pb-8 overflow-x-auto overflow-y-hidden scrollbar-hide cursor-grab active:cursor-grabbing lg:justify-start lg:px-4"
          style={{
            scrollBehavior: isDragging ? "auto" : "smooth",
            WebkitOverflowScrolling: "touch",
            userSelect: "none",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex flex-col items-center shrink-0 w-fit"
            >
              <button
                onClick={() => handleFriendClick(friend)}
                disabled={creatingThread}
                className="relative w-16 h-16 mb-2 overflow-visible transition-all rounded-full pointer-events-auto shrink-0 group focus:outline-none"
                style={{
                  boxShadow: "0 0 0 3px #fbbf24",
                }}
              >
                {/* Avatar */}
                <div className="flex items-center justify-center w-full h-full overflow-hidden transition-all duration-200 bg-gray-300 rounded-full pointer-events-none">
                  {friend.avatar && (
                    <img
                      src={friend.avatar}
                      alt={friend.title}
                      className="object-cover w-full h-full pointer-events-none"
                    />
                  )}
                </div>

                {/* Online status indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </button>

              {/* Name */}
              <div className="text-[13px] text-gray-900 text-center w-fit font-medium leading-tight">
                {(friend.title || 'Unknown').split(" ").map((namePart, index) => (
                  <div key={index} className="truncate">
                    {namePart}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Menu Modal */}
      {selectedFriend && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={handleCloseMenu}
        >
          <div 
            className="w-full bg-white rounded-t-3xl shadow-lg animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Friend info */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
              <div className="w-12 h-12 overflow-hidden bg-gray-300 rounded-full">
                {selectedFriend.avatar && (
                  <img
                    src={selectedFriend.avatar}
                    alt={selectedFriend.title}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedFriend.title || 'Unknown'}
                </h3>
              </div>
            </div>

            {/* Menu options */}
            <div className="px-4 py-4 space-y-2">
              <button
                onClick={handleShowProfile}
                className="flex items-center w-full gap-4 px-4 py-4 transition-colors bg-gray-50 rounded-2xl hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-700"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="font-medium text-gray-900">Show Profile</span>
              </button>

              <button
                onClick={handleStartChat}
                disabled={creatingThread}
                className="flex items-center w-full gap-4 px-4 py-4 transition-colors bg-gray-50 rounded-2xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-700"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="font-medium text-gray-900">
                  {creatingThread ? "Starting..." : "Start a Chat"}
                </span>
              </button>
            </div>

            {/* Cancel button */}
            <div className="px-4 pb-6 pt-2">
              <button
                onClick={handleCloseMenu}
                className="w-full py-4 font-medium text-gray-600 transition-colors bg-white border border-gray-300 rounded-2xl hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
