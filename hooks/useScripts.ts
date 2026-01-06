import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export interface MarketScript {
  id: string;
  title: string;
  genre: string;
  quality: number;
  complexity: number;
  base_cost: number;
  description: string;
  tagline: string;
  required_cast: number;
  tone: string;
  created_at: string;
}

export const useScripts = () => {
  const [scripts, setScripts] = useState<MarketScript[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const { data, error } = await supabase
          .from("scripts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching scripts:", error);
          return;
        }

        setScripts(data || []);
      } catch (error) {
        console.error("Error in fetchScripts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScripts();

    // Subscribe to real-time updates (new scripts added, scripts removed)
    const subscription = supabase
      .channel("scripts_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scripts",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setScripts((prev) => [payload.new as MarketScript, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setScripts((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { scripts, loading };
};
