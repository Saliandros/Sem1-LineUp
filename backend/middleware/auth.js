/**
 * auth.js - Authentication Middleware
 * ====================================
 * FORMÅL: Validér bruger tokens før adgang til beskyttede endpoints
 * 
 * HVAD ER MIDDLEWARE?
 * Funktioner der kører MELLEM request og response
 * De kan:
 * 1. Modificere request/response objekter
 * 2. Stoppe request (returnere fejl)
 * 3. Kalde next() for at fortsætte til næste middleware/route
 * 
 * JWT (JSON Web Token) FORKLARING:
 * - Supabase Auth genererer JWT tokens når brugere logger ind
 * - Token sendes i Authorization header: "Bearer eyJhbGc..."
 * - Vi validerer token ved at kalde Supabase Auth API
 * - Hvis valid, tilføjer vi user objekt til req.user
 * 
 * TO TYPER MIDDLEWARE:
 * 1. authenticate: KRÆVER valid token (beskyttede routes)
 * 2. optionalAuth: Token er optional (offentlige routes med ekstra features for logged in users)
 * 
 * EKSAMENSSPØRGSMÅL:
 * Q: "Hvorfor validerer I tokens på serveren?"
 * A: "JWTs kan manipuleres på klienten. Vi kalder Supabase's getUser()
 *     der verificerer token signature og expiration server-side.
 *     Dette forhindrer at folk faker tokens og får uautoriseret adgang."
 */

import { supabase } from "../supabaseClient.js";

/**
 * authenticate Middleware
 * =======================
 * Kræver at brugeren er logged in med et valid token
 * 
 * FLOW:
 * 1. Læs Authorization header fra request
 * 2. Tjek at det starter med "Bearer " prefix
 * 3. Udtræk token delen (efter "Bearer ")
 * 4. Kald Supabase Auth API til at validere token
 * 5. Hvis valid: Tilføj user til req.user og kald next()
 * 6. Hvis invalid: Returner 401 Unauthorized fejl
 * 
 * ANVENDELSE:
 * app.get("/api/protected", authenticate, (req, res) => {
 *   // req.user er nu tilgængelig
 *   const userId = req.user.id;
 * })
 * 
 * ERROR RESPONSES:
 * - 401 "No token provided": Mangler Authorization header
 * - 401 "Invalid or expired token": Token er ugyldig eller udløbet
 * - 500 "Authentication failed": Server fejl under validering
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

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

/**
 * optionalAuth Middleware
 * =======================
 * Tillader requests uden token, men tilføjer user data hvis token findes
 * 
 * FORMÅL:
 * Nogle endpoints skal være tilgængelige for både logged in og ikke-logged in users,
 * men opføre sig forskelligt baseret på login status.
 * 
 * EKSEMPEL USE CASE:
 * Et feed endpoint der viser offentlige posts til alle,
 * men også personlige posts hvis du er logged in:
 * 
 * app.get("/api/feed", optionalAuth, (req, res) => {
 *   if (req.user) {
 *     // Vis både offentlige og personlige posts
 *   } else {
 *     // Vis kun offentlige posts
 *   }
 * })
 * 
 * FLOW:
 * 1. Tjek om Authorization header findes
 * 2. Hvis JA og valid: Sæt req.user til user objekt
 * 3. Hvis NEJ eller invalid: Sæt req.user til null
 * 4. Kald altid next() - blokér aldrig requestet
 * 
 * FORSKELLEN FRA authenticate:
 * - authenticate: Stopper request hvis ikke logged in
 * - optionalAuth: Fortsætter altid, men sætter req.user = null
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

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
