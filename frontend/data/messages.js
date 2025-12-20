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
  friendImage
) {
  return databaseMessages.map((msg) => ({
    id: msg.message_id || msg.id || `${msg.thread_id}-${msg.user_id}-${msg.created_at}`,
    type: msg.user_id === currentUserId ? "user" : "friend",
    content: msg.message_content,
    senderId: msg.user_id,
    avatar: msg.user_id === currentUserId ? currentUserImage : friendImage,
    created_at: msg.created_at,
  }));
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
export async function getThread(threadId) {
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
