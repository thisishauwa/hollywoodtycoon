import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  username: string;
  industry_clout: number;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Helper: Fetch or create profile using upsert
async function getOrCreateProfile(userId: string, email: string): Promise<Profile | null> {
  const defaultUsername = email?.split("@")[0] || "Studio";
  console.log("[Auth] getOrCreateProfile called for:", userId);

  try {
    // Try to fetch existing profile first
    console.log("[Auth] Fetching profile...");
    const { data: existing, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    console.log("[Auth] Profile fetch result:", { existing, fetchError });

    if (existing) {
      return existing;
    }

    // Profile doesn't exist - create it
    if (fetchError?.code === "PGRST116") {
      console.log("[Auth] Profile not found, creating...");
      const { data: created, error: createError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          username: defaultUsername,
          industry_clout: 30,
        })
        .select()
        .single();

      console.log("[Auth] Profile create result:", { created, createError });

      if (createError) {
        console.error("[Auth] Failed to create profile:", createError);
        return null;
      }
      return created;
    }

    console.error("[Auth] Failed to fetch profile:", fetchError);
    return null;
  } catch (err) {
    console.error("[Auth] getOrCreateProfile error:", err);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log("[Auth] initAuth starting...");

        // TEMPORARY: Clear any stale sessions to unstick the app
        // Remove this once Supabase connectivity is confirmed working
        const hasStaleSession = Object.keys(localStorage).some(k => k.startsWith('sb-'));
        if (hasStaleSession) {
          console.log("[Auth] Clearing stale localStorage session");
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-')) {
              localStorage.removeItem(key);
            }
          });
          setLoading(false);
          return; // Start fresh - user will need to sign in
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("[Auth] getSession result:", { hasSession: !!session, sessionError });

        if (!mounted) return;

        if (session?.user) {
          console.log("[Auth] User found:", session.user.id);
          setSession(session);
          setUser(session.user);

          const profile = await getOrCreateProfile(session.user.id, session.user.email || "");
          console.log("[Auth] Profile result:", profile);
          if (mounted) {
            setProfile(profile);
          }
        } else {
          console.log("[Auth] No session found");
        }
      } catch (error) {
        console.error("[Auth] Init error:", error);
      } finally {
        if (mounted) {
          console.log("[Auth] Setting loading to false");
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await getOrCreateProfile(session.user.id, session.user.email || "");
          if (mounted) {
            setProfile(profile);
          }
        } else {
          setProfile(null);
        }

        // Ensure loading is false after any auth change
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }, // Store username in user metadata
      },
    });

    if (error) return { error };

    // Create profile immediately after signup
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        username,
        industry_clout: 30,
      });

      if (profileError) {
        console.error("[Auth] Profile creation error:", profileError);
        return { error: profileError };
      }

      // Set profile in state immediately
      setProfile({
        id: data.user.id,
        username,
        industry_clout: 30,
      });
      setUser(data.user);
      setSession(data.session);
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
