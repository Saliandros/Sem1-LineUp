/**
 * api.js - Frontend API Service Layer
 * ====================================
 * FORMÅL: Centraliseret data fetching med Supabase client
 * 
 * ARKITEKTUR PATTERN:
 * Dette er "Data Layer" / "Service Layer" pattern:
 * - Components kalder api.js functions
 * - api.js håndterer al Supabase kommunikation
 * - Centraliseret error handling
 * - Consistent response format
 * 
 * HVORFOR DETTE PATTERN?
 * ✅ Components behøver ikke kende Supabase details
 * ✅ Error handling ét sted
 * ✅ Nem at teste (kan mocke api.js)
 * ✅ Nem at skifte backend (kun ændre api.js)
 * ✅ Type safety og documentation
 * 
 * ERROR HANDLING:
 * Custom ApiError class:
 * - Extends Error med code og details
 * - handleSupabaseError() wrapper
 * - Throw errors som kan catches i components
 * 
 * AUTH HELPERS:
 * - getCurrentUser(): Hent current auth user
 * - getSession(): Hent current session
 * - getCurrentUserProfile(): Hent profil for current user
 * 
 * API SECTIONS:
 * Organiseret i sections med comments:
 * - Auth Helpers
 * - Profile API
 * - Posts API  
 * - Connections API
 * - Collaborations API
 * - Messages API
 * - Threads API
 * Etc.
 * 
 * SUPABASE CLIENT USAGE:
 * Alle functions bruger supabase client:
 * const { data, error } = await supabase.from('table').select()
 * 
 * VIGTIGT:
 * Tjek error.code === 'PGRST116' for "not found"
 * Dette er ikke en fejl, bare tomt resultat
 * 
 * ENVIRONMENT:
 * API_BASE bruges til backend REST calls (optional)
 * Default: http://localhost:3000
 * 
 * LAVET AF: Jimmi Larsen & Alle (forskellige endpoints)
 */

import { supabase } from "./supabaseClient";

/**
 * API Service using Supabase client
 * Centralized data fetching with error handling
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ============================================
// ERROR HANDLING
// ============================================

// Custom error class for API errors
// Giver mere information end standard Error
export class ApiError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

// Helper til at håndtere Supabase errors
// Throw ApiError hvis der er en error
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

/**
 * Get current authenticated user
 * Returnerer null hvis ikke logged in
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  handleSupabaseError(error);
  return user;
}

/**
 * Get current session
 */
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  handleSupabaseError(error);
  return session;
}

/*===============================================
=          PROFILE API           =
===============================================*/

/*===============================================
=          Get profile by user ID           =
===============================================*/

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

/*===============================================
=          Get profile by user ID           =
===============================================*/

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

/**
 * Update current user's profile
 */
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

/**
 * Upload profile image to Supabase Storage
 */
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

/**
 * Get all profiles (for browsing)
 */
export async function getAllProfiles(limit = 50) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .limit(limit);

  handleSupabaseError(error);
  return data || [];
}

/**
 * Search profiles by displayname only
 */
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

/*===============================================
=          CONNECTIONS API           =
===============================================*/

/**
 * Get all connections for current user (only accepted ones)
 */
export async function getConnections() {
  const { data, error } = await supabase
    .from("connections")
    .select("*")
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  handleSupabaseError(error);
  return data || [];
}

/**
 * Check if connected with a user
 * Returns the connection object if it exists, null otherwise
 */
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

/**
 * Create a connection request with another user
 */
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

/**
 * Accept a connection request
 */
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

/**
 * Reject a connection request
 */
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

/**
 * Get pending connection requests (received by current user)
 */
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

/**
 * Delete a connection
 */
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
