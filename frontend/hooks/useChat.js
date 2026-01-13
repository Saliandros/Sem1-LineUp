// Hook to manage chat threads
// et hook til at håndtere chat threads

// hvad er et hook?
// Et hook er en specialfunktion i React, der tillader dig at "hooke" ind i Reacts state og livscyklus funktioner fra funktionelle komponenter. Hooks starter altid med "use", som f.eks. useState eller useEffect. Du kan også lave dine egne hooks, som denne useChat hook, for at genbruge logik på tværs af komponenter.

import { useState } from "react";
import { useNavigate } from "react-router";
import { getOrCreateThread } from "../data/messages.js";

export function useChat(user) {
  const [creatingThread, setCreatingThread] = useState(false);
  const navigate = useNavigate();

  const startChat = async (friendId) => {
    console.log("🚀 startChat called with friendId:", friendId, "user:", user?.id);
    
    if (creatingThread) {
      console.log("⏳ Already creating thread, skipping...");
      return;
    }
    
    if (!user?.id) {
      console.error("❌ No user ID available");
      return;
    }

    try {
      setCreatingThread(true);
      console.log("📞 Calling getOrCreateThread...");
      
      // Tjek om der allerede er en thread med denne person, eller lav en ny
      const thread = await getOrCreateThread(user.id, friendId);
      
      console.log("✅ Thread result:", thread);

      if (thread && thread.thread_id) {
        console.log("🔄 Navigating to /chat/" + thread.thread_id);
        // Naviger til chatten
        navigate(`/chat/${thread.thread_id}`);
      } else {
        console.error("❌ No thread_id in response:", thread);
      }
    } catch (error) {
      console.error("❌ Error creating/opening thread:", error);
      alert(`Failed to open chat: ${error.message}`);
    } finally {
      setCreatingThread(false);
    }
  };

  return { startChat, creatingThread };
}
