/**
 * api.js - Frontend Data Layer
 * ==============================
 * FORMÅL: Centraliseret Supabase kommunikation
 * 
 * PATTERN: Service Layer
 * • Components → api.js → Supabase/Backend
 * • Centraliseret error handling
 * • Nem at mocke til tests
 * 
 * ERROR HANDLING:
 * • ApiError class med code + details
 * • PGRST116 = "not found" (ignorer den)
 * 
 * SECTIONS:
 * • Auth (getCurrentUser, getSession)
 * • Profiles (getCurrentUserProfile, updateProfile)
 * • Connections (getConnections, createConnection)
 * • Posts, Threads, Messages
 * 
 * LAVET AF: Jimmi Larsen
 */

import { supabase } from "./supabaseClient";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ============================================
// ERROR HANDLING
// ============================================

// ApiError: Custom error med code + details
export class ApiError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

// handleSupabaseError: Throw ApiError hvis error findes
function handleSupabaseError(error) {
  if (error) {
    throw new ApiError(
      error.message || "Database error",
      error.code,
      error.details
    );
  }
}

// ============================================
// AUTH HELPERS
// ============================================

// getCurrentUser: Hent auth user (null hvis logged out)
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  handleSupabaseError(error);
  return user;
}

// getSession: Hent Supabase session
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  handleSupabaseError(error);
  return session;
}

// ===========================================
// PROFILE API
// ===========================================

// getCurrentUserProfile: Hent egen profil
export async function getCurrentUserProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    handleSupabaseError(error);
  }

  return data;
}

// getProfileById: Hent profil for specifik user ID
export async function getProfileById(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    handleSupabaseError(error);
  }

  return data;
}

// updateProfile: Opdater current user profil (upsert)
export async function updateProfile(profileData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError("Not authenticated", "UNAUTHENTICATED", null);
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  handleSupabaseError(error);
  return data;
}

// uploadProfileImage: Upload til Supabase Storage + opdater profil
export async function uploadProfileImage(file) {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError("Not authenticated", "UNAUTHENTICATED", null);
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `profile-images/${fileName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("profiles")
    .upload(filePath, file);

  handleSupabaseError(uploadError);

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("profiles").getPublicUrl(filePath);

  // Update profile with new image URL
  await updateProfile({ user_image: publicUrl });

  return publicUrl;
}

// getAllProfiles: Hent alle profiler (til browsing, limit 50)
export async function getAllProfiles(limit = 50) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .limit(limit);

  handleSupabaseError(error);
  return data || [];
}

// searchProfiles: Søg efter displayname (ILIKE, limit 20)
export async function searchProfiles(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id, displayname, user_image, user_bio, city, user_type")
    .ilike("displayname", searchTerm)
    .order("displayname", { ascending: true })
    .limit(20);

  handleSupabaseError(error);
  return data || [];
}

// ===========================================
// CONNECTIONS API  
// ===========================================

// getConnections: Hent accepted connections for current user
export async function getConnections() {
  const { data, error } = await supabase
    .from("connections")
    .select("*")
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  handleSupabaseError(error);
  return data || [];
}

// checkConnection: Tjek om connected med specifik user (ordered pair logic)
export async function checkConnection(userId) {
  const user = await getCurrentUser();
  if (!user) return null;

  const userA = user.id < userId ? user.id : userId;
  const userB = user.id < userId ? userId : user.id;

  const { data, error } = await supabase
    .from("connections")
    .select("*")
    .eq("user_id_1", userA)
    .eq("user_id_2", userB)
    .maybeSingle();

  if (error) {
    console.error("Check connection error:", error);
    return null;
  }

  return data;
}

// createConnection: Send friend request (via backend API)
export async function createConnection(userId) {
  const user = await getCurrentUser();
  if (!user) {
    throw new ApiError("Not authenticated", "UNAUTHENTICATED", null);
  }

  if (user.id === userId) {
    throw new ApiError("Cannot connect with yourself", "INVALID_REQUEST", null);
  }

  // Get session token for authorization
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new ApiError("No active session", "UNAUTHENTICATED", null);
  }

  // Use backend API instead of direct Supabase to avoid connection_id issues
  const response = await fetch(`${API_BASE}/api/connections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ user_id_2: userId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError(
      errorData.error || "Failed to create connection request",
      response.status.toString(),
      errorData
    );
  }

  const { connection } = await response.json();
  return connection;
}

// acceptConnection: Accepter friend request (PATCH backend)
export async function acceptConnection(connectionId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new ApiError("No active session", "UNAUTHENTICATED", null);
  }

  const response = await fetch(`${API_BASE}/api/connections/${connectionId}/accept`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError(
      errorData.error || "Failed to accept connection",
      response.status.toString(),
      errorData
    );
  }

  const { connection } = await response.json();
  return connection;
}

// rejectConnection: Afvis friend request (PATCH backend)
export async function rejectConnection(connectionId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new ApiError("No active session", "UNAUTHENTICATED", null);
  }

  const response = await fetch(`${API_BASE}/api/connections/${connectionId}/reject`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError(
      errorData.error || "Failed to reject connection",
      response.status.toString(),
      errorData
    );
  }

  return true;
}

// getPendingRequests: Hent pending requests modtaget af current user
export async function getPendingRequests() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new ApiError("No active session", "UNAUTHENTICATED", null);
  }

  const response = await fetch(`${API_BASE}/api/connections/requests/pending`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError(
      errorData.error || "Failed to get pending requests",
      response.status.toString(),
      errorData
    );
  }

  const { requests } = await response.json();
  return requests;
}

// deleteConnection: Slet connection (DELETE backend med auth)
export async function deleteConnection(connectionId) {
  // Get session token for authorization
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new ApiError("No active session", "UNAUTHENTICATED", null);
  }

  // Use backend API with authentication
  const response = await fetch(`${API_BASE}/api/connections/${connectionId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError(
      errorData.error || "Failed to delete connection",
      response.status.toString(),
      errorData
    );
  }

  return true;
}
