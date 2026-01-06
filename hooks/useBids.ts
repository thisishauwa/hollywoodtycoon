import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface Bid {
  id: string;
  script_id: string;
  user_id: string;
  amount: number;
  is_active: boolean;
  created_at: string;
  expires_at: string;
  username?: string; // Joined from profiles
}

export const useBids = (scriptId?: string) => {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!scriptId) {
      setBids([]);
      setLoading(false);
      return;
    }

    const fetchBids = async () => {
      try {
        const { data, error } = await supabase
          .from("bids")
          .select("*")
          .eq("script_id", scriptId)
          .eq("is_active", true)
          .order("amount", { ascending: false });

        if (error) {
          console.error("Error fetching bids:", error);
          return;
        }

        // Fetch usernames for all bids
        const bidsWithUsernames = await Promise.all(
          (data || []).map(async (bid: any) => {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", bid.user_id)
              .single();

            return {
              ...bid,
              username: profileData?.username || "Unknown",
            };
          })
        );

        setBids(bidsWithUsernames);
      } catch (error) {
        console.error("Error in fetchBids:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();

    // Subscribe to real-time bid updates
    const subscription = supabase
      .channel(`bids_${scriptId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bids",
          filter: `script_id=eq.${scriptId}`,
        },
        async (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            // Fetch username for the bid
            const { data: profileData } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", (payload.new as any).user_id)
              .single();

            const newBid = {
              ...(payload.new as Bid),
              username: profileData?.username || "Unknown",
            };

            setBids((prev) => {
              const filtered = prev.filter((b) => b.id !== newBid.id);
              return [newBid, ...filtered].sort((a, b) => b.amount - a.amount);
            });
          } else if (payload.eventType === "DELETE") {
            setBids((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [scriptId]);

  const placeBid = async (scriptId: string, amount: number) => {
    if (!user) return { error: "Not authenticated" };

    setPlacing(true);
    try {
      // Set expiry to 30 seconds from now
      const expiresAt = new Date(Date.now() + 30000).toISOString();

      const { error } = await supabase.from("bids").upsert(
        {
          script_id: scriptId,
          user_id: user.id,
          amount,
          is_active: true,
          expires_at: expiresAt,
        },
        {
          onConflict: "script_id,user_id",
        }
      );

      if (error) {
        console.error("Error placing bid:", error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error("Error in placeBid:", error);
      return { error: error.message };
    } finally {
      setPlacing(false);
    }
  };

  const getHighestBid = () => {
    if (bids.length === 0) return null;
    return bids[0];
  };

  const isUserHighBidder = () => {
    const highest = getHighestBid();
    return highest?.user_id === user?.id;
  };

  return {
    bids,
    loading,
    placing,
    placeBid,
    getHighestBid,
    isUserHighBidder,
  };
};
