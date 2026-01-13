// File: frontend/data/messages.js
// Denne fil håndterer alle besked- og trådrelaterede API-kald og datatransformationer

import { supabase } from "../lib/supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Hent auth token fra Supabase klienten
// bruges til at autorisere API kald
async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

// Hent beskeder for en given tråd via backend API
export async function fetchMessages(threadId) {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error("No auth token available");
      return [];
    }

    // Fetch beskeder fra backend API
    const response = await fetch(`${API_URL}/api/messages/thread/${threadId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }

    const { messages } = await response.json();
    console.log("Raw messages from API:", messages);
    return messages || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

// Send en besked via backend API
// returnerer den oprettede besked data
export async function sendMessage(threadId, userId, content) {
  try {

    // Hent auth token
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No auth token available");
    }

    // Send besked til backend API
    const response = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        thread_id: threadId,
        message_content: content
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to send message: ${response.status}`);
    }

    const { messageData } = await response.json();
    return messageData;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

// Hent alle tråde for en bruger via backend API
export async function getUserThreads(userId) {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error("No auth token available");
      return [];
    }

    const response = await fetch(`${API_URL}/api/threads/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch threads: ${response.status}`);
    }

    const { threads } = await response.json();
    return threads || [];
  } catch (error) {
    console.error("Error fetching user threads:", error);
    return [];
  }
}

// Hent kun gruppe threads (thread_type === 'group') for en bruger
export async function getUserGroupThreads(userId) {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error("No auth token available");
      return [];
    }

    const response = await fetch(`${API_URL}/api/threads/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch threads: ${response.status}`);
    }

    const { threads } = await response.json();
    
    // Filter kun gruppethreads
    // Stadig behov for Supabase check af deltagere da API ikke returnerer det
    const groupThreads = [];
    
    for (const thread of threads) {
      if (thread.thread_type === 'group') {
        groupThreads.push(thread);
        continue;
      }
      
      // Check antal deltagere via Supabase
      // det er her vi afgør om det er en gruppechat eller ej
      const { data: participantCount } = await supabase
        .from("thread_participants")
        .select("user_id", { count: "exact" })
        .eq("thread_id", thread.thread_id);

      if (participantCount && participantCount.length > 2) {
        groupThreads.push(thread);
      }
    }

    return groupThreads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  } catch (error) {
    console.error("Error fetching user group threads:", error);
    return [];
  }
}

// Hent deltagere i en thread med deres profil data via backend API
export async function getThreadParticipantsWithProfiles(threadId) {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error("No auth token available");
      return [];
    }

    const response = await fetch(`${API_URL}/api/threads/${threadId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch thread: ${response.status}`);
    }

    const { thread } = await response.json();
    
    return thread.participants?.map(p => ({
      id: p.user_id,
      displayname: p.profiles?.displayname || 'Unknown',
      avatar: p.profiles?.user_image || null,
      role: p.role,
      joined_at: p.joined_at
    })) || [];

  } catch (error) {
    console.error("Error fetching thread participants with profiles:", error);
    return [];
  }
}

// Opret eller hent en tråd mellem to brugere via backend API
export async function getOrCreateThread(user1Id, user2Id) {
  console.log("🔧 getOrCreateThread START - user1:", user1Id, "user2:", user2Id);
  try {
    console.log("🔑 Getting auth token...");
    const token = await getAuthToken();
    if (!token) {
      console.error("❌ No auth token!");
      throw new Error("No auth token available");
    }
    console.log("✅ Token obtained");

    // Først forsøg at finde eksisterende thread
    console.log("🔍 Fetching existing threads...");
    const threadsResponse = await fetch(`${API_URL}/api/threads/user/${user1Id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("📡 Threads response status:", threadsResponse.status);
    if (threadsResponse.ok) {
      const { threads } = await threadsResponse.json();
      console.log("📋 Found threads:", threads?.length || 0);
      
      // Find direct thread mellem disse to brugere
      for (const thread of threads) {
        if (thread.thread_type === 'direct') {
          console.log("🔍 Checking direct thread:", thread.thread_id);
          // Tjek om den anden bruger er deltager (stadig via Supabase da API ikke giver deltager liste)
          console.log("⚠️ WARNING: Using direct Supabase query - this might cause issues!");
          const { data: participants } = await supabase
            .from("thread_participants")
            .select("user_id")
            .eq("thread_id", thread.thread_id);

          console.log("👥 Participants:", participants?.length || 0);
          if (participants && participants.length === 2) {
            const userIds = participants.map(p => p.user_id);
            if (userIds.includes(user1Id) && userIds.includes(user2Id)) {
              console.log("✅ FOUND EXISTING THREAD:", thread.thread_id);
              return thread;
            }
          }
        }
      }
    }

    // Ingen eksisterende thread fundet, opret ny via backend
    // denne del er til at oprette og eller tjekke om der er en eksisterende tråd
    console.log("➕ Creating new thread...");
    const createResponse = await fetch(`${API_URL}/api/threads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        participant_ids: [user2Id], // API tilføjer automatisk creator (user1)
        thread_type: 'direct'
      })
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(errorData.error || `Failed to create thread: ${createResponse.status}`);
    }

    const { thread } = await createResponse.json();
    console.log("🎉 Thread created/found successfully:", thread);
    return thread;
  } catch (error) {
    console.error("❌ CRITICAL ERROR in getOrCreateThread:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      user1Id,
      user2Id
    });
    throw error;
  }
}

