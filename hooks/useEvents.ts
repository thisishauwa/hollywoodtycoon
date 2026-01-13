import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { GameEvent } from "../types";

// Database schema format
interface DbGameEvent {
  id: string;
  user_id: string;
  event_type: string;
  title: string;
  description: string;
  month: number;
  year: number;
  is_read: boolean;
  is_global: boolean;
  created_at: string;
}

// Transform database event to local GameEvent format
const toLocalEvent = (dbEvent: DbGameEvent, isReadByUser: boolean): GameEvent => ({
  id: dbEvent.id,
  month: dbEvent.month,
  message: dbEvent.description,
  // Convert to uppercase to match local event type format (GOOD, BAD, INFO, etc.)
  type: dbEvent.event_type.toUpperCase() as GameEvent["type"],
  // For own events, use is_read; for global events, check user_event_reads
  read: dbEvent.is_global ? isReadByUser : dbEvent.is_read,
});

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        // Fetch events that are EITHER owned by user OR are global
        const { data: eventsData, error: eventsError } = await supabase
          .from("game_events")
          .select("*")
          .or(`user_id.eq.${user.id},is_global.eq.true`)
          .order("created_at", { ascending: false })
          .limit(50);

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          return;
        }

        // Fetch user's read status for all events
        const eventIds = (eventsData || []).map(e => e.id);
        const { data: readsData, error: readsError } = await supabase
          .from("user_event_reads")
          .select("event_id")
          .eq("user_id", user.id)
          .in("event_id", eventIds);

        if (readsError) {
          // Table might not exist yet, fall back to is_read field
          console.warn("Could not fetch read status, using fallback:", readsError);
        }

        const readEventIds = new Set((readsData || []).map(r => r.event_id));

        const localEvents = (eventsData || []).map((dbEvent: DbGameEvent) => {
          // For global events, check if user has read it via user_event_reads
          // For own events, use the is_read field directly
          const isReadByUser = dbEvent.is_global
            ? readEventIds.has(dbEvent.id)
            : dbEvent.is_read;
          return toLocalEvent(dbEvent, isReadByUser);
        });

        setEvents(localEvents);
        setUnreadCount(localEvents.filter((e) => !e.read).length);
      } catch (error) {
        console.error("Error in fetchEvents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Subscribe to real-time updates for new events
    const eventsSubscription = supabase
      .channel(`game_events_multiplayer`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_events",
        },
        (payload) => {
          const dbEvent = payload.new as DbGameEvent;

          // Only process if it belongs to user OR is global
          if (dbEvent.user_id === user.id || dbEvent.is_global) {
            console.log("[Events] Realtime INSERT detected:", payload);
            const localEvent = toLocalEvent(dbEvent, false); // New events are unread
            setEvents((prev) => {
              // Deduplicate just in case
              if (prev.some((e) => e.id === localEvent.id)) return prev;
              return [localEvent, ...prev];
            });
            if (!localEvent.read) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("[Events] Subscription status:", status);
      });

    return () => {
      eventsSubscription.unsubscribe();
    };
  }, [user]);

  const markAsRead = async (eventId: string) => {
    if (!user) return;

    // Find the event to check if it's global
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // For global events, insert into user_event_reads
    // For own events, update the is_read field
    const eventData = await supabase
      .from("game_events")
      .select("is_global, user_id")
      .eq("id", eventId)
      .single();

    if (eventData.data?.is_global) {
      // Insert into user_event_reads for global events
      const { error } = await supabase
        .from("user_event_reads")
        .upsert({ user_id: user.id, event_id: eventId }, { onConflict: "user_id,event_id" });

      if (error) {
        console.error("Error marking global event as read:", error);
        return;
      }
    } else if (eventData.data?.user_id === user.id) {
      // Update is_read for own events
      const { error } = await supabase
        .from("game_events")
        .update({ is_read: true })
        .eq("id", eventId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error marking event as read:", error);
        return;
      }
    }

    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, read: true } : e))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;

    // Get all unread events
    const unreadEvents = events.filter(e => !e.read);

    // Mark own events as read via update
    const { error: ownError } = await supabase
      .from("game_events")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (ownError) {
      console.error("Error marking own events as read:", ownError);
    }

    // Mark global events as read via insert into user_event_reads
    const globalEventIds = unreadEvents
      .filter(e => {
        // Need to check which events are global (we don't have this in local state)
        // For now, just try to insert all unread events - the constraint will handle dupes
        return true;
      })
      .map(e => ({ user_id: user.id, event_id: e.id }));

    if (globalEventIds.length > 0) {
      const { error: globalError } = await supabase
        .from("user_event_reads")
        .upsert(globalEventIds, { onConflict: "user_id,event_id", ignoreDuplicates: true });

      if (globalError) {
        console.error("Error marking global events as read:", globalError);
      }
    }

    setEvents((prev) => prev.map((e) => ({ ...e, read: true })));
    setUnreadCount(0);
  };

  return {
    events,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};
