/**
 * connections.js - Friend Connections API
 * ========================================
 * FORMÅL: Håndter venskabs-forbindelser mellem brugere
 * 
 * HVAD ER EN CONNECTION?
 * En forbindelse mellem to brugere (friend request system):
 * - Status: 'pending' (afventer accept)
 * - Status: 'accepted' (begge er venner)
 * - Status: 'blocked' (blokeret)
 * 
 * DATABASE TABEL: connections
 * Felter:
 * - connection_id (UUID, primary key)
 * - user_id_1 (UUID) - Altid den MINDRE UUID
 * - user_id_2 (UUID) - Altid den STØRRE UUID
 * - requester_id (UUID) - Hvem der sendte anmodningen
 * - status (text) - pending/accepted/blocked
 * - created_at (timestamp)
 * 
 * ORDERED PAIR CONSTRAINT:
 * VIGTIGT: user_id_1 skal altid være < user_id_2
 * Dette sikrer én unik række per relation:
 * - Uden: Kunne have både (A,B) og (B,A)
 * - Med: Kun (A,B) hvis A < B
 * Se ordered_users constraint i database
 * 
 * ENDPOINTS:
 * GET /api/connections - Mine accepted connections
 * GET /api/connections/user/:userId - Alle connections for user
 * GET /api/connections/pending - Mine pending requests
 * POST /api/connections - Send friend request
 * PUT /api/connections/:id/accept - Accepter request
 * PUT /api/connections/:id/reject - Afvis request
 * DELETE /api/connections/:id - Slet connection
 * 
 * FRIEND REQUEST FLOW:
 * 1. User A sender request til User B
 *    - POST /api/connections med user_id_2 = B
 *    - Status = pending, requester_id = A
 * 2. User B ser pending request
 *    - GET /api/connections/pending
 * 3. User B accepterer eller afviser
 *    - PUT /api/connections/:id/accept → status = accepted
 *    - PUT /api/connections/:id/reject → DELETE row
 * 4. Begge kan nu chatte
 * 
 * AUTHORIZATION:
 * - GET: authenticate (kun dine egne)
 * - POST: authenticate
 * - PUT: authenticate + må kun accepte requests sendt TIL dig
 * - DELETE: authenticate + må kun slette dine egne
 * 
 * LAVET AF: Omar Gaal
 */

import express from "express";
import { supabase } from "../supabaseClient.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import crypto from "crypto";

const router = express.Router();

// GET /api/connections - Hent alle ACCEPTED connections for current user
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("connections")
      .select("*")
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .eq("status", "accepted")
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
      connection_id: crypto.randomUUID(),
      user_id_1: userA,
      user_id_2: userB,
      requester_id: userId,
      status: 'pending',
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

// Accept a connection request
router.patch("/:connectionId/accept", authenticate, async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    // Check if user is the recipient of this connection request
    const { data: connection } = await supabase
      .from("connections")
      .select("*")
      .eq("connection_id", connectionId)
      .single();

    if (!connection) {
      return res.status(404).json({ error: "Connection request not found" });
    }

    // Only the recipient (not the requester) can accept
    if (connection.requester_id === userId) {
      return res.status(403).json({ error: "You cannot accept your own request" });
    }

    // Check that current user is part of this connection
    if (connection.user_id_1 !== userId && connection.user_id_2 !== userId) {
      return res.status(403).json({ error: "You can only accept requests sent to you" });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ error: "Connection request is not pending" });
    }

    const { data, error } = await supabase
      .from("connections")
      .update({ status: 'accepted' })
      .eq("connection_id", connectionId)
      .select("*")
      .single();

    if (error) {
      console.error("🔴 Accept connection error:", error);
      return res.status(500).json({
        error: "Failed to accept connection",
        details: error.message,
      });
    }

    res.json({
      message: "Connection request accepted",
      connection: data,
    });
  } catch (error) {
    console.error("🔴 Accept connection catch error:", error);
    res.status(500).json({
      error: "Failed to accept connection",
      message: error.message,
    });
  }
});

// Reject a connection request
router.patch("/:connectionId/reject", authenticate, async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    // Check if user is the recipient of this connection request
    const { data: connection } = await supabase
      .from("connections")
      .select("*")
      .eq("connection_id", connectionId)
      .single();

    if (!connection) {
      return res.status(404).json({ error: "Connection request not found" });
    }

    // Only the recipient (not the requester) can reject
    if (connection.requester_id === userId) {
      return res.status(403).json({ error: "You cannot reject your own request" });
    }

    // Check that current user is part of this connection
    if (connection.user_id_1 !== userId && connection.user_id_2 !== userId) {
      return res.status(403).json({ error: "You can only reject requests sent to you" });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ error: "Connection request is not pending" });
    }

    // Delete rejected requests instead of keeping them
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("connection_id", connectionId);

    if (error) {
      console.error("🔴 Reject connection error:", error);
      return res.status(500).json({
        error: "Failed to reject connection",
        details: error.message,
      });
    }

    res.json({
      message: "Connection request rejected",
    });
  } catch (error) {
    console.error("🔴 Reject connection catch error:", error);
    res.status(500).json({
      error: "Failed to reject connection",
      message: error.message,
    });
  }
});

// Get pending connection requests (received by current user)
router.get("/requests/pending", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get requests where current user is part of the connection but NOT the requester
    const { data: connections, error: connectionsError } = await supabase
      .from("connections")
      .select("*")
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .neq("requester_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (connectionsError) {
      console.error("🔴 Get pending requests error:", connectionsError);
      return res.status(500).json({
        error: "Failed to fetch pending requests",
        details: connectionsError.message,
      });
    }

    if (!connections || connections.length === 0) {
      return res.json({ requests: [] });
    }

    // Get requester profiles
    const requesterIds = connections.map(conn => conn.requester_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, displayname, user_image, user_bio, city")
      .in("id", requesterIds);

    if (profilesError) {
      console.error("🔴 Get requester profiles error:", profilesError);
      return res.status(500).json({
        error: "Failed to fetch requester profiles",
        details: profilesError.message,
      });
    }

    // Merge profiles into connections
    const requestsWithProfiles = connections.map(conn => ({
      ...conn,
      requester: profiles.filter(p => p.id === conn.requester_id)
    }));

    res.json({ requests: requestsWithProfiles });
  } catch (error) {
    console.error("🔴 Get pending requests catch error:", error);
    res.status(500).json({
      error: "Failed to fetch pending requests",
      message: error.message,
    });
  }
});

export default router;
