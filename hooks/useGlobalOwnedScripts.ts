import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const useGlobalOwnedScripts = () => {
  const [globalOwnedScriptIds, setGlobalOwnedScriptIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllOwned = async () => {
      try {
        // We only need script_ids to know what's taken
        const { data, error } = await supabase
          .from("owned_scripts")
          .select("script_id");

        if (error) {
          console.error("Error fetching global owned scripts:", error);
          return;
        }

        const ids = new Set((data || []).map(s => s.script_id));
        setGlobalOwnedScriptIds(ids);
      } catch (error) {
        console.error("Error in fetchAllOwned:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOwned();

    // Subscribe to ALL owned_scripts changes (any user Buying anything)
    const subscription = supabase
      .channel("global_owned_scripts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "owned_scripts",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setGlobalOwnedScriptIds(prev => {
              const newSet = new Set(prev);
              newSet.add(payload.new.script_id);
              return newSet;
            });
          } 
          // Note: If we implement selling/releasing scripts later, handle DELETE here
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { globalOwnedScriptIds, loading };
};
