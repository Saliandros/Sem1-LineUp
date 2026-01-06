import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import FriendsList from "../components/FriendsList.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { fetchAllUsersAsFriends } from "../data/friends.js";
import { useLoaderData } from "react-router";
import { useChat } from "../hooks/useChat.js";

export async function clientLoader() {
  try {
    const VITE_API_URL = import.meta.env.VITE_API_URL;

    const [friendsRes, collabRes, tagsRes, postsRes] = await Promise.all([
      fetchAllUsersAsFriends(),
      fetch(`${VITE_API_URL}/api/collaborations`).then((res) => res.json()),
      fetch(`${VITE_API_URL}/api/tags`).then((res) => res.json()),
      fetch(`${VITE_API_URL}/api/posts`).then((res) => res.json()),
    ]);
    return {
      friends: friendsRes || [],
      collaborations: collabRes?.collaborations || [],
      tags: tagsRes?.tags || tagsRes || [],
      posts: postsRes?.posts || postsRes || [],
    };
  } catch (error) {
    console.error("Error loading home data:", error);
    return { friends: [], collaborations: [], tags: [], posts: [] };
  }
}

const getKeywordFromDescription = (desc, genres) => {
  if (!desc) return genres?.[0] || "musician";
  const keywords = [
    "Vocalist",
    "vocalist",
    "singer",
    "Singer",
    "Producer",
    "producer",
    "beats",
    "Beats",
    "Guitarist",
    "guitarist",
    "guitar",
    "Guitar",
    "Bassist",
    "bassist",
    "bass",
    "Bass",
    "Drummer",
    "drummer",
    "drums",
    "Drums",
    "Composer",
    "composer",
    "composition",
    "Composition",
    "Engineer",
    "engineer",
    "mixing",
    "Mixing",
    "Lyricist",
    "lyricist",
    "lyrics",
    "Lyrics",
    "DJ",
    "dj",
    "remix",
    "Remix",
    "Pianist",
    "pianist",
    "keys",
    "Keys",
  ];

  for (const keyword of keywords) {
    if (desc.toLowerCase().includes(keyword.toLowerCase())) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
    }
  }
  return genres?.[0] || "musician";
};

