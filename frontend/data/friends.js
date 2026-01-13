// denne fil bruges til at hente venner og grupper fra supabase
// det er også denne fil der henter venner via connections API'et
// og dens data bruges også i FriendsList komponenten og NewChat komponenten
// samt addFriendToGroup funktionaliteten
import { supabase } from "../lib/supabaseClient";

// Reuse the shared Supabase client instance to avoid multiple client warnings
function getSupabaseClient() {
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

// denne funktion ville jeg gerne have lavet om til realtime
// så den hentede online venner dynamisk
export async function fetchAllUsersAsFriends() {
  console.log("🚀 fetchAllUsersAsFriends called");
  try {
    const supabase = getSupabaseClient();
    console.log("✅ Supabase client created");
    
    // Først hent session for token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log("📊 getSession result:", { session: !!session, error: sessionError });
    
    if (sessionError || !session) {
      console.error("❌ Error getting session:", sessionError);
      return [];
    }

    // Derefter hent user data (mere reliable end getSession().user)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("👤 getUser result:", { user: !!user, userId: user?.id, error: userError });
    
    if (userError || !user) {
      console.error("❌ Error getting user:", userError);
      return [];
    }

    console.log("🔑 Current user ID:", user.id);
    console.log("🔑 Access token exists:", !!session.access_token);

    // Brug backend API i stedet for direkte Supabase
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    console.log("🌐 API_URL:", API_URL);
    
    const response = await fetch(`${API_URL}/api/connections`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("📡 Connections response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to fetch connections:", response.status, errorText);
      return [];
    }

    const { connections } = await response.json();
    console.log("✅ Found connections:", connections.length, connections);

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
// et map er et objekt hvor nøglerne er bruger ID'er og værdierne er brugerens navn
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