// Opret gruppe chat med flere deltagere via backend API
export async function createGroupThread(creatorId, participantIds, groupName = null) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No auth token available");
    }

    const response = await fetch(`${API_URL}/api/threads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        participant_ids: participantIds,
        thread_type: 'group',
        thread_name: groupName
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create group thread: ${response.status}`);
    }

    const { thread } = await response.json();
    return thread;
  } catch (error) {
    console.error("Error creating group thread:", error);
    throw error;
  }
}

// Slet en tråd via backend API
// Jeg er kommet til at tænke på at denne funktion måske ikke er
// så heldig grundet at sletning af beskeder kan være problematisk i forhold til databeskyttelse osv.
// man skulle heller have en "arkiver/deaktiver" funktion i stedet der i frontenden skjuler tråden
export async function deleteThread(threadId) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No auth token available");
    }

    const response = await fetch(`${API_URL}/api/threads/${threadId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete thread: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting thread:", error);
    throw error;
  }
}

// Opdater gruppe navn (stadig via Supabase da ingen backend route findes)
export async function updateGroupName(threadId, groupName) {
  try {
    const { data, error } = await supabase
      .from("threads")
      .update({ group_name: groupName })
      .eq("thread_id", threadId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating group name:", error);
    throw error;
  }
}

// Opdater gruppe billede (stadig via Supabase da ingen backend route findes)
export async function updateGroupImage(threadId, imageUrl) {
  try {
    const { data, error } = await supabase
      .from("threads")
      .update({ group_image: imageUrl })
      .eq("thread_id", threadId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating group image:", error);
    throw error;
  }
}

// Hent thread (stadig via Supabase da bruges lokalt)
export async function getThread(threadId) {
  try {
    console.log("🔍 getThread called for threadId:", threadId);
    const token = await getAuthToken();
    if (!token) {
      console.error("❌ No auth token for getThread");
      return null;
    }

    const response = await fetch(`${API_URL}/api/threads/${threadId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("📡 getThread response status:", response.status);
    
    if (response.status === 404) {
      console.log("⚠️ Thread not found");
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch thread: ${response.status}`);
    }

    const { thread } = await response.json();
    console.log("✅ Thread fetched:", thread);
    return thread;
  } catch (error) {
    console.error("Error fetching thread:", error);
    return null;
  }
}

// ==================== DATA TRANSFORMERS ====================

// Transformér databasebeskeder til Chat komponents format
export function transformMessages(
  databaseMessages,
  currentUserId,
  currentUserImage,
  friendImage,
  friendName = "Friend"
) {
  return databaseMessages.map((msg) => ({
    id: msg.message_id || msg.id || `${msg.thread_id}-${msg.user_id}-${msg.created_at}`,
    type: msg.user_id === currentUserId ? "user" : "friend",
    content: msg.message_content,
    senderId: msg.user_id,
    avatar: msg.user_id === currentUserId ? currentUserImage : friendImage,
    senderName: msg.user_id === currentUserId ? "You" : friendName,
    created_at: msg.created_at,
  }));
}

// Transformér beskeder til gruppechat format med deltagere map
export function transformGroupMessages(
  databaseMessages,
  currentUserId,
  participantsMap,
  currentUserAvatar
) {
  return databaseMessages.map((msg) => {
    const isCurrentUser = msg.user_id === currentUserId;
    const participant = participantsMap[msg.user_id];
    
    return {
      id: msg.message_id || msg.id || `${msg.thread_id}-${msg.user_id}-${msg.created_at}`,
      type: isCurrentUser ? "user" : "friend",
      content: msg.message_content,
      senderId: msg.user_id,
      avatar: isCurrentUser ? currentUserAvatar : (participant?.avatar || "/assets/icons/user-circle.svg"),
      senderName: isCurrentUser ? "You" : (participant?.name || "Unknown"),
      created_at: msg.created_at,
    };
  });
}

// Tilføj deltagere til en eksisterende thread (konverter til gruppe hvis nødvendigt)
export async function addParticipantsToThread(threadId, newUserIds) {
  try {
    // Først hent den nuværende thread for at se type
    const { data: thread, error: threadError } = await supabase
      .from("threads")
      .select("thread_type, thread_id")
      .eq("thread_id", threadId)
      .single();

    if (threadError) throw threadError;

    // Hvis det er en direct chat, konverter til group
    if (thread.thread_type === "direct") {
      const { error: updateError } = await supabase
        .from("threads")
        .update({ thread_type: "group" })
        .eq("thread_id", threadId);

      if (updateError) throw updateError;
    }

    // Tilføj nye deltagere
    const participantsData = newUserIds.map(userId => ({
      thread_id: threadId,
      user_id: userId,
      role: "member",
      joined_at: new Date().toISOString()
    }));

    const { error: participantsError } = await supabase
      .from("thread_participants")
      .insert(participantsData);

    if (participantsError) throw participantsError;

    return true;
  } catch (error) {
    console.error("Error adding participants to thread:", error);
    throw error;
  }
}

// Alias til getThreadParticipantsWithProfiles for bagudkompatibilitet
export const getThreadParticipants = getThreadParticipantsWithProfiles;
