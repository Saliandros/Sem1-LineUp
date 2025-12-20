import express from "express";
import { supabase } from "../supabaseClient.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Get all threads
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("threads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ threads: data });
  } catch (error) {
    console.error("Get threads error:", error);
    res.status(500).json({ error: "Failed to fetch threads" });
  }
});

// Get thread by ID
router.get("/:threadId", optionalAuth, async (req, res) => {
  try {
    const { threadId } = req.params;

    const { data, error } = await supabase
      .from("threads")
      .select("*, profiles!threads_user_id_fkey(id, username, user_image)")
      .eq("thread_id", threadId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Thread not found" });
      }
      throw error;
    }

    res.json({ thread: data });
  } catch (error) {
    console.error("Get thread error:", error);
    res.status(500).json({ error: "Failed to fetch thread" });
  }
});

// Get threads by user
router.get("/user/:userId", optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("threads")
      .select("*, profiles!threads_user_id_fkey(id, username, user_image)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ threads: data });
  } catch (error) {
    console.error("Get user threads error:", error);
    res.status(500).json({ error: "Failed to fetch user threads" });
  }
});

// Create thread
router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { user_id_1 } = req.body;

    if (!user_id_1) {
      return res.status(400).json({ error: "user_id_1 is required" });
    }

    const threadData = {
      user_id: userId,
      user_id_1,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("threads")
      .insert(threadData)
      .select("*")
      .single();

    if (error) {
      console.error("🔴 Create thread error:", error);
      return res.status(500).json({
        error: "Failed to create thread",
        details: error.message,
      });
    }

    res
      .status(201)
      .json({ message: "Thread created successfully", thread: data });
  } catch (error) {
    console.error("Create thread error:", error);
    res.status(500).json({ error: "Failed to create thread" });
  }
});

// Delete thread
router.delete("/:threadId", authenticate, async (req, res) => {
  try {
    const { threadId } = req.params;

    // Check if user owns the thread
    const { data: thread } = await supabase
      .from("threads")
      .select("user_id")
      .eq("thread_id", threadId)
      .single();

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    if (thread.user_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { error } = await supabase
      .from("threads")
      .delete()
      .eq("thread_id", threadId);

    if (error) throw error;

    res.json({ message: "Thread deleted successfully" });
  } catch (error) {
    console.error("Delete thread error:", error);
    res.status(500).json({ error: "Failed to delete thread" });
  }
});

export default router;
