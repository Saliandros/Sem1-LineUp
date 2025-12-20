import { useRef, useState } from "react";

export default function FriendsList({
  friends = [],
  onFriendClick,
  creatingThread = false,
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dragDistanceRef = useRef(0);

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

  return (
    <div className="overflow-visible">
      {/* Friends container - Draggable */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex gap-6 px-4 pt-2 pb-8 overflow-x-auto overflow-y-visible scrollbar-hide cursor-grab active:cursor-grabbing"
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
              onClick={(e) => {
                // Kun trigger hvis der ikke er sket drag (drag distance < 5px)
                if (dragDistanceRef.current < 5) {
                  onFriendClick?.(friend.id); // ✅ Use prop function
                }
              }}
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
  );
}
