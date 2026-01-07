import { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchAllBids = async () => {
      try {
        const { data, error } = await supabase
          .from("bids")
          .select("*")
          .eq("is_active", true)
          .order("amount", { ascending: false });

        if (error) {
          console.error("Error fetching all bids:", error);
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
        console.error("Error in fetchAllBids:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBids();

    // Subscribe to real-time bid updates for ALL scripts
    const subscription = supabase
      .channel("all_bids")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bids",
        },
        async (payload) => {
          // Refetch all bids when any bid changes
          fetchAllBids();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
  };
};
