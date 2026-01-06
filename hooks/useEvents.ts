import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface GameEvent {
  id: string;
  user_id: string;
  type: "GOOD" | "BAD" | "INFO";
  message: string;
  read: boolean;
  created_at: string;
}

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
          .from("events")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          console.error("Error fetching events:", error);
          return;
        }

        setEvents(data || []);
        setUnreadCount((data || []).filter((e) => !e.read).length);
      } catch (error) {
        console.error("Error in fetchEvents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("events_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "events",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newEvent = payload.new as GameEvent;
          setEvents((prev) => [newEvent, ...prev]);
          if (!newEvent.read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const markAsRead = async (eventId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("events")
      .update({ read: true })
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
      .from("events")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

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
