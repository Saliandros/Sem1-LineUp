import "dotenv/config";
import express from "express";
import cors from "cors";
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

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
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

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/profiles", profilesRouter); // mangler
app.use("/api/threads", threadsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/collaborations", collaborationsRouter);
app.use("/api/genres", genresRouter); // mangler
app.use("/api/posts", postsRouter);
app.use("/api/tags", tagsRouter); // mangler
app.use("/api/uploads", uploadsRouter); // mangler
app.use("/api/connections", connectionsRouter);

// 404 handler
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API documentation available at http://localhost:${PORT}`);
});
