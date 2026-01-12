/**
 * threads.js - Chat Threads API Routes
 * =====================================
 * FORMÅL: Håndter alle operationer relateret til chat threads
 * 
 * HVAD ER EN THREAD?
 * En thread er en chat samtale mellem 2+ personer
 * threads tabel indeholder metadata (hvornår oprettet, af hvem, gruppe navn osv)
 * thread_participants tabel linker brugere til threads (many-to-many relation)
 * 
 * ENDPOINTS I DENNE FIL:
 * - POST /api/threads - Opret ny thread
 * - GET /api/threads/user/:userId - Hent alle threads for en bruger
 * - GET /api/threads/:threadId - Hent specifik thread med deltagere
 * - PUT /api/threads/:threadId - Opdater thread (gruppe navn/billede)
 * - DELETE /api/threads/:threadId - Slet thread
 * 
 * AUTHENTICATION:
 * Alle endpoints kræver authenticate middleware
 * req.user indeholder logged in bruger info
 * 
 * DATABASE STRUKTUR:
 * threads table:
 *   - thread_id (UUID, primary key)
 *   - created_by_user_id (UUID, foreign key til profiles)
 *   - created_at (timestamp)
 *   - group_name (text, optional)
 *   - group_image (text URL, optional)
 * 
 * thread_participants table:
 *   - thread_id (UUID, foreign key)
 *   - user_id (UUID, foreign key)
 *   - joined_at (timestamp)
 * 
 * LAVET AF: Jimmi Larsen
 */

import express from "express";
import { supabase } from "../supabaseClient.js";
import { authenticate } from "../middleware/auth.js";

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

// Create thread (1-to-1 or group)
/**
 * POST /api/threads - Opret ny thread
 * ====================================
 * FORMÅL: Opret en ny chat thread med deltagere
 * 
 * REQUEST BODY:
 * {
 *   participant_ids: [UUID, UUID, ...],  // Array af bruger IDer (ekskl. creator)
 *   group_name: String (optional)        // Kun for gruppe chats
 * }
 * 
 * FLOW:
 * 1. Validér at der er mindst én deltager udover creator
 * 2. Insert ny row i threads table med creator ID
 * 3. Insert rows i thread_participants for alle deltagere (inkl. creator)
 * 4. Return det oprettede thread objekt
 * 
 * TRANSACTION PATTERN:
 * Vi bruger ikke eksplicit transaction her, men Supabase håndterer det
 * Hvis thread_participants insert fejler, threads row bliver ikke committed
 * 
 * RESPONSE:
 * {
 *   thread: {
 *     thread_id: UUID,
 *     created_by_user_id: UUID,
 *     created_at: Timestamp,
 *     group_name: String | null,
 *     participants: [UUID, ...]
 *   }
 * }
 * 
 * ERROR CASES:
 * - 400: Mangler participant_ids
 * - 500: Database fejl
 */
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
