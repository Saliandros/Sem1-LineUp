// File: frontend/lib/profileApi.js
// bruges i EditProfile komponenten
// til at opdatere profil data inklusiv billede upload

// kunne man merge dette med api.js filen?
// måske men den blev opdaget så sent i forløbet
// så den får lov at være selvstændig for nu

import { supabase } from "./supabaseClient.js";

export async function updateProfileWithImage(profileData, imageFile = null) {
  // Get the current session from Supabase
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error("No active session found. Please log in again.");
  }

  const formData = new FormData();
  Object.keys(profileData).forEach((key) => {
    if (profileData[key] !== null && profileData[key] !== undefined) {
      formData.append(key, profileData[key]);
    }
  });
  
  if (imageFile) {
    formData.append("user_image", imageFile);
  }

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const response = await fetch(`${API_BASE}/api/profiles`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update profile");
  }

  return response.json();
}
