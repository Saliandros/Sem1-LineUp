/**
 * supabaseClient.js - Supabase Client Instance
 * =============================================
 * FORMÅL: Centraliseret Supabase client til brug i hele frontend
 * 
 * HVAD ER SUPABASE?
 * Supabase er en open-source Firebase alternativ
 * Giver:
 * - PostgreSQL database hosting
 * - Authentication (JWT-baseret)
 * - File storage
 * - Real-time subscriptions (websockets)
 * - Auto-generated REST API
 * 
 * CONFIGURATION:
 * Kræver to environment variables:
 * - VITE_SUPABASE_URL: Din Supabase projekt URL
 * - VITE_SUPABASE_ANON_KEY: Public anon key (client-safe)
 * 
 * OPTIONS:
 * - persistSession: Gem session i localStorage (overlever browser restart)
 * - autoRefreshToken: Forny access token automatisk før den udløber
 * - detectSessionInUrl: Tjek URL for session efter email bekræftelse
 * 
 * SSR COMPATIBILITY:
 * Vi tjekker typeof window !== 'undefined' fordi localStorage
 * ikke eksisterer under server-side rendering
 * 
 * SINGLETON PATTERN:
 * Vi eksporterer én shared instance af createClient()
 * Dette betyder alle dele af appen bruger samme forbindelse
 * 
 * EKSAMENSSPØRGSMÅL:
 * Q: "Er det sikkert at bruge anon key i frontend?"
 * A: "Ja, anon key er designet til client-side brug. Den giver kun
 *     adgang til data tilladt af Row Level Security (RLS) policies.
 *     Service role key er den hemmelige, den bruges kun i backend."
 */

import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

const options = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
};

// Only set storage in browser environment
if (typeof window !== 'undefined') {
  options.auth.storage = window.localStorage;
}

export const supabase = createClient(URL, KEY, options);
