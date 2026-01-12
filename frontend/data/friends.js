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

// Hent alle venner (connections) for den nuværende bruger
export async function fetchAllUsersAsFriends() {
  try {
    const supabase = getSupabaseClient();
    
    // Først hent den nuværende bruger
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      return [];
    }

    console.log("Current user ID:", user.id);

    // Hent alle connections hvor brugeren er en del af OG status er 'accepted'
    // Split into two separate queries for better RLS compatibility
    const { data: connections1, error: connectionsError1 } = await supabase
      .from("connections")
      .select("*")
      .eq("user_id_1", user.id)
      .eq("status", "accepted");

    const { data: connections2, error: connectionsError2 } = await supabase
      .from("connections")
      .select("*")
      .eq("user_id_2", user.id)
      .eq("status", "accepted");

    if (connectionsError1) {
      console.error("Error fetching connections (user_id_1):", connectionsError1);
    }
    if (connectionsError2) {
      console.error("Error fetching connections (user_id_2):", connectionsError2);
    }

    const connections = [...(connections1 || []), ...(connections2 || [])];
    console.log("Found connections:", connections);

    if (!connections || connections.length === 0) {
      console.log("No connections found");
      return [];
    }

    // Find alle vennernes IDs (den anden bruger i hver connection)
    const friendIds = connections.map(conn => 
      conn.user_id_1 === user.id ? conn.user_id_2 : conn.user_id_1
    );

    console.log("Friend IDs:", friendIds);

    // Hent profil information for alle venner
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, displayname, user_image")
      .in("id", friendIds);

    if (profilesError) {
      console.error("Error fetching friend profiles:", profilesError);
      return [];
    }

    console.log("Fetched connected friends:", profiles);

    return (profiles || []).map((profile) => ({
      id: profile.id,
      title: profile.displayname || 'Unknown',
      avatar: profile.user_image,
      user_image: profile.user_image,
      username: profile.displayname,
    }));
  } catch (error) {
    console.error("Error fetching connected friends:", error);
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
      .select("id, displayname, user_image")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return data
      ? {
          id: data.id,
          displayname: data.displayname,
          user_image: data.user_image,
        }
      : null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
