/**
 * server.js - Backend Server Entry Point
 * =======================================
 * FORMÅL: Hovedfil der starter Express serveren og registrerer alle routes
 * 
 * HVAD ER EN BACKEND SERVER?
 * En Node.js applikation der lytter efter HTTP requests fra frontend
 * og svarer med JSON data. Fungerer som mellemled mellem frontend og database.
 * 
 * HVORFOR BRUGER VI EN BACKEND?
 * 1. SIKKERHED: Validering af bruger tokens før database adgang
 * 2. BUSINESS LOGIC: Komplekse operationer der ikke skal være i frontend
 * 3. DATA TRANSFORMATION: Formatér data før det sendes til frontend
 * 4. API ABSTRACTION: Ét endpoint kan kalde flere database queries
 * 
 * TEKNOLOGI STACK:
 * - Express.js: Web framework til Node.js
 * - CORS: Tillader frontend (localhost:5173) at kalde backend (localhost:3000)
 * - Supabase: PostgreSQL database med authentication
 * 
 * PORT: 3000 (kan ændres via environment variable)
 * 
 * EKSAMENSSPØRGSMÅL:
 * Q: "Hvorfor har I både en backend og Supabase?"
 * A: "Supabase bruges til auth og data storage, men backend giver os
 *     server-side validation, kompleks business logic og bedre fejlhåndtering.
 *     Nogle ting kan frontend kalde direkte til Supabase, men følsomme
 *     operationer går gennem backend først."
 */

import "dotenv/config";  // Loader environment variables fra .env fil
import express from "express";
import cors from "cors";

// Importer alle route handlers
import authRouter from "./routes/auth.js";
import profilesRouter from "./routes/profiles.js";
import threadsRouter from "./routes/threads.js";
import messagesRouter from "./routes/messages.js";
import collaborationsRouter from "./routes/collaborations.js";
import postsRouter from "./routes/posts.js";
import genresRouter from "./routes/genres.js";
import tagsRouter from "./routes/tags.js";
import uploadsRouter from "./routes/uploads.js";
import connectionsRouter from "./routes/connections.js";

const app = express();

/**
 * MIDDLEWARE SETUP
 * ================
 * Middleware er funktioner der kører MELLEM request og response
 * 
 * 1. CORS (Cross-Origin Resource Sharing):
 *    - Tillader frontend (http://localhost:5173) at kalde backend
 *    - Uden CORS ville browseren blokere requests pga. "Same-Origin Policy"
 *    - credentials: true tillader cookies og auth headers
 * 
 * 2. express.json():
 *    - Parser JSON request bodies automatisk
 *    - Gør at vi kan læse req.body som JavaScript objekt
 * 
 * 3. express.urlencoded():
 *    - Parser URL-encoded form data
 *    - extended: true tillader nested objects
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ROOT ROUTE - API Documentation
 * ==============================
 * GET / endpoint der viser oversigt over alle tilgængelige endpoints
 * Nyttigt for at teste om serveren kører og se API struktur
 */
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Mojah Web Consulting API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      profiles: "/api/profiles",
      threads: "/api/threads",
      messages: "/api/messages",
      collaborations: "/api/collaborations",
      posts: "/api/posts",
      genres: "/api/genres",
      tags: "/api/tags",
      uploads: "/api/uploads",
      connections: "/api/connections",
    },
  });
});

/**
 * API ROUTES REGISTRATION
 * =======================
 * Registrér alle route handlers under /api/* prefix
 * 
 * ROUTE FORKLARING:
 * app.use("/api/threads", threadsRouter) betyder:
 * - Alle requests til /api/threads/* håndteres af threadsRouter
 * - threadsRouter filen definerer sub-routes som /api/threads/:id
 * 
 * HVEM LAVEDE HVAD:
 * - /api/profiles & /api/connections: Omar Gaal
 * - /api/posts: Mikkel Ruby
 * - /api/collaborations: Anders Flæng
 * - /api/threads & /api/messages: Jimmi Larsen
 * - /api/uploads: Importeret af Mikkel Ruby
 * - /api/genres & /api/tags: Omar Gaal & Anders Flæng
 */
app.use("/api/auth", authRouter);
app.use("/api/profiles", profilesRouter);
app.use("/api/threads", threadsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/collaborations", collaborationsRouter);
app.use("/api/genres", genresRouter);
app.use("/api/posts", postsRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/connections", connectionsRouter);

/**
 * ERROR HANDLING MIDDLEWARE
 * =========================
 * Disse kommer SIDST i middleware stacken
 * 
 * 1. 404 Handler:
 *    - Fanger alle requests der ikke matcher nogen route
 *    - Returnerer 404 status med fejlbesked
 * 
 * 2. Global Error Handler:
 *    - Fanger alle fejl kastet i andre middleware/routes
 *    - 4 parametre (err, req, res, next) identificerer det som error handler
 *    - Logger fejl til console og returnerer 500 status
 * 
 * VIGTIGT: Rækkefølgen betyder noget i Express!
 * Routes først → 404 handler → Error handler
 */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

/**
 * START SERVER
 * ============
 * Lyt efter indkommende HTTP requests på den angivne port
 * 
 * process.env.PORT: Environment variable sat af hosting provider (f.eks. Render)
 * || 3000: Fallback til port 3000 hvis ingen env variable er sat
 * 
 * app.listen(): Starter serveren og kalder callback når klar
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API documentation available at http://localhost:${PORT}`);
});
