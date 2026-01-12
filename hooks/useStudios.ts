import { useState, useEffect } from "react";
import { supabase, Profile } from "../lib/supabase";

export interface Studio {
  id: string;
  name: string;
  yearlyRevenue: number;
  color: string;
  industry_clout: number;
  reputation: number;
}

export const useStudios = (currentUserId?: string, currentYear?: number) => {
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

        // Fetch profiles
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, industry_clout")
          .neq("id", currentUserId); // Exclude current user

        if (profileError) {
          console.error("Error fetching studios:", profileError);
          setStudios([]);
          return;
        }

        // Get the current year from global clock if not provided
        const yearToUse = currentYear || new Date().getFullYear();

        // Fetch all released projects for this year to calculate yearly revenue
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("studio_id, revenue")
          .eq("status", "Released")
          .eq("release_year", yearToUse);

        if (projectsError) {
          console.error("Error fetching projects for revenue:", projectsError);
        }

        // Calculate yearly revenue per studio
        const revenueByStudio: Record<string, number> = {};
        (projectsData || []).forEach((p: any) => {
          revenueByStudio[p.studio_id] = (revenueByStudio[p.studio_id] || 0) + (p.revenue || 0);
        });

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

        const mappedStudios: Studio[] = (profileData || []).map(
          (profile: any, index: number) => ({
            id: profile.id,
            name: profile.username,
            yearlyRevenue: revenueByStudio[profile.id] || 0, // Real revenue from released projects
            color: studioColors[index % studioColors.length],
            industry_clout: profile.industry_clout || 30,
            reputation: profile.industry_clout || 30,
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
  }, [currentUserId, currentYear]);

  return { studios, loading };
};
