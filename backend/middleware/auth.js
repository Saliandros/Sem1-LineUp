// Description: Middleware til autentifikation ved brug af Supabase

import { supabase } from "../supabaseClient.js";

// authenticate gør at request skal have et valid token
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Tjek om Authorization header findes og starter med "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Udtræk token delen (efter "Bearer ")
    const token = authHeader.replace("Bearer ", "");

    // Kald Supabase Auth API til at validere token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    // Hvis der er fejl eller ingen bruger, returner 401
    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

// optionalAuth tillader requests uden token
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Tjek om Authorization header findes og starter med "Bearer "
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      req.user = user || null;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};
