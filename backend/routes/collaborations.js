import express from "express";
import { supabase } from "../supabaseClient.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Get all collaborations
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { genre, location } = req.query;
    let query = supabase
      .from("collab_creation")
      .select("*, profiles(id, displayname, user_image)")
      .order("created_at", { ascending: false });

    if (genre) {
      query = query.contains("collab_genres", [genre]);
    }

    if (location) {
      query = query.eq("collab_location", location);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ collaborations: data });
  } catch (error) {
    console.error("Get collaborations error:", error);
    res.status(500).json({ error: "Failed to fetch collaborations" });
  }
});

// Get collaboration by ID
router.get("/:collabId", optionalAuth, async (req, res) => {
  try {
    const { collabId } = req.params;

    const { data, error } = await supabase
      .from("collab_creation")
      .select(
        "*, profiles!collab_creation_user_id_fkey(id, displayname, user_image)"
      )
      .eq("collab_id", collabId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Collaboration not found" });
      }
      throw error;
    }

    res.json({ collaboration: data });
  } catch (error) {
    console.error("Get collaboration error:", error);
    res.status(500).json({ error: "Failed to fetch collaboration" });
  }
});

// Get collaborations by user
router.get("/user/:userId", optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("collab_creation")
      .select(
        "*, profiles!collab_creation_user_id_fkey(id, displayname, user_image)"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ collaborations: data });
  } catch (error) {
    console.error("Get user collaborations error:", error);
    res.status(500).json({ error: "Failed to fetch user collaborations" });
  }
});

// Create collaboration
router.post(
  "/",
  authenticate,
  upload.fields([
    { name: "collab_image", maxCount: 1 },
    { name: "media", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("=== BACKEND DEBUG ===");
      console.log("req.body:", req.body);
      console.log("req.files:", req.files);

      const userId = req.user?.id;

      const {
        collab_title,
        title, // Support både collab_title og title
        collab_description,
        description, // Support både collab_description og description
        collab_genres,
        genres, // Support både collab_genres og genres
        collab_location,
        address, // Support både collab_location og address
        collab_paid,
        isPaid, // Support både collab_paid og isPaid
      } = req.body;

      // Use fallback values for duplicated fields
      const finalTitle = collab_title || title;
      const finalDescription = collab_description || description;
      const finalLocation = collab_location || address;
      const finalPaid = collab_paid || isPaid;

      console.log("Extracted fields:");
      console.log("finalTitle:", finalTitle);
      console.log("finalDescription:", finalDescription);
      console.log("finalLocation:", finalLocation);

      // Parse genres - support both formats
      let parsedGenres;
      try {
        // Try collab_genres first, then fallback to genres
        const genreSource = collab_genres || genres;
        parsedGenres =
          typeof genreSource === "string"
            ? genreSource.startsWith("[")
              ? JSON.parse(genreSource)
              : genreSource.split(",")
            : genreSource;
      } catch {
        parsedGenres = [];
      }

      console.log("Parsed genres:", parsedGenres);

      // Validation
      if (
        !finalTitle ||
        !finalDescription ||
        !Array.isArray(parsedGenres) ||
        parsedGenres.length === 0 ||
        !finalLocation ||
        String(finalLocation).trim().length === 0
      ) {
        console.log("Validation failed:");
        console.log("Title valid:", !!finalTitle);
        console.log("Description valid:", !!finalDescription);
        console.log(
          "Genres valid:",
          Array.isArray(parsedGenres) && parsedGenres.length > 0
        );
        console.log(
          "Location valid:",
          !!finalLocation && String(finalLocation).trim().length > 0
        );

        return res.status(400).json({
          error:
            "Title, description, genres (non-empty) and location are required",
        });
      }

      const paid =
        finalPaid === "true" || finalPaid === "on" || finalPaid === true;

      // Handle file upload - support both field names
      let collab_image_url = null;
      const uploadedFile =
        (req.files && (req.files.collab_image?.[0] || req.files.media?.[0])) ||
        req.file ||
        null;

      if (uploadedFile) {
        console.log("Processing file upload:", uploadedFile.originalname);
        const bucket = process.env.SUPABASE_BUCKET || "post-images";
        const filename = `${userId}/${Date.now()}_${uploadedFile.originalname}`;

        try {
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filename, uploadedFile.buffer, {
              contentType: uploadedFile.mimetype,
            });

          if (uploadError) {
            console.error("🔴 Supabase storage upload error:", uploadError);
            return res.status(500).json({
              error: "Failed to upload image",
              details: uploadError,
            });
          }

          const { data: urlData } = await supabase.storage
            .from(bucket)
            .getPublicUrl(filename);

          collab_image_url = urlData?.publicUrl || null;
        } catch (err) {
          console.error("🔴 Exception during Supabase upload:", err);
          return res.status(500).json({
            error: "Failed to upload image",
            message: err.message,
          });
        }
      }

      // Create collaboration data
      const collabData = {
        user_id: userId,
        collab_title: finalTitle,
        collab_image: collab_image_url,
        collab_description: finalDescription,
        collab_genres: parsedGenres,
        collab_location: finalLocation || null,
        collab_paid: paid,
        created_at: new Date().toISOString(),
      };

      console.log("Creating collaboration with data:", collabData);

      const { data, error } = await supabase
        .from("collab_creation")
        .insert(collabData)
        .select("*")
        .single();

      if (error) {
        console.error("🔴 Create collaboration error:", error);
        return res.status(500).json({
          error: "Failed to create collaboration",
          details: error.message,
        });
      }

      console.log("✅ Collaboration created successfully:", data);

      res.status(201).json({
        message: "Collaboration created successfully",
        collaboration: data,
      });
    } catch (error) {
      console.error("Collaboration creation error:", error);
      res.status(500).json({ error: "Failed to create collaboration" });
    }
  }
);

