import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface OwnedScript {
  id: string;
  user_id: string;
  script_id: string;
  title: string;
  genre: string;
  quality: number;
  complexity: number;
  purchase_price: number;
  description: string;
  tagline: string;
  required_cast: number;
  tone: string;
  acquired_at: string;
}

export const useOwnedScripts = () => {
  const { user } = useAuth();
  const [ownedScripts, setOwnedScripts] = useState<OwnedScript[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOwnedScripts([]);
      setLoading(false);
      return;
    }

    const fetchOwnedScripts = async () => {
      try {
        const { data, error } = await supabase
          .from("owned_scripts")
          .select("*")
          .eq("user_id", user.id)
          .order("acquired_at", { ascending: false });

        if (error) {
          console.error("Error fetching owned scripts:", error);
          return;
        }

        setOwnedScripts(data || []);
      } catch (error) {
        console.error("Error in fetchOwnedScripts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnedScripts();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("owned_scripts_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "owned_scripts",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOwnedScripts((prev) => [payload.new as OwnedScript, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setOwnedScripts((prev) =>
              prev.filter((s) => s.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { ownedScripts, loading };
};
