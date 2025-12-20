import express from "express";
import { supabase } from "../supabaseClient.js";
import { authenticate } from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
        )
      );
    }
  },
});

// Upload image to Supabase Storage
router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const userId = req.user.id;
      const file = req.file;
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const bucket = req.body.bucket || "images"; // Default bucket

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: "Failed to upload file" });
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName);

      res.json({
        message: "File uploaded successfully",
        url: publicUrl,
        path: data.path,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  }
);

// Delete image from Supabase Storage
router.delete("/delete", authenticate, async (req, res) => {
  try {
    const { path, bucket = "images" } = req.body;

    if (!path) {
      return res.status(400).json({ error: "File path is required" });
    }

    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ error: "Failed to delete file" });
    }

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// List files in user's folder
router.get("/list", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const bucket = req.query.bucket || "images";

    const { data, error } = await supabase.storage.from(bucket).list(userId);

    if (error) {
      console.error("List files error:", error);
      return res.status(500).json({ error: "Failed to list files" });
    }

    res.json({ files: data });
  } catch (error) {
    console.error("List files error:", error);
    res.status(500).json({ error: "Failed to list files" });
  }
});

export default router;
