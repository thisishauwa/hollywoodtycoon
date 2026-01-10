import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { ActorContract } from "../types";
import { useAuth } from "../contexts/AuthContext";

interface SupabaseContract {
  id: string;
  actor_id: string;
  studio_id: string;
  start_month: number;
  start_year: number;
  duration_months: number;
  monthly_salary: number;
  signing_bonus: number;
  status: string;
  created_at: string;
}

// Convert Supabase contract to local type
const toContract = (sc: SupabaseContract): ActorContract => ({
  id: sc.id,
  actorId: sc.actor_id,
  studioId: sc.studio_id,
  startMonth: sc.start_month,
  startYear: sc.start_year,
  durationMonths: sc.duration_months as 3 | 6 | 12,
  monthlySalary: sc.monthly_salary,
  signingBonus: sc.signing_bonus,
  status: sc.status as ActorContract["status"],
  createdAt: sc.created_at,
});

export const useContracts = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<ActorContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("actor_contracts")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("[Contracts] Error fetching:", fetchError);
        setError(fetchError.message);
        return;
      }

      setContracts((data || []).map(toContract));
      setError(null);
    } catch (err: any) {
      console.error("[Contracts] Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("contracts_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "actor_contracts",
        },
        (payload) => {
          console.log("[Contracts] Real-time update:", payload.eventType);
          fetchContracts();
        }
      )
      .subscribe((status) => {
        console.log("[Contracts] Subscription status:", status);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchContracts]);

  // Sign an actor to a contract
  const signActor = useCallback(
    async (
      actorId: string,
      durationMonths: 3 | 6 | 12,
      monthlySalary: number,
      signingBonus: number,
      currentMonth: number,
      currentYear: number
    ) => {
      if (!user) return { error: "Not authenticated", contract: null };

      // First, check if actor is available
      const { data: actorData, error: actorError } = await supabase
        .from("actors")
        .select("status, name")
        .eq("id", actorId)
        .single();

      if (actorError || !actorData) {
        return { error: "Actor not found", contract: null };
      }

      if (actorData.status !== "Available") {
        return { error: `${actorData.name} is not available for signing`, contract: null };
      }

      // Check for existing active contract
      const { data: existingContract } = await supabase
        .from("actor_contracts")
        .select("id")
        .eq("actor_id", actorId)
        .eq("status", "active")
        .single();

      if (existingContract) {
        return { error: "Actor already has an active contract", contract: null };
      }

      // Create the contract
      const { data: contractData, error: contractError } = await supabase
        .from("actor_contracts")
        .insert({
          actor_id: actorId,
          studio_id: user.id,
          start_month: currentMonth,
          start_year: currentYear,
          duration_months: durationMonths,
          monthly_salary: monthlySalary,
          signing_bonus: signingBonus,
          status: "active",
        })
        .select()
        .single();

      if (contractError) {
        console.error("[Contracts] Error creating:", contractError);
        return { error: contractError.message, contract: null };
      }

      // Update the actor's status and hired_by
      const { error: updateError } = await supabase
        .from("actors")
        .update({ hired_by: user.id, status: "On Hiatus" })
        .eq("id", actorId);

      if (updateError) {
        console.error("[Contracts] Error updating actor:", updateError);
        // Rollback contract creation
        await supabase.from("actor_contracts").delete().eq("id", contractData.id);
        return { error: updateError.message, contract: null };
      }

      await fetchContracts();
      return { error: null, contract: toContract(contractData) };
    },
    [user, fetchContracts]
  );

  // Terminate a contract early (buy out)
  const terminateContract = useCallback(
    async (contractId: string) => {
      if (!user) return { error: "Not authenticated" };

      const contract = contracts.find((c) => c.id === contractId);
      if (!contract) return { error: "Contract not found" };

      if (contract.studioId !== user.id) {
        return { error: "You can only terminate your own contracts" };
      }

      // Update contract status
      const { error: contractError } = await supabase
        .from("actor_contracts")
        .update({ status: "terminated" })
        .eq("id", contractId);

      if (contractError) {
        console.error("[Contracts] Error terminating:", contractError);
        return { error: contractError.message };
      }

      // Release the actor
      const { error: actorError } = await supabase
        .from("actors")
        .update({ hired_by: null, status: "Available" })
        .eq("id", contract.actorId);

      if (actorError) {
        console.error("[Contracts] Error releasing actor:", actorError);
      }

      await fetchContracts();
      return { error: null };
    },
    [user, contracts, fetchContracts]
  );

  // Process contract expirations for the current game time
  // Returns info about which contracts expired vs were auto-extended
  const processContractExpirations = useCallback(
    async (currentMonth: number, currentYear: number) => {
      const { data, error } = await supabase.rpc("check_contract_expiration", {
        current_month: currentMonth,
        current_year: currentYear,
      });

      if (error) {
        console.error("[Contracts] Error processing expirations:", error);
        return { error: error.message, expired: [], extended: [] };
      }

      await fetchContracts();

      // Parse the result - it's an array with one row containing expired_contracts and extended_contracts
      const result = data?.[0] || { expired_contracts: [], extended_contracts: [] };
      return {
        error: null,
        expired: result.expired_contracts || [],
        extended: result.extended_contracts || [],
      };
    },
    [fetchContracts]
  );

  // Check if an actor has a valid contract with the current user
  // Used to determine if actor can be cast without additional payment
  const canCastActor = useCallback(
    (actorId: string) => {
      if (!user) return false;
      const contract = contracts.find(
        (c) => c.actorId === actorId && c.studioId === user.id && c.status === "active"
      );
      return !!contract;
    },
    [contracts, user]
  );

  // Set actor to "In Production" status when cast in a film
  const setActorInProduction = useCallback(
    async (actorId: string) => {
      const { error } = await supabase
        .from("actors")
        .update({ status: "In Production" })
        .eq("id", actorId);

      if (error) {
        console.error("[Contracts] Error setting actor in production:", error);
        return { error: error.message };
      }
      return { error: null };
    },
    []
  );

  // Release actor from production back to "On Hiatus" (still under contract)
  const releaseActorFromProduction = useCallback(
    async (actorId: string) => {
      // Check if actor still has active contract
      const contract = contracts.find(
        (c) => c.actorId === actorId && c.status === "active"
      );

      const newStatus = contract ? "On Hiatus" : "Available";

      const { error } = await supabase
        .from("actors")
        .update({
          status: newStatus,
          hired_by: contract ? contract.studioId : null,
        })
        .eq("id", actorId);

      if (error) {
        console.error("[Contracts] Error releasing actor from production:", error);
        return { error: error.message };
      }
      return { error: null };
    },
    [contracts]
  );

  // Get contracts for current user
  const getMyContracts = useCallback(() => {
    if (!user) return [];
    return contracts.filter((c) => c.studioId === user.id && c.status === "active");
  }, [contracts, user]);

  // Get contract for a specific actor
  const getActorContract = useCallback(
    (actorId: string) => {
      return contracts.find((c) => c.actorId === actorId && c.status === "active");
    },
    [contracts]
  );

  // Get all active contracts
  const getActiveContracts = useCallback(() => {
    return contracts.filter((c) => c.status === "active");
  }, [contracts]);

  // Calculate remaining months on a contract
  const getRemainingMonths = useCallback(
    (contract: ActorContract, currentMonth: number, currentYear: number) => {
      const startTotal = contract.startYear * 12 + contract.startMonth;
      const endTotal = startTotal + contract.durationMonths;
      const currentTotal = currentYear * 12 + currentMonth;
      return Math.max(0, endTotal - currentTotal);
    },
    []
  );

  // Calculate total contract cost
  const calculateContractCost = useCallback(
    (durationMonths: number, monthlySalary: number, signingBonus: number) => {
      return signingBonus + durationMonths * monthlySalary;
    },
    []
  );

  return {
    contracts,
    loading,
    error,
    signActor,
    terminateContract,
    processContractExpirations,
    getMyContracts,
    getActorContract,
    getActiveContracts,
    getRemainingMonths,
    calculateContractCost,
    canCastActor,
    setActorInProduction,
    releaseActorFromProduction,
    refetch: fetchContracts,
  };
};