export default function Home() {
  const { user } = useAuth();
  const { friends, collaborations, tags, posts } = useLoaderData();
  const [allFriends, setAllFriends] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState(5);
  const { startChat, creatingThread } = useChat(user);

  const [showFriendsPopup, setShowFriendsPopup] = useState(false);

  useEffect(() => {
    if (friends && user?.id) {
      const filteredFriends = friends.filter((f) => f.id !== user.id);
      setAllFriends(filteredFriends);
    } else {
      setAllFriends(friends || []);
    }
  }, [friends, user?.id]);

  return (
    <div className="max-w-full lg:mt-4 lg:max-w-none w-full">
      {/* Mobile: Always show FriendsList */}
      <div className="lg:hidden">
        <FriendsList
          friends={allFriends}
          creatingThread={creatingThread}
          onFriendClick={startChat}
        />
      </div>

      {/* Desktop: Connections Button */}
      <button 
        onClick={() => setShowFriendsPopup(!showFriendsPopup)}
        className="hidden lg:flex fixed bottom-6 right-6 bg-[var(--color-primary-purple)] text-white px-4 py-2 rounded-full items-center gap-2 shadow-lg hover:bg-[var(--color-primary-purple)]/90 transition-colors z-40"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        Connections
      </button>

      {/* Desktop: Friends Popup */}
      {showFriendsPopup && (
        <div className="hidden lg:block fixed bottom-20 right-6 bg-white rounded-xl shadow-2xl p-4 z-50 w-80 max-h-60 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-900">Connections</h3>
            <button 
              onClick={() => setShowFriendsPopup(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {allFriends.slice(0, 12).map((friend) => (
              <button
                key={friend.id}
                onClick={() => {
                  startChat(friend.id);
                  setShowFriendsPopup(false);
                }}
                disabled={creatingThread}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="relative">
                  <div 
                    className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 mb-1 border-2 border-[#fbbf24]"
                  >
                    {friend.avatar && (
                      <img
                        src={friend.avatar}
                        alt={friend.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {/* Online status indicator */}
                  <div className="absolute bottom-1 right-0 w-3 h-3 bg-green-500 border border-white rounded-full z-20" />
                </div>
                <span className="text-xs text-gray-700 truncate max-w-full">
                  {friend.title || 'Unknown'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Collaboration Requests Section */}
      {collaborations && collaborations.length > 0 && (
        <div className="w-full px-4 pt-8 pb-0  border-t border-black/6 bg-[var(--color-neutral-light-gray)]">
          <h2 className="mb-6 text-[16px] font-[400] text-[#555555]">
            Collaboration requests
          </h2>

          <div className="flex gap-4 pb-4 overflow-x-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {collaborations.slice(0, 6).map((collab) => (
              <div
                key={collab.collab_id}
                className="flex-shrink-0 p-3 transition-shadow bg-white rounded-[25px] w-96 border border-black/6 "
              >
                {/* User Info */}
                <div className="flex items-center gap-3 mb-2">
                  {collab.profiles?.user_image && (
                    <img
                      src={collab.profiles.user_image}
                      alt={collab.profiles.username}
                      className="object-cover w-[21px] h-[21px] rounded-full"
                    />
                  )}
                  <p className="!text-[12px] font-[400] text-[#8A8A8A]">
                    <span className="font-semibold text-[#8A8A8A]">
                      {collab.profiles?.username || "User"}
                    </span>
                    {collab.collab_genres && (
                      <span>
                        {" "}
                        looking for a{" "}
                        <span className="text-[#8A8A8A]">
                          #
                          {getKeywordFromDescription(
                            collab.collab_description,
                            collab.collab_genres
                          )}
                        </span>
                      </span>
                    )}
                  </p>
                </div>
                <div className="max-w-full mb-3 border-b border-gray-200" />

                {/* Title */}
                <h3 className="mb-2 text-[16px] font-[700] text-gray-800">
                  {collab.collab_title}
                </h3>

                {/* Description */}
                <p className="mb-2 text-[16px] font-[400] text-gray-600 line-clamp-3">
                  {collab.collab_description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() =>
                      navigate(`/Services#collab-${collab.collab_id}`)
                    }
                    className="text-[12px] font-[700] text-[var(--color-neutral-grey)] transition-transform hover:scale-101"
                  >
                    Read more
                  </button>
                  <span className="text-[12px] font-[400] text-[#B4B2B2]">
                    {collab.collab_location} - recently posted
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Link to="/Services">
            <button className="px-4 py-3 text-[16px] font-[400] text-[#000000] transition-colors bg-[var(--color-primary-yellow)] rounded-full hover:bg-[#F2C55F]">
              See more collabs
            </button>
          </Link>
        </div>
      )}

      {/* Posts Section */}
      {posts && posts.length > 0 && (
        <div className="max-w-full bg-[var(--color-neutral-light-gray)] w-full">
          <div className="grid max-w-full grid-cols-1 gap-4 py-4 lg:px-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, visiblePosts).map((post) => (
              <div
                key={post.post_id}
                className="h-full max-w-full p-4 bg-white rounded-lg "
              >
                {/* Post Header */}
                <div className="flex flex-col justify-between h-full max-w-full">
                  <div className="card-info">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {post.profile?.user_image ||
                        post.profiles?.user_image ? (
                          <img
                            src={
                              post.profile?.user_image ||
                              post.profiles?.user_image
                            }
                            alt={
                              post.profile?.username || post.profiles?.username
                            }
                            className="object-cover w-[21px] h-[21px] rounded-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-[21px] h-[21px] bg-gray-200 rounded-full">
                            <span className="text-sm font-bold text-gray-600">
                              {(
                                post.profile?.username ||
                                post.profiles?.username
                              )
                                ?.charAt(0)
                                .toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-[400] text-[#000000]">
                            {post.profile?.username ||
                              post.profiles?.username ||
                              "User"}
                          </span>
                          {post.tags_post_join &&
                            post.tags_post_join.length > 0 &&
                            post.tags_post_join[0].tags && (
                              <span className="px-3 py-1 text-[12px] bg-gray-100 rounded-full text-[var(--color-neutral-grey)] border border-gray-300">
                                #{post.tags_post_join[0].tags.tag_name}
                              </span>
                            )}
                        </div>
                      </div>
                      <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="5" cy="12" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="19" cy="12" r="2" />
                        </svg>
                      </button>
                    </div>

                    {/* Post Title */}
                    <h3 className="mb-3 text-[18px] font-[700] text-[#000000]">
                      {post.post_title || "Untitled Post"}
                    </h3>

                    {/* Post Image */}
                    {post.post_image && (
                      <img
                        src={post.post_image}
                        alt={post.post_title}
                        className="w-full h-[400px] object-cover rounded-2xl"
                      />
                    )}

                    {/* Post Content */}
                    <p className="mt-3 text-[16px] font-[400] text-[var(--color-neutral-grey)] leading-relaxed">
                      {post.post_description || "No content available"}
                    </p>
                  </div>

                  <div className="socials">
                    {/* Post Footer - Interactions */}
                    <div className="flex items-center gap-6 py-4">
                      <button className="flex items-center gap-2 transition hover:opacity-70">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="22"
                          height="20"
                          viewBox="0 0 22 20"
                          fill="none"
                        >
                          <path
                            d="M20.75 6.61222C20.75 8.15874 20.1562 9.64412 19.0958 10.7429C16.6549 13.273 14.2874 15.9113 11.7553 18.3497C11.1749 18.9005 10.2542 18.8804 9.6988 18.3047L2.40376 10.7429C0.198748 8.4572 0.198748 4.76723 2.40376 2.48157C4.63044 0.173452 8.25794 0.173452 10.4846 2.48157L10.7498 2.75642L11.0148 2.48173C12.0824 1.3745 13.5364 0.75 15.0553 0.75C16.5742 0.75 18.0281 1.37444 19.0958 2.48157C20.1563 3.58045 20.75 5.06577 20.75 6.61222Z"
                            stroke="#131927"
                            stroke-width="1.5"
                            stroke-linejoin="round"
                          />
                        </svg>
                        <span className="text-[14px] text-gray-600">
                          {post.likes_count || 0}
                        </span>
                      </button>

                      <button className="flex items-center gap-2 transition hover:opacity-70">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M7.5 22C10.5376 22 13 19.5376 13 16.5C13 13.4624 10.5376 11 7.5 11C4.46243 11 2 13.4624 2 16.5C2 17.5018 2.26783 18.441 2.7358 19.25L2.275 21.725L4.75 21.2642C5.55898 21.7322 6.49821 22 7.5 22Z"
                            stroke="#131927"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M15.2824 17.8978C16.2587 17.7405 17.1758 17.4065 18 16.9297L21.6 17.6L20.9297 14C21.6104 12.8233 22 11.4571 22 10C22 5.58172 18.4183 2 14 2C9.97262 2 6.64032 4.97598 6.08221 8.84884"
                            stroke="#131927"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                        <span className="text-[14px] text-gray-600">
                          {post.comments_count || 0}
                        </span>
                      </button>

                      <button className="flex items-center gap-2 ml-auto transition hover:opacity-70">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M15.5389 2L19.0005 5L15.5389 8"
                            stroke="#1E1E1E"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M4.00053 13V7C4.00053 6.46957 4.24366 5.96086 4.67643 5.58579C5.10921 5.21071 5.69618 5 6.30822 5H17.8467M7.46206 22L4.00053 19L7.46206 16"
                            stroke="#1E1E1E"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M19.0005 11V17C19.0005 17.5304 18.7574 18.0391 18.3246 18.4142C17.8918 18.7893 17.3048 19 16.6928 19H5.15433"
                            stroke="#1E1E1E"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {posts.length > visiblePosts && (
            <div className="flex justify-center px-4">
              <button
                onClick={() => setVisiblePosts((prev) => prev + 5)}
                className="py-3 px-4 text-[16px] font-[400] text-[#000000] w-fit transition-colors bg-[var(--color-primary-yellow)] rounded-full hover:bg-[#F2C55F]"
              >
                See more posts
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
