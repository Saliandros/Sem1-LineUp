import { createClient } from "@supabase/supabase-js";

let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

// Hent alle beskeder fra en tråd
export async function fetchMessages(threadId) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    console.log("Raw messages from DB:", data);
    return data || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

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
  participantsMap, // Map af user_id -> {avatar, name}
  currentUserAvatar // Den nuværende brugers avatar
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

// Send en besked
export async function sendMessage(threadId, userId, content) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        thread_id: threadId,
        user_id: userId,
        message_content: content,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

// Hent alle tråde for en bruger
export async function getUserThreads(userId) {
  try {
    const supabase = getSupabaseClient();

    // Hent alle thread_participants hvor brugeren deltager
    const { data: participations, error: participationsError } = await supabase
      .from("thread_participants")
      .select("thread_id, role, joined_at")
      .eq("user_id", userId);

    if (participationsError) throw participationsError;

    if (!participations || participations.length === 0) {
      return [];
    }

    // Hent thread detaljer
    const threadIds = participations.map(p => p.thread_id);
    const { data: threads, error: threadsError } = await supabase
      .from("threads")
      .select("*")
      .in("thread_id", threadIds)
      .order("created_at", { ascending: false });

    if (threadsError) throw threadsError;

    return threads || [];
  } catch (error) {
    console.error("Error fetching user threads:", error);
    return [];
  }
}

// Hent kun gruppe threads (mer end 2 deltagere) for en bruger
export async function getUserGroupThreads(userId) {
  try {
    const supabase = getSupabaseClient();

    // Hent alle threads brugeren deltager i
    const { data: participations, error: participationsError } = await supabase
      .from("thread_participants")
      .select("thread_id")
      .eq("user_id", userId);

    if (participationsError) throw participationsError;

    if (!participations || participations.length === 0) {
      return [];
    }

    const threadIds = participations.map(p => p.thread_id);
    
    // For hver thread, tjek hvor mange deltagere der er
    const groupThreads = [];
    
    for (const threadId of threadIds) {
      const { data: participantCount, error } = await supabase
        .from("thread_participants")
        .select("user_id", { count: "exact" })
        .eq("thread_id", threadId);

      if (error) {
        console.error("Error counting participants:", error);
        continue;
      }

      // Kun threads med mere end 2 deltagere er gruppechats
      if (participantCount && participantCount.length > 2) {
        // Hent thread data
        const { data: threadData, error: threadError } = await supabase
          .from("threads")
          .select("*")
          .eq("thread_id", threadId)
          .single();

        if (!threadError && threadData) {
          groupThreads.push(threadData);
        }
      }
    }

    // Sorter efter nyeste først
    return groupThreads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  } catch (error) {
    console.error("Error fetching user group threads:", error);
    return [];
  }
}

