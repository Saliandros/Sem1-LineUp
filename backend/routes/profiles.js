/**
 * profiles.js - User Profiles API Routes
 * =======================================
 * FORMÅL: Håndter bruger profil data CRUD operationer
 * 
 * HVAD ER EN PROFIL?
 * Profil indeholder brugerens public information:
 * - displayname: Vist navn
 * - user_bio: Bio tekst
 * - user_image: Profil billede URL
 * - city: By/lokation
 * - user_type: musician / service-provider
 * - genres: Array af musik genres
 * - spotify_url: Link til Spotify
 * 
 * DATABASE TABEL: profiles
 * Oprettes automatisk via database trigger når ny user signup
 * Primær nøgle er user's auth id (UUID)
 * 
 * ENDPOINTS:
 * GET /api/profiles - Liste alle profiler
 * GET /api/profiles/search?q=navn - Søg efter displayname
 * GET /api/profiles/me - Din egen profil (kræver auth)
 * GET /api/profiles/:userId - Specifik profil
 * PUT /api/profiles/:userId - Opdater profil
 * 
 * SEARCH FUNCTIONALITY:
 * Query param: ?q=searchTerm
 * - Case-insensitive ILIKE search
 * - Kun søg i displayname felt
 * - Limit 20 results
 * - Returnerer basic info (ikke alt)
 * 
 * /ME ENDPOINT:
 * Special route for current user:
 * - Kræver authentication
 * - Returnerer egen profil baseret på JWT token
 * - VIGTIGT: Defineres FØR /:userId route (ellers "me" tolkes som UUID)
 * 
 * FILE UPLOAD:
 * PUT endpoint bruger Multer for profile image:
 * - user_image felt
 * - Upload til Supabase Storage
 * - multipart/form-data
 * 
 * AUTHORIZATION:
 * - Læsning: optionalAuth (alle kan se)
 * - Opdatering: authenticate + kun egen profil
 * 
 * ERROR HANDLING:
 * - PGRST116: Profile not found (404)
 * - Authentication errors: 401
 * - Validation errors: 400
 * - Server errors: 500
 * 
 * LAVET AF: Omar Gaal & Jimmi Larsen
 */

import express from "express";
import { supabase } from "../supabaseClient.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// GET /api/profiles - Hent alle profiler
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ profiles: data });
  } catch (error) {
    console.error("Get profiles error:", error);
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
});

// Search profiles by displayname only
router.get("/search", optionalAuth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({ profiles: [] });
    }

    const searchTerm = `%${q.trim()}%`;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("id, displayname, user_image, user_bio, city, user_type")
      .ilike("displayname", searchTerm)
      .order("displayname", { ascending: true })
      .limit(20);

    if (error) throw error;

    res.json({ profiles: data || [] });
  } catch (error) {
    console.error("Search profiles error:", error);
    res.status(500).json({ error: "Failed to search profiles" });
  }
});

// Get profile by user ID
router.get("/:userId", optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Profile not found" });
      }
      throw error;
    }

    res.json({ profile: data });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Håndter /me separat så 'me' ikke forsøges tolket som UUID
router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Get profile (me) error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ profile: data });
  } catch (err) {
    console.error("Get profile (me) exception:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Create or update profile
router.put("/", authenticate, upload.single("user_image"), async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      displayname,
      username,
      full_name,
      user_bio,
      user_desc,
      user_interest,
      user_genre,
      user_theme,
      user_social,
      user_artist,
      user_music,
      user_image,
      country_code,
      birth_date,
      city,
      interests,
      user_phone,
      password_hash,
      user_type,
      email,
      spotify_url,
    } = req.body;

    let imageUrl = user_image; // Default to the provided URL

    // Handle file upload if present
    if (req.file) {
      const bucket = process.env.SUPABASE_BUCKET || "post-image";
      const filename = `profiles/${userId}/${Date.now()}_${
        req.file.originalname
      }`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) {
        console.error("File upload error:", uploadError);
        console.error("Bucket:", bucket);
        console.error("Filename:", filename);
        console.error("File size:", req.file.size);
        console.error("Mimetype:", req.file.mimetype);
        return res
          .status(500)
          .json({ error: `Failed to upload image: ${uploadError.message}` });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filename);

      imageUrl = urlData.publicUrl;
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    const profileData = {
      id: userId,
      displayname,
      username,
      full_name,
      user_bio,
      user_desc,
      user_interest,
      user_genre,
      user_theme,
      user_social,
      user_artist,
      user_music,
      user_image: imageUrl,
      country_code,
      birth_date,
      city,
      interests,
      user_phone,
      password_hash,
      user_type,
      email,
      spotify_url,
      updated_at: new Date().toISOString(),
    };

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;

      res.json({ message: "Profile updated successfully", profile: data });
    } else {
      // Create new profile
      profileData.created_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("profiles")
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;

      res
        .status(201)
        .json({ message: "Profile created successfully", profile: data });
    }
  } catch (error) {
    console.error("Create/update profile error:", error);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

// Delete profile
router.delete("/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Only allow users to delete their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { error } = await supabase.from("profiles").delete().eq("id", userId);

    if (error) throw error;

    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Delete profile error:", error);
    res.status(500).json({ error: "Failed to delete profile" });
  }
});

// Upload profile image
router.post("/:userId/upload-image", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { imageUrl } = req.body;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ user_image: imageUrl, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Profile image updated successfully", profile: data });
  } catch (error) {
    console.error("Upload image error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
