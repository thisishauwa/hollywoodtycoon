import { useState, useEffect } from "react";
import { supabase, Profile } from "../lib/supabase";

export interface Studio {
  id: string;
  name: string;
  yearlyRevenue: number;
  color: string;
  industry_clout: number;
}

export const useStudios = (currentUserId?: string) => {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        // Don't fetch if no currentUserId yet
        if (!currentUserId) {
          setStudios([]);
          setLoading(false);
          return;
        }

        // Fetch profiles (industry_clout will be added after migration)
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username")
          .neq("id", currentUserId); // Exclude current user

        if (error) {
          console.error("Error fetching studios:", error);
          setStudios([]);
          return;
        }

        // Convert profiles to studios format
        const studioColors = [
          "#ff6b6b",
          "#4ecdc4",
          "#45b7d1",
          "#f9ca24",
          "#6c5ce7",
          "#a29bfe",
          "#fd79a8",
          "#fdcb6e",
          "#e17055",
          "#00b894",
          "#0984e3",
          "#6c5ce7",
        ];

        const mappedStudios: Studio[] = (data || []).map(
          (profile: any, index: number) => ({
            id: profile.id,
            name: profile.username,
            yearlyRevenue: (profile.industry_clout || 30) * 1000000, // Convert clout to revenue for display
            color: studioColors[index % studioColors.length],
            industry_clout: profile.industry_clout || 30, // Default to 30 if column doesn't exist
          })
        );

        setStudios(mappedStudios);
      } catch (error) {
        console.error("Error fetching studios:", error);
        setStudios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudios();

    // Subscribe to changes in profiles table
    const subscription = supabase
      .channel("profiles_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          fetchStudios();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUserId]);

  return { studios, loading };
};