// Update collaboration
router.put("/:collabId", authenticate, async (req, res) => {
  try {
    const { collabId } = req.params;
    const {
      collab_title,
      collab_image,
      collab_description,
      collab_genres,
      collab_location,
    } = req.body;

    // Check ownership
    const { data: collab } = await supabase
      .from("collab_creation")
      .select("user_id")
      .eq("collab_id", collabId)
      .single();

    if (!collab) {
      return res.status(404).json({ error: "Collaboration not found" });
    }

    if (collab.user_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updateData = {
      collab_title,
      collab_image,
      collab_description,
      collab_genres,
      collab_location,
    };

    const { error: updateError } = await supabase
      .from("collab_creation")
      .update(updateData)
      .eq("collab_id", collabId);

    if (updateError) throw updateError;

    // Fetch updated collab without FK join to avoid schema cache error
    const { data: updatedCollab, error: fetchError } = await supabase
      .from("collab_creation")
      .select("*")
      .eq("collab_id", collabId)
      .single();

    if (fetchError) throw fetchError;

    res.json({
      message: "Collaboration updated successfully",
      collaboration: updatedCollab,
    });
  } catch (error) {
    console.error("Update collaboration error:", error);
    res.status(500).json({ error: "Failed to update collaboration" });
  }
});

// Delete collaboration
router.delete("/:collabId", authenticate, async (req, res) => {
  try {
    const { collabId } = req.params;

    // Check ownership
    const { data: collab } = await supabase
      .from("collab_creation")
      .select("user_id")
      .eq("collab_id", collabId)
      .single();

    if (!collab) {
      return res.status(404).json({ error: "Collaboration not found" });
    }

    if (collab.user_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { error } = await supabase
      .from("collab_creation")
      .delete()
      .eq("collab_id", collabId);

    if (error) throw error;

    res.json({ message: "Collaboration deleted successfully" });
  } catch (error) {
    console.error("Delete collaboration error:", error);
    res.status(500).json({ error: "Failed to delete collaboration" });
  }
});

export default router;
