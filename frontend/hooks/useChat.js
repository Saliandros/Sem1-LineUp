import { useState } from "react";
import { useNavigate } from "react-router";
import { getOrCreateThread } from "../data/messages.js";

export function useChat(user) {
  const [creatingThread, setCreatingThread] = useState(false);
  const navigate = useNavigate();

  const startChat = async (friendId) => {
    if (creatingThread || !user?.id) return;

    try {
      setCreatingThread(true);
      // Tjek om der allerede er en thread med denne person, eller lav en ny
      const thread = await getOrCreateThread(user.id, friendId);

      if (thread && thread.thread_id) {
        // Naviger til chatten
        navigate(`/chat/${thread.thread_id}`);
      }
    } catch (error) {
      console.error("Error creating/opening thread:", error);
    } finally {
      setCreatingThread(false);
    }
  };

  return { startChat, creatingThread };
}
