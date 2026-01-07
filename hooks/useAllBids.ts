import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface BidWithScript {
  id: string;
  script_id: string;
  user_id: string;
  amount: number;
  is_active: boolean;
  created_at: string;
  expires_at: string;
  username?: string;
}

// Get all active bids grouped by script
export const useAllBids = () => {
  const { user } = useAuth();
  const [bidsByScript, setBidsByScript] = useState<
    Record<string, BidWithScript[]>
  >({});
  const [loading, setLoading] = useState(true);

  const fetchAllBids = useCallback(async () => {
    try {
      console.log("[Bids] Fetching all bids...");

      // Fetch bids
      const { data: bidsData, error: bidsError } = await supabase
        .from("bids")
        .select("*")
        .eq("is_active", true)
        .order("amount", { ascending: false });

      if (bidsError) {
        console.error("[Bids] Error fetching all bids:", bidsError);
        return;
      }

      console.log("[Bids] Fetched bids:", bidsData?.length || 0);

      // Get unique user IDs and fetch their usernames
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

      // Transform data to include username
      const bidsWithUsernames = (bidsData || []).map((bid: any) => ({
        ...bid,
        username: usernameMap[bid.user_id] || "Unknown",
      }));

      // Group by script_id
      const grouped: Record<string, BidWithScript[]> = {};
      bidsWithUsernames.forEach((bid) => {
        if (!grouped[bid.script_id]) {
          grouped[bid.script_id] = [];
        }
        grouped[bid.script_id].push(bid);
      });

      // Sort each group by amount descending
      Object.keys(grouped).forEach((scriptId) => {
        grouped[scriptId].sort((a, b) => b.amount - a.amount);
      });

      setBidsByScript(grouped);
    } catch (error) {
      console.error("[Bids] Error in fetchAllBids:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllBids();

    // Subscribe to real-time bid updates for ALL scripts
    console.log("[Bids] Setting up real-time subscription...");
    const subscription = supabase
      .channel("all_bids_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bids",
        },
        (payload) => {
          console.log("[Bids] Real-time update received:", payload.eventType);
          // Refetch all bids when any bid changes
          fetchAllBids();
        }
      )
      .subscribe((status) => {
        console.log("[Bids] Subscription status:", status);
      });

    return () => {
      console.log("[Bids] Cleaning up subscription");
      subscription.unsubscribe();
    };
  }, [fetchAllBids]);

  const getHighestBidForScript = (scriptId: string) => {
    const bids = bidsByScript[scriptId];
    return bids && bids.length > 0 ? bids[0] : null;
  };

  const isUserHighBidderForScript = (scriptId: string) => {
    const highestBid = getHighestBidForScript(scriptId);
    return highestBid?.user_id === user?.id;
  };

  return {
    bidsByScript,
    loading,
    getHighestBidForScript,
    isUserHighBidderForScript,
    refetch: fetchAllBids,
  };
};
