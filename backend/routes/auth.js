import express from "express";
import { supabase } from "../supabaseClient.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Sign up
router.post("/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    console.log("🔵 Attempting signup for:", email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split("@")[0],
        },
      },
    });

    if (error) {
      console.error("🔴 Supabase signup error:", error);
      return res.status(400).json({
        error: error.message,
        details: error.details || "No additional details",
        hint: error.hint || "No hint provided",
      });
    }

    console.log("✅ User created successfully:", data.user?.id);

    res.status(201).json({
      message: "User created successfully",
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error("🔴 Signup catch error:", error);
    res.status(500).json({
      error: "Failed to create user",
      message: error.message,
    });
  }
});

// Sign in
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      message: "Logged in successfully",
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Sign out
router.post("/logout", authenticate, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
});

// Get current user
router.get("/me", authenticate, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Refresh session
router.post("/refresh", async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      message: "Session refreshed successfully",
      session: data.session,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ error: "Failed to refresh session" });
  }
});

export default router;
