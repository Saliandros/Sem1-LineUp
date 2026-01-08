import express from "express";
import { supabase } from "../supabaseClient.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all posts
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("post_note")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("🔴 Supabase error fetching posts:", error);
      return res.status(500).json({
        error: "Failed to fetch posts",
        details: error.message,
        hint: error.hint,
      });
    }

    // Fetch user profiles separately if needed
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((post) => post.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, displayname, user_image")
        .in("id", userIds);

      // Attach profile to each post
      const postsWithProfiles = data.map((post) => ({
        ...post,
        profile: profiles?.find((p) => p.id === post.user_id) || null,
      }));

      return res.json({ posts: postsWithProfiles });
    }

    res.json({ posts: data || [] });
  } catch (error) {
    console.error("🔴 Get posts catch error:", error);
    res.status(500).json({
      error: "Failed to fetch posts",
      message: error.message,
    });
  }
});

// Get post by ID
router.get("/:postId", optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;

    const { data, error } = await supabase
      .from("post_note")
      .select(
        `
        *,
        profiles!post_note_user_id_fkey(id, displayname, user_image),
        tags_post_join(tag_id, tags(tag_name))
      `
      )
      .eq("post_id", postId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Post not found" });
      }
      throw error;
    }

    res.json({ post: data });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// Get posts by user
router.get("/user/:userId", optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("post_note")
      .select(
        `
        *,
        profiles!post_note_user_id_fkey(id, displayname, user_image),
        tags_post_join(tag_id, tags(tag_name))
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ posts: data });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
});

// Create post (multipart/form-data supported)
// Accept files sent as either "post_image" or "media" (or both)
router.post(
  "/",
  authenticate,
  upload.fields([
    { name: "post_image", maxCount: 1 },
    { name: "media", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      let { post_title, post_description, post_image, post_tags, tags } =
        req.body;

      post_title = post_title?.trim();
      if (!post_title) {
        return res.status(400).json({ error: "Title is required" });
      }

      // Hvis post_tags sendes som stringified JSON fra klienten
      // support: post_tags as JSON-string OR tags as comma-separated string OR post_tags already an array
      const parsedTags = post_tags
        ? typeof post_tags === "string"
          ? JSON.parse(post_tags)
          : post_tags
        : [];
      // hvis parsedTags er tomt, fallback til "tags" felt (fx "Recording,Guitar")
      const finalTags =
        parsedTags.length > 0
          ? parsedTags
          : tags && typeof tags === "string"
          ? tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [];

      // find uploaded file uanset feltnavn
      const uploadedFile =
        (req.files && (req.files.post_image?.[0] || req.files.media?.[0])) ||
        req.file ||
        null;

      console.log("📤 Incoming files:", {
        files: Object.keys(req.files || {}).reduce((acc, k) => {
          acc[k] = (req.files[k] || []).map((f) => ({
            originalname: f.originalname,
            mimetype: f.mimetype,
            size: f.size,
          }));
          return acc;
        }, {}),
      });

      if (!uploadedFile) {
        console.log("No uploaded file found in request.");
      } else {
        console.log("Uploaded file meta:", {
          originalname: uploadedFile.originalname,
          mimetype: uploadedFile.mimetype,
          size: uploadedFile.size,
        });
      }

      if (uploadedFile) {
        const bucket = process.env.SUPABASE_BUCKET || "post-images";
        const filename = `${userId}/${Date.now()}_${uploadedFile.originalname}`;

        try {
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filename, uploadedFile.buffer, {
              contentType: uploadedFile.mimetype,
              // upsert: false,
            });

          if (uploadError) {
            console.error("🔴 Supabase storage upload error:", uploadError);
            // return detailed error to client for debugging (fjern i produktion)
            return res.status(500).json({
              error: "Failed to upload image",
              details: uploadError,
            });
          }
        } catch (err) {
          console.error("🔴 Exception during Supabase upload:", err);
          return res.status(500).json({
            error: "Failed to upload image",
            message: err.message,
          });
        }
        const { data: urlData } = await supabase.storage
          .from(bucket)
          .getPublicUrl(filename);

        post_image = urlData?.publicUrl || null;
      }

      const postData = {
        user_id: userId,
        post_title,
        post_description: post_description || null,
        post_image: post_image || null,
        post_tags: finalTags,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("post_note")
        .insert(postData)
        .select("*")
        .single();

      if (error) {
        console.error("🔴 Create post error:", error);
        return res.status(500).json({
          error: "Failed to create post",
          details: error.message,
        });
      }

      res
        .status(201)
        .json({ message: "Post created successfully", post: data });
    } catch (error) {
      console.error("🔴 Create post catch error:", error);
      res.status(500).json({
        error: "Failed to create post",
        message: error.message,
      });
    }
  }
);

// Update post
router.put("/:postId", authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const { post_title, post_description, post_image, post_tags } = req.body;

    // Check ownership
    const { data: post } = await supabase
      .from("post_note")
      .select("user_id")
      .eq("post_id", postId)
      .single();

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updateData = {
      post_title,
      post_description,
      post_image,
      post_tags,
    };

    const { error: updateError } = await supabase
      .from("post_note")
      .update(updateData)
      .eq("post_id", postId);

    if (updateError) throw updateError;

    const { data: updatedPost, error: fetchUpdatedError } = await supabase
      .from("post_note")
      .select("*")
      .eq("post_id", postId)
      .single();

    if (fetchUpdatedError) throw fetchUpdatedError;

    res.json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// Delete post
router.delete("/:postId", authenticate, async (req, res) => {
  try {
    const { postId } = req.params;

    // Check ownership
    const { data: post } = await supabase
      .from("post_note")
      .select("user_id")
      .eq("post_id", postId)
      .single();

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { error } = await supabase
      .from("post_note")
      .delete()
      .eq("post_id", postId);

    if (error) throw error;

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
