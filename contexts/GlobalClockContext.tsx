import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

interface GlobalClockContextType {
  clock: GlobalClock | null;
  timeUntilAdvance: TimeUntilAdvance | null;
  loading: boolean;
  error: string | null;
  formatTimeRemaining: () => string;
  getMonthName: (monthIndex?: number) => string;
  isAwardSeason: (monthIndex?: number) => boolean;
  isNominationSeason: (monthIndex?: number) => boolean;
  refetch: () => Promise<GlobalClock | null>;
}

const GlobalClockContext = createContext<GlobalClockContextType | undefined>(undefined);

export const useGlobalClockContext = () => {
  const context = useContext(GlobalClockContext);
  if (!context) {
    throw new Error('useGlobalClockContext must be used within GlobalClockProvider');
  }
  return context;
};

export const GlobalClockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clock, setClock] = useState<GlobalClock | null>(null);
  const [timeUntilAdvance, setTimeUntilAdvance] = useState<TimeUntilAdvance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateTimeRemaining = useCallback((clockData: GlobalClock) => {
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
  }, []);

  const fetchClock = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('global_game_clock')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('Global clock table not found.');
          setError('Global clock not configured');
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

      console.log('[GlobalClockContext] Clock fetched:', clockData.month, '/', clockData.year);
      setClock(clockData);
      updateTimeRemaining(clockData);
      return clockData;
    } catch (err) {
      console.error('Error fetching global clock:', err);
      setError('Failed to fetch global clock');
      return null;
    } finally {
      setLoading(false);
    }
  }, [updateTimeRemaining]);

  useEffect(() => {
    fetchClock();

    // Subscribe to real-time clock updates
    const subscription = supabase
      .channel('global_clock_context')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'global_game_clock',
          filter: 'id=eq.1',
        },
        (payload) => {
          console.log('[GlobalClockContext] Realtime UPDATE received:', payload.new);
          const data = payload.new as any;
          const clockData: GlobalClock = {
            month: data.month,
            year: data.year,
            lastAdvancedAt: new Date(data.last_advanced_at),
            advanceIntervalHours: data.advance_interval_hours,
          };
          console.log('[GlobalClockContext] Setting clock to:', clockData.month, '/', clockData.year);
          setClock(clockData);
          updateTimeRemaining(clockData);
        }
      )
      .subscribe((status) => {
        console.log('[GlobalClockContext] Subscription status:', status);
      });

    // Update countdown every minute
    const countdownInterval = setInterval(() => {
      setClock(current => {
        if (current) {
          updateTimeRemaining(current);
        }
        return current;
      });
    }, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(countdownInterval);
    };
  }, [fetchClock, updateTimeRemaining]);

  const formatTimeRemaining = useCallback((): string => {
    if (!timeUntilAdvance) return '--';
    const hours = Math.floor(timeUntilAdvance.hoursRemaining);
    const minutes = Math.floor((timeUntilAdvance.hoursRemaining % 1) * 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [timeUntilAdvance]);

  const getMonthName = useCallback((monthIndex?: number): string => {
    const targetMonth = monthIndex !== undefined ? monthIndex : (clock?.month || 1);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[targetMonth - 1] || '--';
  }, [clock?.month]);

  const isAwardSeason = useCallback((monthIndex?: number): boolean => {
    const targetMonth = monthIndex !== undefined ? monthIndex : (clock?.month || 0);
    return targetMonth === 2;
  }, [clock?.month]);

  const isNominationSeason = useCallback((monthIndex?: number): boolean => {
    const targetMonth = monthIndex !== undefined ? monthIndex : (clock?.month || 0);
    return targetMonth === 1;
  }, [clock?.month]);

  return (
    <GlobalClockContext.Provider
      value={{
        clock,
        timeUntilAdvance,
        loading,
        error,
        formatTimeRemaining,
        getMonthName,
        isAwardSeason,
        isNominationSeason,
        refetch: fetchClock,
      }}
    >
      {children}
    </GlobalClockContext.Provider>
  );
};
