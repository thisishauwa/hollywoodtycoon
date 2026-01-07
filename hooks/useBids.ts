import { useState, useEffect, useCallback } from "react";
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
  username?: string;
}

export const useBids = (scriptId?: string) => {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const fetchBids = useCallback(async () => {
    if (!scriptId) {
      setBids([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch bids for this script
      const { data: bidsData, error: bidsError } = await supabase
        .from("bids")
        .select("*")
        .eq("script_id", scriptId)
        .eq("is_active", true)
        .order("amount", { ascending: false });

      if (bidsError) {
        console.error("[Bids] Error fetching bids:", bidsError);
        return;
      }

      // Get usernames for bidders
      const userIds = [...new Set((bidsData || []).map((b: any) => b.user_id))];
      let usernameMap: Record<string, string> = {};

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        if (profilesData) {
          usernameMap = Object.fromEntries(
            profilesData.map((p: any) => [p.id, p.username])
          );
        }
      }

      // Transform to include username
      const bidsWithUsernames = (bidsData || []).map((bid: any) => ({
        ...bid,
        username: usernameMap[bid.user_id] || "Unknown",
      }));

      setBids(bidsWithUsernames);
    } catch (error) {
      console.error("[Bids] Error in fetchBids:", error);
    } finally {
      setLoading(false);
    }
  }, [scriptId]);

  useEffect(() => {
    fetchBids();

    if (!scriptId) return;

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
        (payload) => {
          console.log("[Bids] Real-time update for script:", scriptId, payload.eventType);
          // Refetch to get the latest data with usernames
          fetchBids();
        }
      )
      .subscribe((status) => {
        console.log("[Bids] Subscription status for", scriptId, ":", status);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [scriptId, fetchBids]);

  const placeBid = async (targetScriptId: string, amount: number) => {
    if (!user) return { error: "Not authenticated" };

    setPlacing(true);
    try {
      // Set expiry to 30 seconds from now
      const expiresAt = new Date(Date.now() + 30000).toISOString();

      const { error } = await supabase.from("bids").upsert(
        {
          script_id: targetScriptId,
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
        console.error("[Bids] Error placing bid:", error);
        return { error: error.message };
      }

      // Immediately refetch to update the UI
      // The real-time subscription will also trigger, but this ensures immediate feedback
      await fetchBids();

      return { error: null };
    } catch (error: any) {
      console.error("[Bids] Error in placeBid:", error);
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
    refetch: fetchBids,
  };
};
