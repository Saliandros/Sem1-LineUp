import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getPendingRequests, acceptConnection, rejectConnection } from "../../lib/api";

export default function Notification({ closeNotification }) {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      setIsLoading(true);
      const requests = await getPendingRequests();
      console.log("📬 Pending requests:", requests);
      setPendingRequests(requests);
    } catch (error) {
      console.error("Failed to load pending requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (connectionId, e) => {
    e.stopPropagation();
    try {
      setProcessingId(connectionId);
      await acceptConnection(connectionId);
      // Remove from list after accepting
      setPendingRequests(prev => prev.filter(req => req.connection_id !== connectionId));
    } catch (error) {
      console.error("Failed to accept connection:", error);
      alert(`Failed to accept: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (connectionId, e) => {
    e.stopPropagation();
    try {
      setProcessingId(connectionId);
      await rejectConnection(connectionId);
      // Remove from list after rejecting
      setPendingRequests(prev => prev.filter(req => req.connection_id !== connectionId));
    } catch (error) {
      console.error("Failed to reject connection:", error);
      alert(`Failed to reject: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
    closeNotification();
  };

  return (
    <section className="fixed top-0 left-0 z-10 w-full h-screen fade-in bg-neutral-light-gray">
      <header className="relative flex justify-center p-4 gap-1.5">
        <button className="absolute top-4 left-4" onClick={closeNotification}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M7 7L17 17M7 17L17 7"
              stroke="#212529"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h3 className="text-center font-semibold">Notifications</h3>
      </header>

      <div className="px-4 py-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 80px)" }}>
        {isLoading && (
          <div className="text-center text-gray-500 py-8">
            Loading...
          </div>
        )}

        {!isLoading && pendingRequests.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No new notifications
          </div>
        )}

        {!isLoading && pendingRequests.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 px-2">Connection Requests</h4>
            {pendingRequests.map((request) => {
              const requester = request.requester?.[0];
              if (!requester) return null;

              return (
                <div
                  key={request.connection_id}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div 
                    className="flex items-center gap-3 mb-3 cursor-pointer"
                    onClick={() => handleViewProfile(requester.id)}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                      {requester.user_image ? (
                        <img
                          src={requester.user_image}
                          alt={requester.displayname || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl text-gray-500">
                          {(requester.displayname || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-gray-800 truncate">
                        {requester.displayname || "User"}
                      </h5>
                      <p className="text-sm text-gray-500">
                        wants to connect with you
                      </p>
                      {requester.city && (
                        <p className="text-xs text-gray-400">
                          {requester.city}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleAccept(request.connection_id, e)}
                      disabled={processingId === request.connection_id}
                      className="flex-1 py-2 px-4 bg-gradient-to-b from-green-400 to-green-500 border border-green-600 rounded-full text-sm font-medium text-white shadow hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {processingId === request.connection_id ? "Accepting..." : "Accept"}
                    </button>
                    <button
                      onClick={(e) => handleReject(request.connection_id, e)}
                      disabled={processingId === request.connection_id}
                      className="flex-1 py-2 px-4 bg-gradient-to-b from-red-400 to-red-500 border border-red-600 rounded-full text-sm font-medium text-white shadow hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {processingId === request.connection_id ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
