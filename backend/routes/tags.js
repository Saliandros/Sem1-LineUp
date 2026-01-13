// Route handler for tags
// lavet af Mikkel Ruby

import express from "express";
import { supabase } from "../supabaseClient.js";
import { optionalAuth, authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get all tags
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("tag_name", { ascending: true });

    if (error) throw error;

    res.json({ tags: data });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

// Get posts by tag
router.get("/:tagName/posts", optionalAuth, async (req, res) => {
  try {
    const { tagName } = req.params;

    // First get the tag
    const { data: tag, error: tagError } = await supabase
      .from("tags")
      .select("tag_name")
      .eq("tag_name", tagName)
      .single();

    if (tagError || !tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    // Get posts with this tag through the junction table
    const { data, error } = await supabase
      .from("tags_post_join")
      .select(
        `
        post_id,
        post_note(
          *,
          profiles!post_note_user_id_fkey(id, username, user_image)
        )
      `
      )
      .eq("tag_id", tagName);

    if (error) throw error;

    const posts = data.map((item) => item.post_note);

    res.json({ tag: tagName, posts });
  } catch (error) {
    console.error("Get posts by tag error:", error);
    res.status(500).json({ error: "Failed to fetch posts by tag" });
  }
});

// Create tag
router.post("/", authenticate, async (req, res) => {
  try {
    const { tag_name } = req.body;

    if (!tag_name) {
      return res.status(400).json({ error: "Tag name is required" });
    }

    const { data, error } = await supabase
      .from("tags")
      .insert({ tag_name })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Tag created successfully", tag: data });
  } catch (error) {
    console.error("Create tag error:", error);
    res.status(500).json({ error: "Failed to create tag" });
  }
});

// Delete tag
router.delete("/:tagName", authenticate, async (req, res) => {
  try {
    const { tagName } = req.params;

    const { error } = await supabase
      .from("tags")
      .delete()
      .eq("tag_name", tagName);

    if (error) throw error;

    res.json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Delete tag error:", error);
    res.status(500).json({ error: "Failed to delete tag" });
  }
});

export default router;
