/**
 * AuthContext.jsx - Global Authentication State
 * ==============================================
 * FORMÅL: Centraliseret håndtering af bruger login state i hele appen
 * 
 * HVAD ER REACT CONTEXT?
 * Context API er Reacts løsning til at dele state mellem komponenter
 * uden at skulle "prop drill" (sende props gennem mange niveauer)
 * 
 * AUTHENTICATION FLOW:
 * 1. App starter → AuthProvider loader session fra Supabase
 * 2. Hvis session findes → user og session state sættes
 * 3. Ved login/logout → state opdateres automatisk
 * 4. Alle komponenter kan læse auth state via useAuth() hook
 * 
 * STATE MANAGEMENT:
 * - session: Supabase session objekt (inkl. access_token, refresh_token)
 * - user: Bruger objekt (id, email, metadata)
 * - initializing: Boolean der viser om vi stadig loader session
 * - authError: Sidste fejlbesked fra auth operationer
 * 
 * REAL-TIME UPDATES:
 * Supabase's onAuthStateChange lytter efter:
 * - SIGNED_IN: Når bruger logger ind
 * - SIGNED_OUT: Når bruger logger ud
 * - TOKEN_REFRESHED: Når access token fornyes automatisk
 * - USER_UPDATED: Når bruger profil opdateres
 * 
 * EKSAMENSSPØRGSMÅL:
 * Q: "Hvorfor bruger I Context i stedet for localStorage?"
 * A: "Context giver reactive state - komponenter re-renderer automatisk
 *     når auth state ændres. LocalStorage kræver manual polling.
 *     Plus Context integrerer med Supabase realtime listeners."
 * 
 * Q: "Hvad er forskellen på session og user?"
 * A: "Session indeholder tokens og metadata om login sessionen.
 *     User indeholder bruger specifik info (id, email, osv).
 *     Session bruges til API kald, user bruges til UI visning."
 */

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Opret Context objekt
const AuthContext = createContext(null);

/**
 * useAuth Hook
 * ============
 * Custom hook til at få adgang til auth context i komponenter
 * 
 * ANVENDELSE:
 * const { user, session, signIn, signOut } = useAuth();
 * 
 * ERROR HANDLING:
 * Thrower fejl hvis brugt udenfor AuthProvider
 * Dette forhindrer bugs fra manglende context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * AuthProvider Component
 * ======================
 * Wrapper component der gør auth state tilgængelig for children
 * 
 * INITIALIZATION FLOW:
 * 1. Component mounter → useEffect kører
 * 2. Kald getSession() for at hente eksisterende session
 * 3. Hvis session findes, sæt state
 * 4. Setup listener for fremtidige auth ændringer
 * 5. Når data er klar, sæt initializing = false
 * 
 * MOUNTED FLAG PATTERN:
 * let mounted = true bruges til at forhindre state updates
 * efter component unmount (forhindrer memory leaks)
 * 
 * CLEANUP:
 * return () => {} i useEffect kører ved unmount
 * Vigtigt at unsubscribe listeners for at frigøre memory
 */
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

  /**
   * signUp Function
   * ===============
   * Opretter ny bruger i Supabase Auth
   * 
   * PARAMETRE:
   * - email: Brugerens email (bruges også som login)
   * - password: Brugerens password (min. 6 tegn i Supabase standard)
   * - username: Brugernavn gemt i user metadata
   * 
   * FLOW:
   * 1. Kald Supabase signUp API
   * 2. Hvis success: Opdater lokal state med session og user
   * 3. Hvis error: Gem fejlbesked i authError state og throw error
   * 
   * OPTIONS OBJECT:
   * options.data bruges til at gemme ekstra bruger metadata
   * Dette er tilgængeligt via user.user_metadata senere
   * 
   * EMAIL CONFIRMATION:
   * Supabase kan sættes op til at kræve email bekræftelse
   * Hvis enabled, returneres user men session er null indtil bekræftet
   */
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

  /**
   * signIn Function
   * ===============
   * Logger bruger ind med email og password
   * 
   * FLOW:
   * 1. Kald Supabase signInWithPassword API
   * 2. Supabase validerer credentials i databasen
   * 3. Hvis valid: Returner session med JWT tokens
   * 4. Opdater lokal state med session og user
   * 5. onAuthStateChange listener vil også trigger og opdatere state
   * 
   * JWT TOKENS:
   * Session indeholder:
   * - access_token: Kort-livet token (1 time) brugt i API kald
   * - refresh_token: Lang-livet token til at forny access_token
   * 
   * ERROR CASES:
   * - "Invalid login credentials": Forkert email eller password
   * - "Email not confirmed": Bruger har ikke bekræftet email
   * - "Too many requests": Rate limiting aktiveret
   */
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
