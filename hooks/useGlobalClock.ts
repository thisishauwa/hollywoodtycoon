import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

interface GlobalClock {
  month: number;
  year: number;
  lastAdvancedAt: Date;
  advanceIntervalHours: number;
}

interface TimeUntilAdvance {
  hoursRemaining: number;
  nextAdvanceAt: Date;
}

export const useGlobalClock = () => {
  const [clock, setClock] = useState<GlobalClock | null>(null);
  const [timeUntilAdvance, setTimeUntilAdvance] = useState<TimeUntilAdvance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClock = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("global_game_clock")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) {
        // Table might not exist yet
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          console.warn("Global clock table not found. Using local time.");
          setError("Global clock not configured");
          return null;
        }
        throw error;
      }

      const clockData: GlobalClock = {
        month: data.month,
        year: data.year,
        lastAdvancedAt: new Date(data.last_advanced_at),
        advanceIntervalHours: data.advance_interval_hours,
      };

      setClock(clockData);
      updateTimeRemaining(clockData);
      return clockData;
    } catch (err) {
      console.error("Error fetching global clock:", err);
      setError("Failed to fetch global clock");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTimeRemaining = (clockData: GlobalClock) => {
    const now = new Date();
    const msSinceLastAdvance = now.getTime() - clockData.lastAdvancedAt.getTime();
    const hoursSinceLastAdvance = msSinceLastAdvance / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, clockData.advanceIntervalHours - hoursSinceLastAdvance);
    const nextAdvanceAt = new Date(
      clockData.lastAdvancedAt.getTime() + clockData.advanceIntervalHours * 60 * 60 * 1000
    );

    setTimeUntilAdvance({
      hoursRemaining,
      nextAdvanceAt,
    });
  };

  useEffect(() => {
    fetchClock();

    // Subscribe to real-time clock updates
    const subscription = supabase
      .channel("global_clock_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "global_game_clock",
          filter: "id=eq.1",
        },
        (payload) => {
          console.log("[Clock] Realtime UPDATE detected:", payload);
          const data = payload.new as any;
          const clockData: GlobalClock = {
            month: data.month,
            year: data.year,
            lastAdvancedAt: new Date(data.last_advanced_at),
            advanceIntervalHours: data.advance_interval_hours,
          };
          console.log("[Clock] Setting clock to:", clockData);
          setClock(clockData);
          updateTimeRemaining(clockData);
        }
      )
      .subscribe((status) => {
        console.log("[Clock] Subscription status:", status);
      });

    // Update countdown every minute
    const countdownInterval = setInterval(() => {
      if (clock) {
        updateTimeRemaining(clock);
      }
    }, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(countdownInterval);
    };
  }, [fetchClock]);

  // Format time remaining as "Xh Ym"
  const formatTimeRemaining = (): string => {
    if (!timeUntilAdvance) return "--";
    const hours = Math.floor(timeUntilAdvance.hoursRemaining);
    const minutes = Math.floor((timeUntilAdvance.hoursRemaining % 1) * 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get month name
  const getMonthName = (monthIndex?: number): string => {
    const targetMonth = monthIndex !== undefined ? monthIndex : (clock?.month || 1);
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[targetMonth - 1] || "--";
  };

  // Check if it's award season (Feb)
  const isAwardSeason = (monthIndex?: number): boolean => {
    const targetMonth = monthIndex !== undefined ? monthIndex : (clock?.month || 0);
    return targetMonth === 2;
  };

  // Check if it's nomination season (Jan)
  const isNominationSeason = (monthIndex?: number): boolean => {
    const targetMonth = monthIndex !== undefined ? monthIndex : (clock?.month || 0);
    return targetMonth === 1;
  };

  return {
    clock,
    timeUntilAdvance,
    loading,
    error,
    formatTimeRemaining,
    getMonthName,
    isAwardSeason,
    isNominationSeason,
    refetch: fetchClock,
  };
};
