import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Actor, ActorTier, Genre } from "../types";
import { useAuth } from "../contexts/AuthContext";

interface SupabaseActor {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  tier: string;
  salary: number;
  reputation: number;
  skill: number;
  genres: string[];
  status: string;
  bio: string | null;
  visual_description: string | null;
  personality: string[];
  relationships: Record<string, number>;
  gossip: string[];
  hired_by: string | null;
}

// Convert Supabase actor to local Actor type
const toActor = (sa: SupabaseActor): Actor => ({
  id: sa.id,
  name: sa.name,
  age: sa.age,
  gender: sa.gender,
  tier: sa.tier as ActorTier,
  salary: sa.salary,
  reputation: sa.reputation,
  skill: sa.skill,
  genres: sa.genres as Genre[],
  img: "", // No images
  status: sa.status as Actor["status"],
  bio: sa.bio || "",
  visualDescription: sa.visual_description || "",
  personality: sa.personality || [],
  relationships: sa.relationships || {},
  gossip: sa.gossip || [],
});

export const useActors = () => {
  const { user } = useAuth();
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActors = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("actors")
        .select("*")
        .order("tier", { ascending: true })
        .order("reputation", { ascending: false });

      if (fetchError) {
        console.error("[Actors] Error fetching:", fetchError);
        setError(fetchError.message);
        return;
      }

      setActors((data || []).map(toActor));
      setError(null);
    } catch (err: any) {
      console.error("[Actors] Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActors();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("actors_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "actors",
        },
        (payload) => {
          console.log("[Actors] Real-time update:", payload.eventType);
          fetchActors();
        }
      )
      .subscribe((status) => {
        console.log("[Actors] Subscription status:", status);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchActors]);

  // Hire an actor (set hired_by to current user)
  const hireActor = useCallback(
    async (actorId: string) => {
      if (!user) return { error: "Not authenticated" };

      const { error: updateError } = await supabase
        .from("actors")
        .update({ hired_by: user.id, status: "In Production" })
        .eq("id", actorId)
        .eq("status", "Available");

      if (updateError) {
        console.error("[Actors] Error hiring:", updateError);
        return { error: updateError.message };
      }

      await fetchActors();
      return { error: null };
    },
    [user, fetchActors]
  );

  // Release an actor (set hired_by to null)
  const releaseActor = useCallback(
    async (actorId: string) => {
      if (!user) return { error: "Not authenticated" };

      const { error: updateError } = await supabase
        .from("actors")
        .update({ hired_by: null, status: "Available" })
        .eq("id", actorId)
        .eq("hired_by", user.id);

      if (updateError) {
        console.error("[Actors] Error releasing:", updateError);
        return { error: updateError.message };
      }

      await fetchActors();
      return { error: null };
    },
    [user, fetchActors]
  );

  // Update actor data (for lifecycle events, gossip, etc.)
  const updateActor = useCallback(
    async (actorId: string, updates: Partial<{
      reputation: number;
      skill: number;
      salary: number;
      status: string;
      age: number;
      relationships: Record<string, number>;
      gossip: string[];
    }>) => {
      // Map local field names to Supabase column names
      const supabaseUpdates: Record<string, any> = {};
      if (updates.reputation !== undefined) supabaseUpdates.reputation = updates.reputation;
      if (updates.skill !== undefined) supabaseUpdates.skill = updates.skill;
      if (updates.salary !== undefined) supabaseUpdates.salary = updates.salary;
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;
      if (updates.age !== undefined) supabaseUpdates.age = updates.age;
      if (updates.relationships !== undefined) supabaseUpdates.relationships = updates.relationships;
      if (updates.gossip !== undefined) supabaseUpdates.gossip = updates.gossip;

      const { error: updateError } = await supabase
        .from("actors")
        .update(supabaseUpdates)
        .eq("id", actorId);

      if (updateError) {
        console.error("[Actors] Error updating:", updateError);
        return { error: updateError.message };
      }

      return { error: null };
    },
    []
  );

  // Batch update multiple actors (for lifecycle events)
  const updateActors = useCallback(
    async (actorUpdates: Array<{ id: string; updates: Parameters<typeof updateActor>[1] }>) => {
      const results = await Promise.all(
        actorUpdates.map(({ id, updates }) => updateActor(id, updates))
      );

      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        console.error("[Actors] Batch update errors:", errors);
      }

      // Refetch to get latest state
      await fetchActors();
      return { errors };
    },
    [updateActor, fetchActors]
  );

  // Get actors available for hire
  const getAvailableActors = useCallback(() => {
    return actors.filter((a) => a.status === "Available");
  }, [actors]);

  // Get actors hired by current user
  const getMyActors = useCallback(() => {
    if (!user) return [];
    return actors.filter((a) => {
      // We need to check the raw data for hired_by
      // This is a workaround since Actor type doesn't have hired_by
      return false; // Will need to be updated when we track hired_by
    });
  }, [actors, user]);

  // Get actors by tier
  const getActorsByTier = useCallback(
    (tier: ActorTier) => {
      return actors.filter((a) => a.tier === tier);
    },
    [actors]
  );

  return {
    actors,
    loading,
    error,
    hireActor,
    releaseActor,
    updateActor,
    updateActors,
    getAvailableActors,
    getMyActors,
    getActorsByTier,
    refetch: fetchActors,
  };
};
