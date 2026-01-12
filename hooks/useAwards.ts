import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { AwardsCeremony, AwardNomination, AwardCategory } from "../types";

interface DbCeremony {
  id: string;
  year: number;
  name: string;
  announced: boolean;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface DbNomination {
  id: string;
  ceremony_id: string;
  category: string;
  movie_id: string;
  movie_title: string;
  studio_id: string;
  actor_id: string | null;
  actor_name: string | null;
  is_winner: boolean;
  created_at: string;
}

// Convert database format to local format
const toCeremony = (dbCeremony: DbCeremony, nominations: DbNomination[]): AwardsCeremony => ({
  id: dbCeremony.id,
  year: dbCeremony.year,
  name: dbCeremony.name,
  announced: dbCeremony.announced,
  completed: dbCeremony.completed,
  nominations: nominations.map(toNomination),
});

const toNomination = (dbNom: DbNomination): AwardNomination => ({
  id: dbNom.id,
  category: dbNom.category as AwardCategory,
  movieId: dbNom.movie_id,
  movieTitle: dbNom.movie_title,
  studioId: dbNom.studio_id,
  actorId: dbNom.actor_id || undefined,
  actorName: dbNom.actor_name || undefined,
  isWinner: dbNom.is_winner,
});

export const useAwards = () => {
  const { user } = useAuth();
  const [ceremonies, setCeremonies] = useState<AwardsCeremony[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCeremonies = useCallback(async () => {
    try {
      // Fetch all ceremonies
      const { data: ceremoniesData, error: ceremoniesError } = await supabase
        .from("award_ceremonies")
        .select("*")
        .order("year", { ascending: false });

      if (ceremoniesError) throw ceremoniesError;

      // Fetch all nominations
      const { data: nominationsData, error: nominationsError } = await supabase
        .from("award_nominations")
        .select("*");

      if (nominationsError) throw nominationsError;

      // Group nominations by ceremony
      const ceremoniesWithNominations = (ceremoniesData || []).map((ceremony) => {
        const ceremonyNominations = (nominationsData || []).filter(
          (nom) => nom.ceremony_id === ceremony.id
        );
        return toCeremony(ceremony, ceremonyNominations);
      });

      setCeremonies(ceremoniesWithNominations);
      setError(null);
    } catch (err: any) {
      console.error("[Awards] Error fetching:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCeremonies();

    // Subscribe to realtime updates
    const ceremoniesChannel = supabase
      .channel("award_ceremonies_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "award_ceremonies",
        },
        () => {
          console.log("[Awards] Ceremony update detected");
          fetchCeremonies();
        }
      )
      .subscribe();

    const nominationsChannel = supabase
      .channel("award_nominations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "award_nominations",
        },
        () => {
          console.log("[Awards] Nomination update detected");
          fetchCeremonies();
        }
      )
      .subscribe();

    return () => {
      ceremoniesChannel.unsubscribe();
      nominationsChannel.unsubscribe();
    };
  }, [fetchCeremonies]);

  // Create a new ceremony with nominations
  const createCeremony = useCallback(
    async (ceremony: AwardsCeremony) => {
      if (!user) return { error: "Not authenticated" };

      try {
        // Insert ceremony
        const { data: ceremonyData, error: ceremonyError } = await supabase
          .from("award_ceremonies")
          .insert({
            id: ceremony.id,
            year: ceremony.year,
            name: ceremony.name,
            announced: ceremony.announced,
            completed: ceremony.completed,
          })
          .select()
          .single();

        if (ceremonyError) throw ceremonyError;

        // Insert nominations
        const nominationsToInsert = ceremony.nominations.map((nom) => ({
          id: nom.id,
          ceremony_id: ceremony.id,
          category: nom.category,
          movie_id: nom.movieId,
          movie_title: nom.movieTitle,
          studio_id: nom.studioId,
          actor_id: nom.actorId || null,
          actor_name: nom.actorName || null,
          is_winner: nom.isWinner,
        }));

        const { error: nominationsError } = await supabase
          .from("award_nominations")
          .insert(nominationsToInsert);

        if (nominationsError) throw nominationsError;

        await fetchCeremonies();
        return { error: null };
      } catch (err: any) {
        console.error("[Awards] Error creating ceremony:", err);
        return { error: err.message };
      }
    },
    [user, fetchCeremonies]
  );

  // Update ceremony (mark as completed, set winners)
  const updateCeremony = useCallback(
    async (ceremonyId: string, updates: { completed?: boolean; nominations?: AwardNomination[] }) => {
      if (!user) return { error: "Not authenticated" };

      try {
        // Update ceremony if needed
        if (updates.completed !== undefined) {
          const { error: ceremonyError } = await supabase
            .from("award_ceremonies")
            .update({ completed: updates.completed })
            .eq("id", ceremonyId);

          if (ceremonyError) throw ceremonyError;
        }

        // Update nominations if provided
        if (updates.nominations) {
          for (const nom of updates.nominations) {
            const { error: nomError } = await supabase
              .from("award_nominations")
              .update({ is_winner: nom.isWinner })
              .eq("id", nom.id);

            if (nomError) throw nomError;
          }
        }

        await fetchCeremonies();
        return { error: null };
      } catch (err: any) {
        console.error("[Awards] Error updating ceremony:", err);
        return { error: err.message };
      }
    },
    [user, fetchCeremonies]
  );

  // Get player stats
  const getPlayerStats = useCallback(async () => {
    if (!user) return null;

    const { data, error } = await supabase.rpc("get_player_award_stats", {
      player_id: user.id,
    });

    if (error) {
      console.error("[Awards] Error fetching stats:", error);
      return null;
    }

    return data?.[0] || null;
  }, [user]);

  return {
    ceremonies,
    loading,
    error,
    createCeremony,
    updateCeremony,
    getPlayerStats,
    refetch: fetchCeremonies,
  };
};
