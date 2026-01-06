import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, Profile } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        return null;
      }

      if (!data) {
        console.error("No profile data returned");
        return null;
      }

      return data;
    } catch (error) {
      console.error("Profile fetch exception:", error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      console.log("🔄 Starting auth initialization...");
      try {
        // Add timeout to prevent infinite hang
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session fetch timeout")), 5000)
        );

        const {
          data: { session },
        } = (await Promise.race([sessionPromise, timeoutPromise])) as any;

        console.log("Session check:", session ? "Found" : "None");

        if (!mounted) {
          console.log("Component unmounted, aborting");
          return;
        }

        if (session?.user) {
          console.log("User found:", session.user.email);
          setSession(session);
          setUser(session.user);
          console.log("Fetching profile...");
          const profileData = await fetchProfile(session.user.id);
          console.log("Profile result:", profileData ? "Success" : "Failed");
          setProfile(profileData);
        } else {
          console.log("No session, clearing state");
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("❌ Error initializing auth:", error);
      } finally {
        if (mounted) {
          console.log("✅ Setting loading to false");
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      // Don't show loading screen for auth changes, just update state
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    });

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
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { error };

    // Create profile with username
    if (data.user) {
      try {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          username,
          industry_clout: 30,
        });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          return { error: profileError };
        }
      } catch (err) {
        console.error("Error in profile creation:", err);
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    // Refresh profile
    await fetchProfile(user.id);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