// Hent deltagere i en thread med deres profil data
export async function getThreadParticipantsWithProfiles(threadId) {
  try {
    const supabase = getSupabaseClient();

    const { data: participants, error } = await supabase
      .from("thread_participants")
      .select(`
        user_id,
        role,
        joined_at,
        profiles!inner (
          id,
          displayname,
          user_image
        )
      `)
      .eq("thread_id", threadId);

    if (error) throw error;

    return participants?.map(p => ({
      id: p.user_id,
      displayname: p.profiles.displayname,
      avatar: p.profiles.user_image,
      role: p.role,
      joined_at: p.joined_at
    })) || [];

  } catch (error) {
    console.error("Error fetching thread participants with profiles:", error);
    return [];
  }
}
// Opdater gruppe navn
export async function updateGroupName(threadId, groupName) {
  try {
    const supabase = getSupabaseClient();

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

// Opdater gruppe billede
export async function updateGroupImage(threadId, imageUrl) {
  try {
    const supabase = getSupabaseClient();

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
}export async function getThread(threadId) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("threads")
      .select("*")
      .eq("thread_id", threadId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Ingen tråd fundet
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error fetching thread:", error);
    return null;
  }
}

// Opret eller hent en tråd mellem to brugere
export async function getOrCreateThread(user1Id, user2Id) {
  try {
    const supabase = getSupabaseClient();

    // Find eksisterende thread hvor begge brugere er deltagere
    // Først hent alle threads hvor user1 deltager
    const { data: user1Participations, error: error1 } = await supabase
      .from("thread_participants")
      .select("thread_id")
      .eq("user_id", user1Id);

    if (error1) throw error1;

    if (!user1Participations || user1Participations.length === 0) {
      // Ingen threads for user1, opret ny
      return await createDirectThread(user1Id, user2Id);
    }

    // Hent alle threads hvor user2 deltager
    const { data: user2Participations, error: error2 } = await supabase
      .from("thread_participants")
      .select("thread_id")
      .eq("user_id", user2Id);

    if (error2) throw error2;

    // Find fælles threads (direct chats mellem de to brugere)
    const user1ThreadIds = user1Participations.map(p => p.thread_id);
    const user2ThreadIds = user2Participations.map(p => p.thread_id);
    const commonThreadIds = user1ThreadIds.filter(id => user2ThreadIds.includes(id));

    if (commonThreadIds.length > 0) {
      // Find den første direct thread med kun disse 2 deltagere
      for (const threadId of commonThreadIds) {
        const { data: participants, error: pError } = await supabase
          .from("thread_participants")
          .select("user_id")
          .eq("thread_id", threadId);

        if (pError) continue;

        if (participants.length === 2) {
          // Dette er en 1-to-1 chat, hent thread detaljer
          const { data: thread, error: tError } = await supabase
            .from("threads")
            .select("*")
            .eq("thread_id", threadId)
            .eq("thread_type", "direct")
            .single();

          if (!tError && thread) {
            return thread;
          }
        }
      }
    }

    // Ingen eksisterende direct thread fundet, opret ny
    return await createDirectThread(user1Id, user2Id);
  } catch (error) {
    console.error("Error getting or creating thread:", error);
    throw error;
  }
}

// Helper function til at oprette en ny direct thread
async function createDirectThread(user1Id, user2Id) {
  const supabase = getSupabaseClient();

  // Opret thread
  const { data: newThread, error: createError } = await supabase
    .from("threads")
    .insert({
      created_by_user_id: user1Id,
      thread_type: "direct",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (createError) throw createError;

  // Tilføj begge brugere som deltagere
  const { error: participantsError } = await supabase
    .from("thread_participants")
    .insert([
      { thread_id: newThread.thread_id, user_id: user1Id, role: "member" },
      { thread_id: newThread.thread_id, user_id: user2Id, role: "member" },
    ]);

  if (participantsError) {
    // Rollback: slet thread hvis deltagere ikke kunne tilføjes
    await supabase.from("threads").delete().eq("thread_id", newThread.thread_id);
    throw participantsError;
  }

  return newThread;
}

// Opret gruppe chat med flere deltagere
export async function createGroupThread(creatorId, participantIds, groupName = null) {
  const supabase = getSupabaseClient();

  // Opret thread
  const { data: newThread, error: createError } = await supabase
    .from("threads")
    .insert({
      created_by_user_id: creatorId,
      thread_type: "group",
      thread_name: groupName,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (createError) throw createError;

  // Tilføj alle deltagere (inklusiv skaberen)
  const allParticipants = [creatorId, ...participantIds];
  const participantsData = allParticipants.map(userId => ({
    thread_id: newThread.thread_id, 
    user_id: userId, 
    role: userId === creatorId ? "admin" : "member"
  }));

  const { error: participantsError } = await supabase
    .from("thread_participants")
    .insert(participantsData);

  if (participantsError) {
    // Rollback: slet thread hvis deltagere ikke kunne tilføjes
    await supabase.from("threads").delete().eq("thread_id", newThread.thread_id);
    throw participantsError;
  }

  return newThread;
}

// Slet en tråd og tilhørende beskeder
export async function deleteThread(threadId) {
  try {
    const supabase = getSupabaseClient();

    // Slet beskeder først pga. FK constraints
    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .eq("thread_id", threadId);

    if (messagesError) throw messagesError;

    const { error: threadError } = await supabase
      .from("threads")
      .delete()
      .eq("thread_id", threadId);

    if (threadError) throw threadError;
  } catch (error) {
    console.error("Error deleting thread:", error);
    throw error;
  }
}

// Hent deltagere i en thread
export async function getThreadParticipants(threadId) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("thread_participants")
      .select("user_id, role, joined_at, profiles(id, displayname, user_image)")
      .eq("thread_id", threadId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching thread participants:", error);
    return [];
  }
}

// Tilføj deltagere til en eksisterende thread (konverter til gruppe chat)
export async function addParticipantsToThread(threadId, newUserIds) {
  try {
    const supabase = getSupabaseClient();

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
