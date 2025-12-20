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

// Hent alle venner fra database
export async function fetchAllFriends() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("friends").select("*");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching friends:", error);
    return [];
  }
}

// Hent alle grupper fra database
export async function fetchGroupChats() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("group_chats").select("*");

    if (error) {
      // Hvis tabellen ikke eksisterer, returner bare en tom array
      if (error.code === "PGRST205") {
        console.log(
          "Group chats table does not exist yet, returning empty array"
        );
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error("Error fetching group chats:", error);
    return [];
  }
}

// MIDLERTIDIG: Hent alle brugere som "venner" (til vi får en ordentlig profilside)
export async function fetchAllUsersAsFriends() {
  try {
    const VITE_API_URL = import.meta.env.VITE_API_URL;
    const response = await fetch(`${VITE_API_URL}/api/profiles`);

    if (!response.ok) {
      throw new Error(`Failed to fetch profiles: ${response.statusText}`);
    }

    const { profiles } = await response.json();

    console.log("Fetched profiles data:", profiles);

    return (profiles || []).map((profile) => ({
      id: profile.id,
      title: profile.displayname || profile.username || profile.email?.split('@')[0] || 'Unknown',
      avatar: profile.user_image,
      user_image: profile.user_image,
      username: profile.username || profile.displayname,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Opret et map over vennernes navne
export async function getFriendsMap() {
  const friends = await fetchAllUsersAsFriends();
  return Object.fromEntries(
    friends.map((friend) => [friend.id, friend.title || friend.name])
  );
}

// Hent en enkelt brugers profil via ID
export async function getUserProfile(userId) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, user_image")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return data
      ? {
          id: data.id,
          username: data.username,
          user_image: data.user_image,
        }
      : null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
