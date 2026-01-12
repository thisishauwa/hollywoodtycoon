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
  created_at: string;
}

// Transform database event to local GameEvent format
const toLocalEvent = (dbEvent: DbGameEvent): GameEvent => ({
  id: dbEvent.id,
  month: dbEvent.month,
  message: dbEvent.description,
  // Convert to uppercase to match local event type format (GOOD, BAD, INFO, etc.)
  type: dbEvent.event_type.toUpperCase() as GameEvent["type"],
  read: dbEvent.is_read,
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
        const { data, error } = await supabase
          .from("game_events")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          console.error("Error fetching events:", error);
          return;
        }

        const localEvents = (data || []).map(toLocalEvent);
        setEvents(localEvents);
        setUnreadCount(localEvents.filter((e) => !e.read).length);
      } catch (error) {
        console.error("Error in fetchEvents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`game_events_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_events",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("[Events] Realtime INSERT detected:", payload);
          const dbEvent = payload.new as DbGameEvent;
          const localEvent = toLocalEvent(dbEvent);
          setEvents((prev) => [localEvent, ...prev]);
          if (!localEvent.read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe((status) => {
        console.log("[Events] Subscription status:", status);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const markAsRead = async (eventId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("game_events")
      .update({ is_read: true })
      .eq("id", eventId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error marking event as read:", error);
      return;
    }

    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, read: true } : e))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("game_events")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all events as read:", error);
      return;
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
