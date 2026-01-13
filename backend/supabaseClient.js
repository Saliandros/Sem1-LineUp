// File: backend/supabaseClient.js
// Supabase Client Instance for Backend

// Purpose: Centralized Supabase client for backend use
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key)
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

export const supabase = createClient(url, key);
