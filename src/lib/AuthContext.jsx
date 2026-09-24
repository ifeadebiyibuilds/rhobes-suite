import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still checking
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) { setProfile(null); return; }
    setLoadingProfile(true);
    supabase.from("profiles").select("*").eq("id", session.user.id).single()
      .then(({ data, error }) => {
        if (error) {
          // Logged in via Supabase Auth but no matching profiles row yet —
          // happens for the very first owner account before the seed insert
          // at the bottom of schema.sql has been run.
          setProfile(null);
        } else {
          setProfile(data);
        }
        setLoadingProfile(false);
      });
  }, [session]);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signOut = () => supabase.auth.signOut();

  return (
    <AuthCtx.Provider value={{ session, profile, loadingProfile, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
