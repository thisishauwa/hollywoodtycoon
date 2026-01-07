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

// Helper: Fetch or create profile with timeout
async function getOrCreateProfile(userId: string, email: string): Promise<Profile | null> {
  const defaultUsername = email?.split("@")[0] || "Studio";
  console.log("[Auth] getOrCreateProfile called for:", userId);

  // Add timeout to prevent infinite hanging
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Profile fetch timeout")), 8000);
  });

  try {
    console.log("[Auth] Fetching profile...");

    const fetchPromise = supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: existing, error: fetchError } = await Promise.race([
      fetchPromise,
      timeoutPromise,
    ]) as any;

    console.log("[Auth] Profile fetch result:", { existing, fetchError: fetchError?.message });

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

      console.log("[Auth] Profile create result:", { created, createError: createError?.message });

      if (createError) {
        console.error("[Auth] Failed to create profile:", createError);
        return null;
      }
      return created;
    }

    console.error("[Auth] Failed to fetch profile:", fetchError);
    return null;
  } catch (err: any) {
    console.error("[Auth] getOrCreateProfile error:", err?.message || err);
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
    let initComplete = false;

    const initAuth = async () => {
      try {
        console.log("[Auth] initAuth starting...");

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("[Auth] getSession result:", { hasSession: !!session, error: sessionError?.message });

        if (!mounted) return;

        if (session?.user) {
          console.log("[Auth] User found:", session.user.id);
          setSession(session);
          setUser(session.user);

          const fetchedProfile = await getOrCreateProfile(session.user.id, session.user.email || "");
          console.log("[Auth] Profile loaded:", fetchedProfile?.username);
          if (mounted) {
            setProfile(fetchedProfile);
          }
        } else {
          console.log("[Auth] No session found");
        }
      } catch (error: any) {
        console.error("[Auth] Init error:", error?.message || error);
      } finally {
        if (mounted) {
          initComplete = true;
          console.log("[Auth] Setting loading to false");
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes AFTER initial load
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("[Auth] onAuthStateChange:", event, "initComplete:", initComplete);
        if (!mounted) return;

        // Skip events during initial auth - initAuth handles it
        if (!initComplete) {
          console.log("[Auth] Skipping (init not complete)");
          return;
        }

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const fetchedProfile = await getOrCreateProfile(newSession.user.id, newSession.user.email || "");
          if (mounted) {
            setProfile(fetchedProfile);
          }
        } else {
          setProfile(null);
        }

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
