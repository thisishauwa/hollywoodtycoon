import React, { useState } from "react";
import { Actor, ActorTier, ActorContract } from "../types";
import { WindowFrame, RetroProgressBar, RetroButton } from "./RetroUI";
import { useActors } from "../hooks/useActors";
import { useContracts } from "../hooks/useContracts";
import { useAuth } from "../contexts/AuthContext";
import { useGameState } from "../hooks/useGameState";
import { getStudioTier, canHireActorTier, getDiscountedSalary } from "../constants";

interface Props {
  actors?: Actor[]; // Optional - will use Supabase if not provided
  onBalanceChange?: (amount: number) => void;
}

interface DetailProps {
  actor: Actor;
  allActors: Actor[];
  onClose: () => void;
  contract?: ActorContract;
  onSignContract?: () => void;
  isMyActor?: boolean;
}

interface ContractModalProps {
  actor: Actor;
  onClose: () => void;
  onSign: (duration: 3 | 6 | 12, monthlySalary: number, signingBonus: number) => Promise<void>;
  isLoading: boolean;
  playerBalance: number;
}

const ContractModal: React.FC<ContractModalProps> = ({
  actor,
  onClose,
  onSign,
  isLoading,
  playerBalance,
}) => {
  const { gameState } = useGameState();
  const studioReputation = gameState?.reputation || 30;
  const studioTierInfo = getStudioTier(studioReputation);

  const [duration, setDuration] = useState<3 | 6 | 12>(6);
  const [signingBonus, setSigningBonus] = useState(Math.floor(actor.salary * 0.5));

  // Monthly salary based on tier and actor's base salary, with studio tier discount
  const baseMonthlySalary = Math.floor(actor.salary / 3); // Per film -> per month
  const discountedMonthlySalary = getDiscountedSalary(baseMonthlySalary, studioReputation);
  const monthlySalary = discountedMonthlySalary;
  const totalCost = signingBonus + duration * monthlySalary;
  const canAfford = playerBalance >= totalCost;

  const durationOptions: { value: 3 | 6 | 12; label: string; discount: number }[] = [
    { value: 3, label: "3 Months", discount: 0 },
    { value: 6, label: "6 Months", discount: 10 },
    { value: 12, label: "12 Months", discount: 20 },
  ];

  const adjustedMonthlySalary = Math.floor(
    monthlySalary * (1 - (durationOptions.find((d) => d.value === duration)?.discount || 0) / 100)
  );
  const adjustedTotal = signingBonus + duration * adjustedMonthlySalary;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4 pointer-events-auto">
      <div className="w-full max-w-md shadow-2xl">
        <WindowFrame title={`Sign ${actor.name} to Contract`} onClose={onClose} showMaximize={false}>
          <div className="bg-[#ece9d8] p-4 flex flex-col gap-4">
            {/* Actor Summary */}
            <div className="flex gap-3 bg-white border border-[#808080] p-3">
              <div className="w-16 h-20 bg-gradient-to-br from-[#0058ee] to-[#003399] flex items-center justify-center shrink-0">
                <span className="text-xl font-black text-white">
                  {actor.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">{actor.name}</h3>
                <p className="text-[10px] text-gray-500">{actor.tier} | Age {actor.age}</p>
                <div className="mt-1 flex gap-2 text-[9px]">
                  <span>Skill: {actor.skill}%</span>
                  <span>Rep: {actor.reputation}%</span>
                </div>
              </div>
            </div>

            {/* Contract Duration */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-600">Contract Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {durationOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDuration(opt.value)}
                    className={`p-2 border-2 text-center transition-all ${
                      duration === opt.value
                        ? "bg-[#0058ee] text-white border-[#003399]"
                        : "bg-white border-[#808080] hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    {opt.discount > 0 && (
                      <div className="text-[9px] text-green-400">{opt.discount}% off</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Signing Bonus */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-600">
                Signing Bonus (Optional)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min={0}
                  max={actor.salary * 2}
                  step={10000}
                  value={signingBonus}
                  onChange={(e) => setSigningBonus(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-mono font-bold w-24 text-right">
                  ${signingBonus.toLocaleString()}
                </span>
              </div>
              <p className="text-[9px] text-gray-500 italic">
                Higher bonus increases actor loyalty and may prevent them from leaving
              </p>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-gray-100 border border-gray-300 p-3 space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-300 pb-1">
                Contract Summary
              </h4>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Base Monthly Salary:</span>
                  <span className="font-mono text-gray-400 line-through">${baseMonthlySalary.toLocaleString()}/mo</span>
                </div>
                {studioTierInfo.salaryDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{studioTierInfo.tier} Discount ({studioTierInfo.salaryDiscount}%):</span>
                    <span className="font-mono">-${(baseMonthlySalary - discountedMonthlySalary).toLocaleString()}/mo</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Your Rate:</span>
                  <span className="font-mono">${adjustedMonthlySalary.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{duration} months</span>
                </div>
                <div className="flex justify-between">
                  <span>Salary Total:</span>
                  <span className="font-mono">
                    ${(duration * adjustedMonthlySalary).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Signing Bonus:</span>
                  <span className="font-mono">${signingBonus.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-1 mt-1">
                  <span>TOTAL COST:</span>
                  <span className={`font-mono ${canAfford ? "text-green-700" : "text-red-600"}`}>
                    ${adjustedTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Your Balance:</span>
                  <span className="font-mono">${playerBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {!canAfford && (
              <div className="bg-red-100 border border-red-400 p-2 text-[10px] text-red-700 font-bold">
                Insufficient funds! You need ${(adjustedTotal - playerBalance).toLocaleString()} more.
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <RetroButton onClick={onClose} disabled={isLoading}>
                Cancel
              </RetroButton>
              <RetroButton
                variant="primary"
                onClick={() => onSign(duration, adjustedMonthlySalary, signingBonus)}
                disabled={!canAfford || isLoading}
              >
                {isLoading ? "Signing..." : "Sign Contract"}
              </RetroButton>
            </div>
          </div>
        </WindowFrame>
      </div>
    </div>
  );
};

// Fallback gossip if actor has no personalized gossip
const FALLBACK_GOSSIP = [
  "No major gossip at the moment. Laying low.",
  "Keeping a surprisingly clean image lately.",
];

const ActorDetailModal: React.FC<DetailProps> = ({
  actor,
  allActors,
  onClose,
  contract,
  onSignContract,
  isMyActor,
}) => {
  const [activeTab, setActiveTab] = useState<"General" | "Career" | "Rumors">(
    "General"
  );
  const { gameState } = useGameState();

  const getGossip = () => {
    // Use real gossip from actor if available
    if (actor.gossip && actor.gossip.length > 0) {
      return actor.gossip.slice(0, 4); // Show up to 4 gossip items
    }
    return FALLBACK_GOSSIP;
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 pointer-events-auto">
      <div className="w-full max-w-md shadow-2xl">
        <WindowFrame
          title={`${actor.name} Properties`}
          onClose={onClose}
          showMaximize={false}
        >
          <div className="bg-[#ece9d8] p-3 flex flex-col gap-3 h-[450px]">
            <div className="flex items-end px-1 gap-1 shrink-0 border-b border-[#808080]">
              {(["General", "Career", "Rumors"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-3 py-1 text-[11px] border-t border-x rounded-t-sm mb-[-1px] relative z-10 transition-all
                    ${
                      activeTab === tab
                        ? "bg-white border-[#808080] border-b-white font-bold"
                        : "bg-[#dcd8c0] border-[#808080] text-gray-700 hover:bg-[#e4e0c8]"
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 bg-white border border-[#808080] p-4 overflow-y-auto shadow-inner">
              {activeTab === "General" && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bevel-inset p-0.5 bg-white shrink-0 w-24 h-32 flex items-center justify-center bg-gradient-to-br from-[#0058ee] to-[#003399]">
                      <span className="text-3xl font-black text-white/90 tracking-tighter">
                        {actor.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="border-b border-gray-200 pb-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase block">
                          Stage Name
                        </label>
                        <span className="text-sm font-bold text-[#003399]">
                          {actor.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold uppercase block">
                            Age
                          </label>
                          <span className="text-xs">{actor.age} years</span>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold uppercase block">
                            Tier
                          </label>
                          <span className="text-xs font-bold">
                            {actor.tier}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">
                      Official Bio
                    </label>
                    <p className="text-xs leading-relaxed text-gray-700 italic border-l-2 border-blue-200 pl-3">
                      {actor.bio}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "Career" && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold text-gray-400 border-b border-gray-100 uppercase pb-1 tracking-widest">
                      Core Performance Metrics
                    </h4>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>Thespian Capability</span>
                          <span>{actor.skill}%</span>
                        </div>
                        <RetroProgressBar progress={actor.skill} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>Marketability Index</span>
                          <span>{actor.reputation}%</span>
                        </div>
                        <RetroProgressBar progress={actor.reputation} />
                      </div>
                    </div>
                  </div>

                  {/* Contract Status */}
                  {contract ? (
                    <div className={`border p-3 rounded shadow-inner ${isMyActor ? "bg-green-50 border-green-300" : "bg-yellow-50 border-yellow-300"}`}>
                      <h4 className="text-[10px] font-bold uppercase mb-2 text-gray-600">
                        Current Contract
                      </h4>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className={`font-bold ${isMyActor ? "text-green-700" : "text-yellow-700"}`}>
                            {isMyActor ? "SIGNED TO YOU" : "UNDER CONTRACT"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Salary:</span>
                          <span className="font-mono">${contract.monthlySalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{contract.durationMonths} months</span>
                        </div>
                        {gameState && (
                          <div className="flex justify-between">
                            <span>Remaining:</span>
                            <span className="font-bold">
                              {Math.max(0, (contract.startYear * 12 + contract.startMonth + contract.durationMonths) - (gameState.year * 12 + gameState.month))} months
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-600 uppercase">
                          Standard Contract Fee
                        </span>
                        <span className="text-lg font-mono font-bold text-green-700">
                          ${actor.salary.toLocaleString()}
                        </span>
                      </div>
                      {actor.status === "Available" && onSignContract && (
                        <RetroButton
                          variant="primary"
                          onClick={onSignContract}
                          className="w-full mt-3"
                        >
                          SIGN TO CONTRACT
                        </RetroButton>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Rumors" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-red-700 border-b border-red-100 uppercase pb-1 tracking-widest">
                      Latest Gossip
                    </h4>
                    <div className="space-y-2">
                      {getGossip().map((msg, i) => (
                        <div
                          key={i}
                          className="bg-red-50 border border-red-100 p-3 text-[11px] italic text-red-900 shadow-sm leading-tight"
                        >
                          "{msg}"
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold text-blue-700 border-b border-blue-100 uppercase pb-1 tracking-widest">
                      Chemistry & Connections
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(actor.relationships).length === 0 ? (
                        <p className="text-[10px] text-gray-400 italic">
                          No public data on industry rivalries or romances.
                        </p>
                      ) : (
                        (Object.entries(actor.relationships) as [string, number][]).map(
                          ([otherId, value]) => {
                            const otherActor = allActors.find(
                              (a) => a.id === otherId
                            );
                            if (!otherActor) return null;
                            return (
                              <div
                                key={otherId}
                                className="flex items-center justify-between bg-blue-50/50 p-2 border border-blue-100 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full border border-blue-200 bg-gradient-to-br from-[#0058ee] to-[#003399] flex items-center justify-center">
                                    <span className="text-[8px] font-black text-white">
                                      {otherActor.name.split(" ").map(n => n[0]).join("")}
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-bold text-gray-700">
                                    {otherActor.name}
                                  </span>
                                </div>
                                <span
                                  className={`text-[10px] font-black ${
                                    value > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {value > 0 ? "SYNCHRONIZED" : "FRICTION"}
                                </span>
                              </div>
                            );
                          }
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 shrink-0 pt-1">
              <RetroButton
                onClick={onClose}
                variant="primary"
                className="min-w-[80px]"
              >
                OK
              </RetroButton>
              <RetroButton onClick={onClose} className="min-w-[80px]">
                Cancel
              </RetroButton>
            </div>
          </div>
        </WindowFrame>
      </div>
    </div>
  );
};

export const ActorDb: React.FC<Props> = ({ actors: propActors, onBalanceChange }) => {
  const { user } = useAuth();
  const { actors: supabaseActors, loading } = useActors();
  const {
    contracts,
    signActor,
    getActorContract,
    getMyContracts,
  } = useContracts();
  const { gameState, updateBalance } = useGameState();

  const [filter, setFilter] = React.useState<ActorTier | "All" | "My Roster">("All");
  const [selectedActor, setSelectedActor] = React.useState<Actor | null>(null);
  const [contractActor, setContractActor] = React.useState<Actor | null>(null);
  const [isSigningContract, setIsSigningContract] = React.useState(false);
  const [signError, setSignError] = React.useState<string | null>(null);

  // Use Supabase actors if no prop provided
  const actors = propActors || supabaseActors;

  // Get my contracted actor IDs
  const myContracts = getMyContracts();
  const myActorIds = myContracts.map((c) => c.actorId);

  // Studio tier for access checks
  const studioReputation = gameState?.reputation || 30;
  const studioTierInfo = getStudioTier(studioReputation);

  const sortedActors = [...actors].sort((a, b) => {
    const scoreA = a.status === "Deceased" ? 2 : a.status === "Retired" ? 1 : 0;
    const scoreB = b.status === "Deceased" ? 2 : b.status === "Retired" ? 1 : 0;
    return scoreA - scoreB;
  });

  if (loading && !propActors) {
    return (
      <div className="h-full flex items-center justify-center bg-[#ece9d8]">
        <p className="text-gray-500 text-sm">Loading talent pool...</p>
      </div>
    );
  }

  // Handle contract signing
  const handleSignContract = async (
    duration: 3 | 6 | 12,
    monthlySalary: number,
    signingBonus: number
  ) => {
    if (!contractActor || !gameState) return;

    setIsSigningContract(true);
    setSignError(null);

    const totalCost = signingBonus + duration * monthlySalary;

    const { error, contract } = await signActor(
      contractActor.id,
      duration,
      monthlySalary,
      signingBonus,
      gameState.month,
      gameState.year
    );

    if (error) {
      setSignError(error);
      setIsSigningContract(false);
      return;
    }

    // Deduct from player balance
    if (updateBalance && gameState) {
      await updateBalance(gameState.balance - totalCost);
    }
    if (onBalanceChange) {
      onBalanceChange(-totalCost);
    }

    setIsSigningContract(false);
    setContractActor(null);
  };

  const filteredActors =
    filter === "All"
      ? sortedActors
      : filter === "My Roster"
      ? sortedActors.filter((a) => myActorIds.includes(a.id))
      : sortedActors.filter((a) => a.tier === filter);

  return (
    <div className="h-full flex flex-col bg-[#ece9d8] overflow-hidden">
      {/* FIXED FILTER HEADER */}
      <div className="flex gap-1 px-2 pt-2 pb-1 bg-[#ece9d8] border-b border-[#808080] overflow-x-auto no-scrollbar shrink-0">
        {/* My Roster filter first */}
        <button
          onClick={() => setFilter("My Roster")}
          className={`px-3 py-1 text-[10px] border-2 transition-all whitespace-nowrap ${
            filter === "My Roster"
              ? "bg-green-100 border-green-500 border-t-green-700 border-l-green-700 font-bold shadow-inner text-green-800"
              : "bg-green-50 border-green-300 border-r-green-500 border-b-green-500 hover:bg-green-100 text-green-700"
          }`}
        >
          My Roster ({myActorIds.length})
        </button>
        <div className="w-px bg-gray-400 mx-1" />
        {["All", ...Object.values(ActorTier)].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t as any)}
            className={`px-3 py-1 text-[10px] border-2 transition-all whitespace-nowrap ${
              filter === t
                ? "bg-white border-[#808080] border-t-[#404040] border-l-[#404040] font-bold shadow-inner"
                : "bg-[#ece9d8] border-white border-r-[#808080] border-b-[#808080] hover:bg-[#f5f5f5]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* SCROLLABLE GRID BODY */}
      <div className="flex-1 min-h-0 flex flex-col bg-[#ece9d8] bevel-outset overflow-hidden mx-2 mb-2">
        <div className="bg-[#0058ee] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0">
          Talent Directory - {filteredActors.length} records
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-3 overflow-y-auto h-full bg-[#f1f1f1]">
          {filteredActors.map((actor) => {
            const isDeceased = actor.status === "Deceased";
            const contract = getActorContract(actor.id);
            const isMyActor = myActorIds.includes(actor.id);
            const canHire = canHireActorTier(studioReputation, actor.tier as ActorTier);
            const isLocked = !canHire && !isMyActor && actor.status === "Available";
            return (
              <div
                key={actor.id}
                className={`bg-[#ece9d8] bevel-outset p-1 ${
                  isDeceased ? "opacity-60" : ""
                } ${isMyActor ? "ring-2 ring-green-500" : ""} ${isLocked ? "opacity-70" : ""}`}
              >
                {/* Title Bar */}
                <div className={`px-2 py-1 flex justify-between items-center mb-1 ${
                  isMyActor
                    ? "bg-gradient-to-r from-green-600 to-green-500 text-white"
                    : "bg-gradient-to-r from-[#0058ee] to-[#0040dd] text-white"
                }`}>
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <span className="text-[10px]">{isMyActor ? "★" : "👤"}</span>
                    <span className="text-[11px] font-bold truncate">
                      {actor.name}
                    </span>
                  </div>
                  <span className="text-[8px] bg-white/20 px-1 rounded shrink-0">
                    {actor.tier}
                  </span>
                </div>

                {/* Content */}
                <div className="bg-white bevel-inset p-2">
                  {/* Status Badge */}
                  <div className="mb-2 flex gap-1 flex-wrap">
                    <div
                      className={`text-[9px] font-bold px-2 py-0.5 border text-center inline-block ${
                        actor.status === "Available"
                          ? "bg-green-100 border-green-500 text-green-700"
                          : actor.status === "In Production"
                          ? "bg-blue-100 border-blue-500 text-blue-700"
                          : actor.status === "On Hiatus"
                          ? "bg-yellow-100 border-yellow-500 text-yellow-700"
                          : actor.status === "Retired"
                          ? "bg-purple-100 border-purple-500 text-purple-700"
                          : actor.status === "Deceased"
                          ? "bg-gray-200 border-gray-600 text-gray-600"
                          : "bg-gray-100 border-gray-400 text-gray-500"
                      }`}
                    >
                      {actor.status.toUpperCase()}
                    </div>
                    {isMyActor && (
                      <div className="text-[9px] font-bold px-2 py-0.5 border bg-green-500 border-green-700 text-white">
                        YOUR ROSTER
                      </div>
                    )}
                    {contract && !isMyActor && (
                      <div className="text-[9px] font-bold px-2 py-0.5 border bg-orange-100 border-orange-500 text-orange-700">
                        CONTRACTED
                      </div>
                    )}
                    {isLocked && (
                      <div className="text-[9px] font-bold px-2 py-0.5 border bg-red-100 border-red-400 text-red-600">
                        TIER LOCKED
                      </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="space-y-1.5 mb-2">
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-gray-500 font-bold uppercase">
                        Age:
                      </span>
                      <span className="font-bold text-gray-700">
                        {actor.age}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-gray-500 font-bold uppercase">
                        Gender:
                      </span>
                      <span className="font-bold text-gray-700">
                        {actor.gender}
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-gray-500 uppercase mb-0.5">
                        <span>Skill</span>
                        <span>{actor.skill}%</span>
                      </div>
                      <RetroProgressBar progress={actor.skill} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-gray-500 uppercase mb-0.5">
                        <span>Reputation</span>
                        <span>{actor.reputation}%</span>
                      </div>
                      <RetroProgressBar progress={actor.reputation} />
                    </div>
                  </div>

                  {/* Visual Description */}
                  {actor.visualDescription && (
                    <div className="text-[8px] text-gray-600 italic mb-2 line-clamp-2">
                      {actor.visualDescription}
                    </div>
                  )}

                  {/* Personality Tags */}
                  {actor.personality && actor.personality.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {actor.personality.slice(0, 3).map((trait, i) => (
                        <span
                          key={i}
                          className="text-[7px] px-1.5 py-0.5 bg-purple-100 text-purple-700 border border-purple-300 rounded-sm font-bold"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Salary */}
                  <div className="border-t border-gray-200 pt-1.5 flex items-center justify-between">
                    <span className="text-[8px] text-gray-500 font-bold uppercase">
                      Salary:
                    </span>
                    <span className="text-sm font-mono font-bold text-[#003399]">
                      ${(actor.salary / 1000).toFixed(0)}K
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => setSelectedActor(actor)}
                      className="flex-1 px-2 py-1 bg-[#ece9d8] border-2 border-white border-r-[#808080] border-b-[#808080] text-[9px] font-bold hover:bg-[#f5f5f5] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
                    >
                      DETAILS
                    </button>
                    {actor.status === "Available" && !contract && !isLocked && (
                      <button
                        onClick={() => setContractActor(actor)}
                        className="flex-1 px-2 py-1 bg-green-100 border-2 border-green-200 border-r-green-500 border-b-green-500 text-[9px] font-bold text-green-700 hover:bg-green-200 active:border-t-green-500 active:border-l-green-500 active:border-r-green-200 active:border-b-green-200"
                      >
                        SIGN
                      </button>
                    )}
                    {isLocked && (
                      <div className="flex-1 px-2 py-1 bg-gray-200 border-2 border-gray-300 text-[8px] font-bold text-gray-500 text-center">
                        {actor.tier === ActorTier.AList ? "Major Studio+" :
                         actor.tier === ActorTier.BList ? "Rising Studio+" :
                         actor.tier === ActorTier.IndieDarling ? "Indie Studio+" : ""}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actor Detail Modal */}
      {selectedActor && (
        <ActorDetailModal
          actor={selectedActor}
          allActors={actors}
          onClose={() => setSelectedActor(null)}
          contract={getActorContract(selectedActor.id)}
          isMyActor={myActorIds.includes(selectedActor.id)}
          onSignContract={
            selectedActor.status === "Available" && !getActorContract(selectedActor.id)
              ? () => {
                  setSelectedActor(null);
                  setContractActor(selectedActor);
                }
              : undefined
          }
        />
      )}

      {/* Contract Signing Modal */}
      {contractActor && gameState && (
        <ContractModal
          actor={contractActor}
          onClose={() => {
            setContractActor(null);
            setSignError(null);
          }}
          onSign={handleSignContract}
          isLoading={isSigningContract}
          playerBalance={gameState.balance}
        />
      )}

      {/* Sign Error Toast */}
      {signError && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[500] bg-red-600 text-white px-4 py-2 rounded shadow-lg text-sm">
          {signError}
          <button
            onClick={() => setSignError(null)}
            className="ml-3 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
