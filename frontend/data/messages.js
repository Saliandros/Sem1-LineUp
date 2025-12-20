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
    id: msg.id || `${msg.thread_id}-${msg.sender_id}-${msg.created_at}`,
    type: msg.sender_id === currentUserId ? "user" : "friend",
    content: msg.message_content,
    senderId: msg.sender_id,
    avatar: msg.sender_id === currentUserId ? currentUserImage : friendImage,
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
        sender_id: userId,
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

    // Hent alle threads hvor brugeren er user_id
    const { data: threads1, error: error1 } = await supabase
      .from("threads")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error1) throw error1;

    // Hent alle threads hvor brugeren er user_id_1
    const { data: threads2, error: error2 } = await supabase
      .from("threads")
      .select("*")
      .eq("user_id_1", userId)
      .order("created_at", { ascending: false });

    if (error2) throw error2;

    // Merge og fjern duplikater
    const allThreads = [...(threads1 || []), ...(threads2 || [])];
    const uniqueThreads = Array.from(
      new Map(allThreads.map((t) => [t.thread_id, t])).values()
    );

    return uniqueThreads.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
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

    // Først, prøv at finde en eksisterende tråd - brug and() operator korrekt
    const { data: existingThreads, error: fetchError } = await supabase
      .from("threads")
      .select("*")
      .or(
        `and(user_id.eq.${user1Id},user_id_1.eq.${user2Id}),and(user_id.eq.${user2Id},user_id_1.eq.${user1Id})`
      );

    if (fetchError) throw fetchError;

    if (existingThreads && existingThreads.length > 0) {
      return existingThreads[0];
    }

    // Hvis ingen tråd findes, opret en ny
    const { data: newThread, error: createError } = await supabase
      .from("threads")
      .insert({
        user_id: user1Id,
        user_id_1: user2Id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) throw createError;
    return newThread;
  } catch (error) {
    console.error("Error getting or creating thread:", error);
    throw error;
  }
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
