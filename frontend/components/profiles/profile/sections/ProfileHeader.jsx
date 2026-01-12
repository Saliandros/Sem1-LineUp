import { useEffect, useState } from "react";
import { Link, useNavigation } from "react-router";
import { supabase } from "../../../../lib/supabaseClient";
import { createConnection, checkConnection, deleteConnection, acceptConnection, rejectConnection } from "../../../../lib/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Profile Header Komponent
 * Viser profilbillede, stats, navn og action knapper (Edit/Share eller Connect)
 * Uses Supabase client directly for data fetching
 */
export default function ProfileHeader({ profileData, isOwnProfile = true, onConnectionChange }) {
  const [connectionData, setConnectionData] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  console.log(profileData);

  // Get current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    fetchCurrentUser();
  }, []);

  // Display full name if it exists (new users), otherwise show username (old users)
  const displayName = profileData?.username || profileData?.displayname || "User";
  const userImage = profileData?.user_image || "";
  const userBio =
    profileData?.user_bio || profileData?.user_desc || "No bio yet";
  const userCity = profileData?.city || "";
  const connectionsCount = profileData?.connections_count || 0;
  const notesCount = profileData?.notes_count || 0;
  const verified = profileData?.verified || false;

  // Check if already connected when viewing someone else's profile
  useEffect(() => {
    if (!isOwnProfile && profileData?.id) {
      checkConnectionStatus();
    }
  }, [isOwnProfile, profileData?.id]);

  const checkConnectionStatus = async () => {
    try {
      setCheckingConnection(true);
      const connection = await checkConnection(profileData.id);
      setConnectionData(connection);
    } catch (error) {
      console.error("Failed to check connection:", error);
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleConnect = async () => {
    if (connectionData) {
      if (connectionData.status === 'pending') {
        // Check if current user is the recipient (not the requester)
        const isRecipient = connectionData.requester_id !== currentUserId;
        
        if (isRecipient) {
          // Recipient shouldn't see this button, they see Accept/Reject instead
          return;
        } else {
          // Cancel request for requester
          try {
            setIsConnecting(true);
            console.log("🔵 Canceling connection request");
            await deleteConnection(connectionData.connection_id);
            console.log("✅ Request canceled");
            setConnectionData(null);
            if (onConnectionChange) {
              onConnectionChange();
            }
          } catch (error) {
            console.error("🔴 Failed to cancel request:", error);
            alert(`Failed to cancel: ${error.message || 'Unknown error'}`);
          } finally {
            setIsConnecting(false);
          }
        }
      } else if (connectionData.status === 'accepted') {
        // Disconnect accepted connection
        try {
          setIsConnecting(true);
          console.log("🔵 Attempting to disconnect");
          await deleteConnection(connectionData.connection_id);
          console.log("✅ Disconnected successfully");
          setConnectionData(null);
          if (onConnectionChange) {
            onConnectionChange();
          }
        } catch (error) {
          console.error("🔴 Failed to disconnect:", error);
          alert(`Failed to disconnect: ${error.message || 'Unknown error'}`);
        } finally {
          setIsConnecting(false);
        }
      }
    } else {
      // Send connection request
      try {
        setIsConnecting(true);
        console.log("🔵 Sending connection request");
        const connection = await createConnection(profileData.id);
        console.log("✅ Connection request sent");
        setConnectionData(connection);
        if (onConnectionChange) {
          onConnectionChange();
        }
      } catch (error) {
        console.error("🔴 Failed to send request:", error);
        if (error.message === "Already connected") {
          await checkConnectionStatus();
        }
        alert(`Failed to connect: ${error.message || 'Unknown error'}`);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const handleAccept = async () => {
    try {
      setIsConnecting(true);
      console.log("🔵 Accepting connection request");
      const connection = await acceptConnection(connectionData.connection_id);
      console.log("✅ Connection accepted");
      setConnectionData(connection);
      if (onConnectionChange) {
        onConnectionChange();
      }
    } catch (error) {
      console.error("🔴 Failed to accept:", error);
      alert(`Failed to accept: ${error.message || 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsConnecting(true);
      console.log("🔵 Rejecting connection request");
      await rejectConnection(connectionData.connection_id);
      console.log("✅ Connection rejected");
      setConnectionData(null);
      if (onConnectionChange) {
        onConnectionChange();
      }
    } catch (error) {
      console.error("🔴 Failed to reject:", error);
      alert(`Failed to reject: ${error.message || 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <section>
      <div className="relative px-6 pt-10 pb-8 text-center text-white bg-secondary-slate rounded-4xl">
        {/* Profilbillede */}
        <div className="absolute -translate-x-1/2 left-1/2 top-4">
          <div className="w-36 h-36 rounded-full border-[6px] border-neutral-light-gray overflow-hidden bg-gray-300">
            {userImage ? (
              <img
                src={userImage}
                alt={`${displayName}'s profile`}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-4xl text-gray-500">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 mb-6 grid grid-cols-3 text-[13px]">
          <div className="flex flex-col">
            <span className="text-[20px] font-semibold leading-tight">
              {connectionsCount}
            </span>
            <span className="text-[12px] text-gray-200">Connections</span>
          </div>
          <div />
          <div className="flex flex-col">
            <span className="text-[20px] font-semibold leading-tight">
              {notesCount}
            </span>
            <span className="text-[12px] text-gray-200">Notes</span>
          </div>
        </div>

        {/* Navn + rolle */}
        <div className="flex items-center justify-center gap-1 mb-1">
          <h1 className="text-[20px] font-semibold">{displayName}</h1>
          {verified && <span className="text-[16px]">✅</span>}
        </div>
        <p className="text-[12px] text-gray-200 mb-6">
          {userBio}
          {userCity && ` • ${userCity}`}
        </p>

        {/* Knapper (Edit / Share profile eller Connect) */}
        <div className="flex justify-center gap-3">
          {isOwnProfile ? (
            <>
              <Link
                to="/edit-profile"
                className="flex-1 py-3 rounded-full bg-gradient-to-b from-secondary-gradient-light to-secondary-gradient-dark text-[14px] font-medium border border-secondary-border-gray shadow text-center"
              >
                Edit profile
              </Link>
              <button className="flex-1 py-3 rounded-full bg-gradient-to-b from-secondary-gradient-light to-secondary-gradient-dark text-[14px] font-medium border border-secondary-border-gray shadow">
                Share profile
              </button>
            </>
          ) : (
            <>
              {connectionData?.status === 'pending' && connectionData.requester_id !== currentUserId ? (
                // Recipient sees Accept/Reject buttons
                <>
                  <button 
                    onClick={handleAccept}
                    disabled={isConnecting}
                    className="flex-1 py-3 rounded-full bg-gradient-to-b from-green-400 to-green-500 border border-green-600 text-[14px] font-medium shadow hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isConnecting ? "Accepting..." : "Accept"}
                  </button>
                  <button 
                    onClick={handleReject}
                    disabled={isConnecting}
                    className="flex-1 py-3 rounded-full bg-gradient-to-b from-red-400 to-red-500 border border-red-600 text-[14px] font-medium shadow hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isConnecting ? "Rejecting..." : "Reject"}
                  </button>
                </>
              ) : (
                // Requester or no connection
                <>
                  <button 
                    onClick={handleConnect}
                    disabled={isConnecting || checkingConnection}
                    className={`flex-1 py-3 rounded-full bg-gradient-to-b text-[14px] font-medium border shadow transition-all flex items-center justify-center gap-2 ${
                      connectionData?.status === 'accepted'
                        ? 'from-secondary-gradient-light to-secondary-gradient-dark border-secondary-border-gray' 
                        : connectionData?.status === 'pending'
                        ? 'from-yellow-400 to-yellow-500 border-yellow-600'
                        : 'from-secondary-gradient-light to-secondary-gradient-dark border-secondary-border-gray hover:opacity-90'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {checkingConnection ? "..." : 
                      connectionData?.status === 'accepted' ? (
                        <>
                          {isConnecting ? "Disconnecting..." : (
                            <>
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Connected
                            </>
                          )}
                        </>
                      ) : 
                      connectionData?.status === 'pending' ? (isConnecting ? "Canceling..." : "Pending...") : 
                      (isConnecting ? "Sending..." : "Connect")}
                  </button>
                  <button className="flex-1 py-3 rounded-full bg-gradient-to-b from-secondary-gradient-light to-secondary-gradient-dark text-[14px] font-medium border border-secondary-border-gray shadow">
                    Message
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
