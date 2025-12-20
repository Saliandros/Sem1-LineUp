import express from "express";
import { supabase } from "../supabaseClient.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get messages by thread ID
router.get("/thread/:threadId", authenticate, async (req, res) => {
  try {
    const { threadId } = req.params;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.json({ messages: data });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Get message by ID
router.get("/:messageId", authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;

    const { data, error } = await supabase
      .from("messages")
      .select("*, profiles!messages_thread_id_fkey(id, username, user_image)")
      .eq("id", messageId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Message not found" });
      }
      throw error;
    }

    res.json({ message: data });
  } catch (error) {
    console.error("Get message error:", error);
    res.status(500).json({ error: "Failed to fetch message" });
  }
});

// Create message
router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { thread_id, message_content } = req.body;

    if (!thread_id || !message_content) {
      return res
        .status(400)
        .json({ error: "thread_id and message_content are required" });
    }

    // Verify user is part of the thread
    const { data: thread } = await supabase
      .from("threads")
      .select("user_id, user_id_1")
      .eq("thread_id", thread_id)
      .single();

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    if (thread.user_id !== userId && thread.user_id_1 !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized - not part of this thread" });
    }

    const messageData = {
      thread_id,
      message_content,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("messages")
      .insert(messageData)
      .select("*")
      .single();

    if (error) {
      console.error("🔴 Create message error:", error);
      return res.status(500).json({
        error: "Failed to send message",
        details: error.message,
      });
    }

    res
      .status(201)
      .json({ message: "Message sent successfully", messageData: data });
  } catch (error) {
    console.error("Create message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Update message
router.put("/:messageId", authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message_content } = req.body;

    if (!message_content) {
      return res.status(400).json({ error: "message_content is required" });
    }

    // Note: Add ownership check here if needed
    // For now, any authenticated user can update

    const { data, error } = await supabase
      .from("messages")
      .update({ message_content })
      .eq("id", messageId)
      .select("*")
      .single();

    if (error) throw error;

    res.json({ message: "Message updated successfully", messageData: data });
  } catch (error) {
    console.error("Update message error:", error);
    res.status(500).json({ error: "Failed to update message" });
  }
});

// Delete message
router.delete("/:messageId", authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;

    // Note: Add ownership check here if needed

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) throw error;

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

export default router;
