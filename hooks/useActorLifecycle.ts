import { useState, useCallback } from "react";
import { Actor } from "../types";
import {
  processActorLifecycle,
  updateActorTiers,
  LifecycleEvent,
} from "../services/actorLifecycle";
import { supabase } from "../lib/supabase";

// Sync actor changes to Supabase
async function syncActorToSupabase(actor: Actor) {
  const { error } = await supabase
    .from("actors")
    .update({
      reputation: actor.reputation,
      skill: actor.skill,
      salary: actor.salary,
      status: actor.status,
      age: actor.age,
      relationships: actor.relationships,
      gossip: actor.gossip || [],
    })
    .eq("id", actor.id);

  if (error) {
    console.error(`[Lifecycle] Error syncing actor ${actor.name}:`, error);
  }
  return error;
}

export const useActorLifecycle = () => {
  const [recentEvents, setRecentEvents] = useState<LifecycleEvent[]>([]);
  const [allEvents, setAllEvents] = useState<LifecycleEvent[]>([]);
  const [processing, setProcessing] = useState(false);

  // Process one month of lifecycle events for given actors
  // Returns updated actors and syncs changes to Supabase
  const processMonth = useCallback(async (actors: Actor[], currentMonth: number): Promise<{
    updatedActors: Actor[];
    events: LifecycleEvent[];
  }> => {
    setProcessing(true);

    try {
      // Process lifecycle events
      const { updatedActors, events } = processActorLifecycle(actors, currentMonth);

      // Update tiers based on new reputations
      const tieredActors = updateActorTiers(updatedActors);

      // Filter out silent events (like aging with no message)
      const significantEvents = events.filter(e => e.message.length > 0);

      if (significantEvents.length > 0) {
        setRecentEvents(significantEvents);
        setAllEvents(prev => [...significantEvents, ...prev].slice(0, 100));
      }

      // Find actors that changed and sync to Supabase
      const changedActors = tieredActors.filter((newActor, i) => {
        const oldActor = actors.find(a => a.id === newActor.id);
        if (!oldActor) return false;

        // Check if any relevant fields changed
        return (
          oldActor.reputation !== newActor.reputation ||
          oldActor.skill !== newActor.skill ||
          oldActor.salary !== newActor.salary ||
          oldActor.status !== newActor.status ||
          oldActor.age !== newActor.age ||
          oldActor.tier !== newActor.tier ||
          JSON.stringify(oldActor.relationships) !== JSON.stringify(newActor.relationships) ||
          JSON.stringify(oldActor.gossip) !== JSON.stringify(newActor.gossip)
        );
      });

      // Sync changed actors to Supabase
      if (changedActors.length > 0) {
        console.log(`[Lifecycle] Syncing ${changedActors.length} changed actors to Supabase`);
        await Promise.all(changedActors.map(syncActorToSupabase));
      }

      return { updatedActors: tieredActors, events: significantEvents };
    } finally {
      setProcessing(false);
    }
  }, []);

  // Clear recent events (after they've been shown)
  const clearRecentEvents = useCallback(() => {
    setRecentEvents([]);
  }, []);

  return {
    recentEvents,
    allEvents,
    processMonth,
    clearRecentEvents,
    processing,
  };
};
