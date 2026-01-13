

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Opret Context objekt
const AuthContext = createContext(null);


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setInitializing(false);
      } catch (err) {
        console.error("Failed to initialize auth session", err);
        if (mounted) setInitializing(false);
      }
    };

    init();

    // Lyt efter auth state ændringer (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s ?? null);
      setUser(s?.user ?? null);
    });

    return () => {
      mounted = false;
      if (listener?.subscription) listener.subscription.unsubscribe();
    };
  }, []);


  const signUp = async (email, password, username) => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) throw error;

      setSession(data.session);
      setUser(data.user);
      return { session: data.session, user: data.user };
    } catch (error) {
      const message = error.message || "Failed to sign up";
      setAuthError(message);
      throw new Error(message);
    }
  };

  const signIn = async (email, password) => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSession(data.session);
      setUser(data.user);
      return { session: data.session, user: data.user };
    } catch (error) {
      const message = error.message || "Failed to sign in";
      setAuthError(message);
      throw new Error(message);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Failed to sign out", error);
    } finally {
      setSession(null);
      setUser(null);
      setAuthError(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      session,
      initializing,
      authError,
      isAuthenticated: Boolean(session?.access_token),
      signUp,
      signIn,
      signOut,
      getAuthHeaders: () =>
        session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
    }),
    [user, session, initializing, authError]
  );

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-light-gray">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full animate-spin border-t-primary-purple"></div>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
