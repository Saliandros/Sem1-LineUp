// Route handler for threads
// Lavet af Jimmi Larsen
// handterer oprettelse, hentning og sletning af chat threads

// en thread kan være en 1-til-1 chat eller en gruppechat

import express from "express";
import { supabase } from "../supabaseClient.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/threads - Hent alle threads (optional auth)
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

// Get thread by ID with participants
router.get("/:threadId", optionalAuth, async (req, res) => {
  try {
    const { threadId } = req.params;

    const { data: thread, error } = await supabase
      .from("threads")
      .select("*")
      .eq("thread_id", threadId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Thread not found" });
      }
      throw error;
    }

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from("thread_participants")
      .select("user_id, role, joined_at, profiles(id, displayname, user_image)")
      .eq("thread_id", threadId);

    if (participantsError) throw participantsError;

    res.json({ 
      thread: { 
        ...thread, 
        participants: participants || [] 
      } 
    });
  } catch (error) {
    console.error("Get thread error:", error);
    res.status(500).json({ error: "Failed to fetch thread" });
  }
});

// Get threads by user
router.get("/user/:userId", optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all threads where user is a participant
    const { data: participations, error } = await supabase
      .from("thread_participants")
      .select("thread_id, role, joined_at")
      .eq("user_id", userId);

    if (error) throw error;

    if (!participations || participations.length === 0) {
      return res.json({ threads: [] });
    }

    // Get thread details
    const threadIds = participations.map(p => p.thread_id);
    const { data: threads, error: threadsError } = await supabase
      .from("threads")
      .select("*")
      .in("thread_id", threadIds)
      .order("created_at", { ascending: false });

    if (threadsError) throw threadsError;

    res.json({ threads: threads || [] });
  } catch (error) {
    console.error("Get user threads error:", error);
    res.status(500).json({ error: "Failed to fetch user threads" });
  }
});

// Create thread
router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { participant_ids, thread_name, thread_type } = req.body;

    // participant_ids should be an array of user IDs (excluding creator)
    if (!participant_ids || !Array.isArray(participant_ids) || participant_ids.length === 0) {
      return res.status(400).json({ error: "participant_ids array is required" });
    }

    const type = thread_type || (participant_ids.length === 1 ? 'direct' : 'group');

    // Create thread
    const threadData = {
      created_by_user_id: userId,
      thread_type: type,
      thread_name: thread_name || null,
      created_at: new Date().toISOString(),
    };

    const { data: thread, error } = await supabase
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

    // Add creator as participant
    const participantsToAdd = [
      { thread_id: thread.thread_id, user_id: userId, role: 'member' },
      ...participant_ids.map(id => ({
        thread_id: thread.thread_id,
        user_id: id,
        role: 'member'
      }))
    ];

    // Insert participants
    // Insert rows in thread_participants table for all participants including creator
    const { error: participantsError } = await supabase
      .from("thread_participants")
      .insert(participantsToAdd);

    if (participantsError) {
      console.error("🔴 Add participants error:", participantsError);
      // Rollback: delete thread if participants couldn't be added
      await supabase.from("threads").delete().eq("thread_id", thread.thread_id);
      return res.status(500).json({
        error: "Failed to add participants",
        details: participantsError.message,
      });
    }

    res
      .status(201)
      .json({ message: "Thread created successfully", thread });
  } catch (error) {
    console.error("Create thread error:", error);
    res.status(500).json({ error: "Failed to create thread" });
  }
});

// Delete thread
router.delete("/:threadId", authenticate, async (req, res) => {
  try {
    const { threadId } = req.params;

    // Check if user is a participant in the thread
    const { data: participant } = await supabase
      .from("thread_participants")
      .select("user_id")
      .eq("thread_id", threadId)
      .eq("user_id", req.user.id)
      .single();

    if (!participant) {
      return res.status(403).json({ error: "You are not a participant in this thread" });
    }

    // Delete thread (CASCADE will delete messages and participants)
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
