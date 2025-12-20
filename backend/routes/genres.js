import express from "express";
import { supabase } from "../supabaseClient.js";
import { optionalAuth, authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get all genres
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("genres")
      .select("*")
      .order("genre_name", { ascending: true });

    if (error) throw error;

    res.json({ genres: data });
  } catch (error) {
    console.error("Get genres error:", error);
    res.status(500).json({ error: "Failed to fetch genres" });
  }
});

// Create genre (admin only - you can add admin middleware later)
router.post("/", authenticate, async (req, res) => {
  try {
    const { genre_name } = req.body;

    if (!genre_name) {
      return res.status(400).json({ error: "Genre name is required" });
    }

    const { data, error } = await supabase
      .from("genres")
      .insert({ genre_name })
      .select()
      .single();

    if (error) throw error;

    res
      .status(201)
      .json({ message: "Genre created successfully", genre: data });
  } catch (error) {
    console.error("Create genre error:", error);
    res.status(500).json({ error: "Failed to create genre" });
  }
});

// Delete genre
router.delete("/:genreName", authenticate, async (req, res) => {
  try {
    const { genreName } = req.params;

    const { error } = await supabase
      .from("genres")
      .delete()
      .eq("genre_name", genreName);

    if (error) throw error;

    res.json({ message: "Genre deleted successfully" });
  } catch (error) {
    console.error("Delete genre error:", error);
    res.status(500).json({ error: "Failed to delete genre" });
  }
});

export default router;
