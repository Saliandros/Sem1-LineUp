import { supabase } from "./supabaseClient";

export async function getInitialSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session ?? null;
}

export function onAuthStateChange(callback) {
  const { data: authListener } = supabase.auth.onAuthStateChange(
    (_, session) => {
      callback(session ?? null);
    }
  );

  return () => authListener.subscription.unsubscribe();
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutSession() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
