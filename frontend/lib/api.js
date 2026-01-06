import { supabase } from "./supabaseClient";

/**
 * API Service using Supabase client
 * Centralized data fetching with error handling
 */

// ============================================
// ERROR HANDLING
// ============================================
export class ApiError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

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
