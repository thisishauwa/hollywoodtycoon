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

        // Deduplicate by script_id (in case of database duplicates)
        // Keep the first occurrence of each unique script_id
        const seen = new Map<string, OwnedScript>();
        (data || []).forEach(script => {
          if (!seen.has(script.script_id)) {
            seen.set(script.script_id, script);
          }
        });
        const uniqueScripts = Array.from(seen.values());
        
        console.log(`[OwnedScripts] Fetched ${data?.length || 0} scripts, ${uniqueScripts.length} unique`);
        setOwnedScripts(uniqueScripts);
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
            const newScript = payload.new as OwnedScript;
            setOwnedScripts((prev) => {
              // Prevent duplicates - check if script_id already exists
              if (prev.some(s => s.script_id === newScript.script_id)) {
                console.log(`[OwnedScripts] Ignoring duplicate INSERT for script_id: ${newScript.script_id}`);
                return prev;
              }
              return [newScript, ...prev];
            });
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
