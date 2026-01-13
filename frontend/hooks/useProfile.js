// bruges i både EditProfile og profile.jsx
// til at hente profil data fra backend

import { useEffect, useState } from "react";
import { getCurrentUserProfile, getProfileById } from "../lib/api";

/**
 * Custom hook to fetch current user's profile
 * Includes loading and error states
 */
export function useCurrentUserProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        const profile = await getCurrentUserProfile();

        if (isMounted) {
          setData(profile);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch profile:", err);
          setError(err.message || "Failed to load profile");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}

/**
 * Custom hook to fetch profile by user ID
 * @param {string} userId - The user ID to fetch profile for
 */
export function useProfileById(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        const profile = await getProfileById(userId);

        if (isMounted) {
          setData(profile);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch profile:", err);
          setError(err.message || "Failed to load profile");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return { data, loading, error };
}
