import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface GameState {
  balance: number;
  reputation: number;
  month: number;
  year: number;
  updated_at: string;
}

export const useGameState = () => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGameState(null);
      setLoading(false);
      return;
    }

    const fetchGameState = async () => {
      try {
        const { data, error } = await supabase
          .from("game_state")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          // Create initial game state if doesn't exist
          if (error.code === "PGRST116") {
            const { data: newState, error: upsertError } = await supabase
              .from("game_state")
              .upsert(
                {
                  user_id: user.id,
                  balance: 5000000,
                  reputation: 30,
                  month: 1,
                  year: 2003,
                },
                {
                  onConflict: "user_id",
                }
              )
              .select()
              .single();

            if (upsertError) {
              console.error("Error creating game state:", upsertError);
              return;
            }

            setGameState(newState);
          } else {
            console.error("Error fetching game state:", error);
          }
          return;
        }

        setGameState(data);
      } catch (error) {
        console.error("Error in fetchGameState:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameState();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("game_state_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_state",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setGameState(payload.new as GameState);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const updateBalance = async (newBalance: number) => {
    if (!user) return;

    const { error } = await supabase
      .from("game_state")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating balance:", error);
    }
  };

  const updateReputation = async (newReputation: number) => {
    if (!user) return;

    const { error } = await supabase
      .from("game_state")
      .update({
        reputation: newReputation,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating reputation:", error);
    }
  };

  return {
    gameState,
    loading,
    updateBalance,
    updateReputation,
  };
};
