import express from "express";
import { supabase } from "../supabaseClient.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Get all connections for a user
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("connections")
      .select("*")
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("🔴 Get connections error:", error);
      return res.status(500).json({
        error: "Failed to fetch connections",
        details: error.message,
      });
    }

    res.json({ connections: data });
  } catch (error) {
    console.error("🔴 Get connections catch error:", error);
    res.status(500).json({
      error: "Failed to fetch connections",
      message: error.message,
    });
  }
});

// Get connections for a specific user
router.get("/user/:userId", optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("connections")
      .select("*")
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ connections: data });
  } catch (error) {
    console.error("Get user connections error:", error);
    res.status(500).json({ error: "Failed to fetch user connections" });
  }
});

// Create a connection (connect with another user)
router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { user_id_2 } = req.body;

    if (!user_id_2) {
      return res.status(400).json({ error: "user_id_2 is required" });
    }

    if (userId === user_id_2) {
      return res.status(400).json({ error: "Cannot connect with yourself" });
    }

    // Order the pair to satisfy ordered_users constraint (user_id_1 < user_id_2)
    const userA = userId < user_id_2 ? userId : user_id_2;
    const userB = userId < user_id_2 ? user_id_2 : userId;

    // Check if connection already exists (ordered pair)
    const { data: existing } = await supabase
      .from("connections")
      .select("*")
      .eq("user_id_1", userA)
      .eq("user_id_2", userB)
      .single();

    if (existing) {
      return res.status(400).json({ error: "Connection already exists" });
    }

    const connectionData = {
      user_id_1: userA,
      user_id_2: userB,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("connections")
      .insert(connectionData)
      .select("*")
      .single();

    if (error) {
      console.error("🔴 Create connection error:", error);
      return res.status(500).json({
        error: "Failed to create connection",
        details: error.message,
      });
    }

    res.status(201).json({
      message: "Connection created successfully",
      connection: data,
    });
  } catch (error) {
    console.error("🔴 Create connection catch error:", error);
    res.status(500).json({
      error: "Failed to create connection",
      message: error.message,
    });
  }
});

// Delete a connection
router.delete("/:connectionId", authenticate, async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    // Check if user is part of this connection
    const { data: connection } = await supabase
      .from("connections")
      .select("user_id_1, user_id_2")
      .eq("connection_id", connectionId)
      .single();

    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    if (connection.user_id_1 !== userId && connection.user_id_2 !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("connection_id", connectionId);

    if (error) throw error;

    res.json({ message: "Connection deleted successfully" });
  } catch (error) {
    console.error("Delete connection error:", error);
    res.status(500).json({ error: "Failed to delete connection" });
  }
});

export default router;
