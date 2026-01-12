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
    { value: 3, label: "Short Term (3m)", discount: 0 },
    { value: 6, label: "Standard (6m)", discount: 10 },
    { value: 12, label: "Long Term (12m)", discount: 20 },
  ];

  const adjustedMonthlySalary = Math.floor(
    monthlySalary * (1 - (durationOptions.find((d) => d.value === duration)?.discount || 0) / 100)
  );
  const adjustedTotal = signingBonus + duration * adjustedMonthlySalary;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40 backdrop-blur-[2px] font-tahoma">
      <div className="w-[450px] bg-[#ece9d8] bevel-outset rounded-t-lg rounded-b shadow-2xl flex flex-col xp-window-shadow">
        {/* XP HEADER */}
        <div className="
           flex items-center justify-between px-2 h-[28px] shrink-0 select-none cursor-default
           bg-gradient-to-r from-[#0058ee] to-[#3f8cf3] rounded-t-[3px]
        ">
           <div className="flex items-center gap-1.5">
             <span className="font-bold text-white text-[12px] drop-shadow-sm" style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.5)" }}>
                Contract Negotiation - {actor.name}
             </span>
           </div>
           <div className="flex gap-[2px]">
             <button
                onClick={onClose}
                className="hover:brightness-110 active:brightness-90 transition-all"
                title="Close"
              >
                <img
                  src="/images/close.svg"
                  alt="Close"
                  className="w-[21px] h-[21px]"
                />
              </button>
           </div>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-4">
             {/* ACTOR BANNER */}
              <div className="flex gap-4 p-2 bg-white border border-[#808080] shadow-inner items-center">
                  <div className="w-14 h-14 shrink-0 relative bg-gray-50 flex items-center justify-center border border-gray-100">
                      <img src="/images/ce00f48541fffae4db3ea6a2096246e36e66a774.png" alt="Actor" className="w-12 h-12 object-contain" />
                  </div>
                  <div>
                      <h3 className="font-bold text-[#003399] text-sm">{actor.name}</h3>
                      <div className="text-[10px] text-gray-500">
                        {actor.tier} Talent &bull; Age {actor.age} &bull; Rep: {actor.reputation}%
                      </div>
                  </div>
              </div>

             {/* CONTRACT TERMS GROUPBOX */}
             <fieldset className="border border-[#d0d0bf] p-3 pt-2 rounded-sm relative mt-2 group-box">
                <legend className="text-[11px] px-1 text-[#003399] font-bold absolute -top-2 left-2 bg-[#ece9d8]">
                   Contract Terms
                </legend>
                
                <div className="space-y-4 mt-1">
                    {/* Duration Selection */}
                    <div>
                       <div className="text-[10px] mb-1 font-bold text-gray-600">Duration</div>
                       <div className="flex gap-2">
                          {durationOptions.map((opt) => (
                             <button
                                key={opt.value}
                                onClick={() => setDuration(opt.value)}
                                className={`
                                   flex-1 py-1.5 px-1 border rounded-[3px] text-[10px] shadow-sm transition-all
                                   flex flex-col items-center justify-center gap-0.5
                                   ${duration === opt.value
                                     ? 'bg-gradient-to-b from-[#e3f0fc] to-[#ceebfd] border-[#003c74] ring-1 ring-[#003c74]/20 z-10'
                                     : 'bg-gradient-to-b from-white to-[#f0f0f0] border-[#707070] hover:border-[#003c74]'
                                   }
                                `}
                             >
                                <span className={duration === opt.value ? 'font-bold text-blue-900' : 'text-gray-700'}>
                                   {opt.label}
                                </span>
                                {opt.discount > 0 && (
                                   <span className="text-[9px] text-[#2ea836] font-bold">-{opt.discount}% Rate</span>
                                )}
                             </button>
                          ))}
                       </div>
                    </div>

                    {/* Signing Bonus */}
                    <div>
                       <div className="flex justify-between items-center mb-1">
                          <div className="text-[10px] font-bold text-gray-600">Signing Bonus</div>
                          <div className="text-[10px] text-gray-400 italic">Upfront payment</div>
                       </div>
                       <div className="flex gap-2 items-center bg-white p-1 border border-[#707070] shadow-inner">
                           <input
                              type="range"
                              min={0}
                              max={actor.salary * 1.5}
                              step={5000}
                              value={signingBonus}
                              onChange={(e) => setSigningBonus(Number(e.target.value))}
                              className="flex-1 h-4 accent-[#003399] cursor-pointer"
                           />
                           <div className="font-mono text-xs font-bold w-24 text-right pr-1">
                              ${signingBonus.toLocaleString()}
                           </div>
                       </div>
                    </div>
                </div>
             </fieldset>

             {/* FINANCIAL SUMMARY */}
             <div className="bg-[#FFFFE1] border border-[#a0a090] p-3 text-[11px] shadow-sm">
                 <table className="w-full">
                    <tbody>
                        <tr>
                           <td className="text-gray-500 py-0.5">Monthly Salary:</td>
                           <td className="text-right font-mono py-0.5">${adjustedMonthlySalary.toLocaleString()}</td>
                        </tr>
                        <tr>
                           <td className="text-gray-500 py-0.5">Length:</td>
                           <td className="text-right py-0.5">{duration} Months</td>
                        </tr>
                        <tr className="border-b border-[#a0a090]">
                           <td className="text-gray-500 py-0.5 pb-1">Signing Bonus:</td>
                           <td className="text-right font-mono py-0.5 pb-1">${signingBonus.toLocaleString()}</td>
                        </tr>
                        <tr>
                           <td className="font-bold pt-1.5 text-gray-800">TOTAL COST:</td>
                           <td className={`text-right font-bold font-mono pt-1.5 text-lg ${canAfford ? 'text-[#008000]' : 'text-red-600'}`}>
                              ${adjustedTotal.toLocaleString()}
                           </td>
                        </tr>
                        {!canAfford && (
                           <tr>
                              <td colSpan={2} className="text-center text-[10px] text-red-600 font-bold pt-1">
                                 (Insufficient funds: missing ${(adjustedTotal - playerBalance).toLocaleString()})
                              </td>
                           </tr>
                        )}
                    </tbody>
                 </table>
             </div>
        </div>

        {/* FOOTER */}
        <div className="p-3 flex justify-end gap-2 bg-[#ece9d8] border-t border-white rounded-b-lg">
           <button 
              onClick={onClose} 
              className="min-w-[70px] px-3 py-1 bg-white border border-[#003c74] rounded-[3px] text-[11px] hover:bg-gray-50 shadow-sm transition-all"
           >
             Cancel
           </button>
           <RetroButton
              variant="primary"
              onClick={() => onSign(duration, adjustedMonthlySalary, signingBonus)}
              disabled={!canAfford || isLoading}
           >
              {isLoading ? "Signing..." : "Sign Contract"}
           </RetroButton>
        </div>
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
  const [activeTab, setActiveTab] = useState<"General" | "Career" | "Gossip" | "Contract">("General");
  const { gameState } = useGameState();

  // Fallback gossip
  const gossipList = (actor.gossip && actor.gossip.length > 0) ? actor.gossip : ["No recent rumors."];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/20 backdrop-blur-[1px] font-sans">
      <div className="w-[450px] bg-[#ece9d8] bevel-outset rounded-t-lg rounded-b shadow-2xl flex flex-col xp-window-shadow">
        {/* XP HEADER */}
        <div className="
           flex items-center justify-between px-2 h-[28px] shrink-0 select-none cursor-default
           bg-gradient-to-r from-[#0058ee] to-[#3f8cf3] rounded-t-[3px]
        ">
           <div className="flex items-center gap-1.5">
             {/* Optional Window Icon */}
             <span className="font-bold text-white text-[12px] drop-shadow-sm" style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.5)" }}>
                {actor.name} Properties
             </span>
           </div>
           <div className="flex gap-[2px]">
             <button
                onClick={onClose}
                className="hover:brightness-110 active:brightness-90 transition-all"
                title="Close"
              >
                <img
                  src="/images/close.svg"
                  alt="Close"
                  className="w-[21px] h-[21px]"
                />
              </button>
           </div>
        </div>

        {/* TABS */}
        <div className="px-3 pt-3 flex items-end">
          {(["General", "Career", "Gossip", "Contract"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-1.5 text-[11px] border-t border-x rounded-t-md mr-1 mb-[-1px] relative z-10 transition-all
                ${
                  activeTab === tab
                    ? "bg-white border-[#808080] border-b-white font-bold"
                    : "bg-[#d8d4bf] border-[#808080] text-gray-700 hover:bg-[#e4e0c8]"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 p-4 bg-white m-3 mt-0 border border-[#808080] shadow-inner h-[380px] overflow-y-auto">
          
          {activeTab === "General" && (
            <div className="flex gap-4">
              {/* Left Column: Photo & Basic Stats */}
              <div className="w-28 shrink-0 flex flex-col gap-2">
                 <div className="w-28 h-32 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 shadow-inner flex items-center justify-center">
                    <img src="/images/ce00f48541fffae4db3ea6a2096246e36e66a774.png" alt="Actor" className="w-20 h-20 object-contain" />
                 </div>
                 <div className="text-[10px] space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Age:</span>
                        <span>{actor.age}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Gender:</span>
                        <span>{actor.gender || 'N/A'}</span> {/* Added fallback for gender */}
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className={`font-bold ${actor.status === 'Available' ? 'text-green-700' : 'text-gray-700'}`}>
                            {actor.status}
                        </span>
                    </div>
                 </div>
              </div>

              {/* Right Column: Info */}
              <div className="flex-1 space-y-3">
                 <div className="border-b border-gray-200 pb-2">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Full Name</div>
                    <div className="text-sm font-bold text-gray-800">{actor.name}</div>
                    <div className="text-[10px] text-blue-600">{actor.tier} Talent</div>
                 </div>

                 <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Attributes</div>
                    <div className="space-y-2">
                        <div>
                            <div className="flex justify-between text-[10px] mb-0.5">
                                <span>Acting Skill</span>
                                <span>{actor.skill}/100</span>
                            </div>
                            <div className="h-2 bg-gray-200 border border-gray-300 rounded-sm overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${actor.skill}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] mb-0.5">
                                <span>Star Power</span>
                                <span>{actor.reputation}/100</span>
                            </div>
                            <div className="h-2 bg-gray-200 border border-gray-300 rounded-sm overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600" style={{ width: `${actor.reputation}%` }} />
                            </div>
                        </div>
                    </div>
                 </div>

                 <div>
                     <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Personality</div>
                     <div className="flex flex-wrap gap-1">
                        {actor.personality.map((p, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 text-[9px] rounded text-gray-600">
                                {p}
                            </span>
                        ))}
                     </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === "Career" && (
            <div className="space-y-3">
               <div className="bg-yellow-50 border border-yellow-200 p-2 text-[10px] text-gray-700 rounded mb-2">
                  <span className="font-bold">Bio:</span> {actor.bio || "No biography available."}
               </div>
               
               <h4 className="text-[10px] font-bold text-gray-500 uppercase border-b border-gray-200 pb-1">Known For Genres</h4>
               <div className="flex gap-2">
                  {actor.genres.map(g => (
                      <span key={g} className="px-2 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-[10px] rounded shadow-sm">
                          {g}
                      </span>
                  ))}
               </div>

                <div className="mt-4">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase border-b border-gray-200 pb-1 mb-2">Filmography Stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-gray-50 p-2 border border-gray-200">
                            <span className="block text-gray-500">Primary Genre</span>
                            <span className="font-bold text-gray-800">{actor.genres[0]}</span>
                        </div>
                        {/* Placeholder for more stats if we had them */}
                        <div className="bg-gray-50 p-2 border border-gray-200 text-gray-400 italic">
                             No extensive history
                        </div>
                    </div>
                </div>
            </div>
          )}

          {activeTab === "Gossip" && (
             <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-gray-700 border-b border-gray-200 pb-1">Industry Rumors</h4>
                {gossipList.map((g, i) => (
                    <div key={i} className="flex gap-2 items-start p-2 bg-white border border-gray-100 hover:bg-gray-50">
                        <span className="text-red-500 mt-1">❝</span>
                        <p className="text-[11px] text-gray-600 italic leading-relaxed">{g}</p>
                    </div>
                ))}
             </div>
          )}

          {activeTab === "Contract" && (
             <div className="h-full flex flex-col pt-2">
                {contract ? (
                    <div className="bg-green-50 border border-green-200 p-4 rounded text-center space-y-2">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xl">
                            ✓
                        </div>
                        <h3 className="font-bold text-green-800">Under Contract</h3>
                        <p className="text-[11px] text-green-700">
                            Signed until {gameState ? `${contract.startYear + Math.floor((contract.startMonth + contract.durationMonths - 1) / 12)} (Month ${((contract.startMonth + contract.durationMonths - 1) % 12) + 1})` : 'Unknown'}
                        </p>
                        <div className="inline-block px-3 py-1 bg-white border border-green-300 rounded text-xs font-mono font-bold text-green-700">
                            ${contract.monthlySalary.toLocaleString()}/mo
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-4 my-auto">
                        <div className="space-y-1">
                            <p className="text-[11px] text-gray-500 uppercase font-bold">Standard Market Rate</p>
                            <p className="text-2xl font-mono font-bold text-gray-700">${actor.salary.toLocaleString()}</p>
                        </div>
                        
                        {actor.status === 'Available' ? (
                            <div className="bg-blue-50 p-3 rounded border border-blue-100 text-[11px] text-blue-800">
                                This actor is available for hire. Negotiating a contract will require a signing bonus and monthly salary.
                            </div>
                        ) : (
                             <div className="bg-red-50 p-3 rounded border border-red-100 text-[11px] text-red-800">
                                This actor is currently {actor.status} and cannot be hired.
                             </div>
                        )}

                        {actor.status === 'Available' && onSignContract && (() => {
                          const studioRep = gameState?.reputation || 30;
                          const studioTier = getStudioTier(studioRep);
                          
                          // Use existing hiring restriction logic
                          const canHire = canHireActorTier(studioRep, actor.tier);

                          if (!canHire) {
                            return (
                              <div className="bg-amber-50 p-3 rounded border border-amber-200 text-[11px] text-amber-900">
                                <div className="font-bold mb-1">⚠️ {studioTier.tier} Cannot Hire {actor.tier}</div>
                                <div className="mb-1">{studioTier.description}</div>
                                <div className="text-[10px] mt-1 text-amber-700">
                                  Allowed: {studioTier.allowedActorTiers.join(', ')}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <button 
                              onClick={onSignContract}
                              className="px-6 py-2 bg-gradient-to-b from-green-500 to-green-600 border border-green-700 text-white font-bold shadow-sm active:translate-y-px rounded-[3px]"
                            >
                              Negotiate Contract...
                            </button>
                          );
                        })()}
                    </div>
                )}
             </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-3 flex justify-end gap-2 bg-[#ece9d8] border-t border-white rounded-b-lg">
           <button onClick={onClose} className="min-w-[70px] px-3 py-1 bg-white border border-[#003c74] rounded-[3px] text-[11px] hover:bg-gray-50 shadow-sm">
             OK
           </button>
        </div>
      </div>
    </div>
  );
};

export const ActorDb: React.FC<Props> = ({ actors: propActors, onBalanceChange }) => {
  const { user } = useAuth();
  const { actors: supabaseActors, loading } = useActors();
  const { createContract, signActor, getActorContract, getMyContracts } = useContracts();
  const { gameState, updateBalance } = useGameState();

  const [filter, setFilter] = React.useState<ActorTier | "All" | "My Roster">("All");
  const [selectedActor, setSelectedActor] = React.useState<Actor | null>(null);
  const [contractActor, setContractActor] = React.useState<Actor | null>(null);
  const [isSigningContract, setIsSigningContract] = React.useState(false);
  const [signError, setSignError] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list"); // Default to list

  const actors = propActors || supabaseActors;
  const myContracts = getMyContracts();
  const myActorIds = myContracts.map((c) => c.actorId);
  const studioReputation = gameState?.reputation || 30;

  const sortedActors = [...actors].sort((a, b) => {
    // Basic sort: My actors first, then Tier, then Rep
    if (myActorIds.includes(a.id) && !myActorIds.includes(b.id)) return -1;
    if (!myActorIds.includes(a.id) && myActorIds.includes(b.id)) return 1;
    return 0; // Keeping original order for others or refine further
  });

  // CRITICAL: Filter out deceased and retired actors - they should never appear in available talent
  const availableActors = sortedActors.filter(a => 
    a.status !== "Deceased" && a.status !== "Retired"
  );

  const filteredActors = filter === "All"
      ? availableActors
      : filter === "My Roster"
      ? availableActors.filter((a) => myActorIds.includes(a.id))
      : availableActors.filter((a) => a.tier === filter);

  if (loading && !propActors) {
    return (
      <div className="h-full flex items-center justify-center bg-[#ece9d8]">
        <p className="text-gray-500 text-sm">Loading talent pool...</p>
      </div>
    );
  }

  // Handle contract signing logic (same as before)
  const handleSignContract = async (duration: 3 | 6 | 12, monthlySalary: number, signingBonus: number) => {
    if (!contractActor || !gameState) return;
    setIsSigningContract(true);
    setSignError(null);
    const totalCost = signingBonus + duration * monthlySalary;

    const { error, contract } = await signActor(
      contractActor.id, duration, monthlySalary, signingBonus, gameState.month, gameState.year
    );

    if (error) {
      setSignError(error);
      setIsSigningContract(false);
      return;
    }

    if (updateBalance && gameState) await updateBalance(gameState.balance - totalCost);
    if (onBalanceChange) onBalanceChange(-totalCost);

    setIsSigningContract(false);
    setContractActor(null);
  };

  return (
    <div className="h-full flex bg-[#ece9d8] font-tahoma text-[11px]">
      {/* WINDOWS XP SIDEBAR */}
      <div className="w-48 flex flex-col gap-3 p-3 bg-gradient-to-b from-[#7b9fe9] to-[#6079d6] border-r border-[#003399] overflow-y-auto shrink-0">
        <div className="bg-white rounded-t-sm rounded-b-sm overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1 flex justify-between items-center cursor-pointer">
             <span className="font-bold text-white">Talent Tasks</span>
          </div>
          <div className="bg-[#d6dff7] p-2 flex flex-col gap-1 text-[#215dc6]">
            <button 
                onClick={() => setFilter("All")}
                className={`text-left hover:underline px-1 py-0.5 ${filter === "All" ? "font-bold" : ""}`}
            >
                View all actors
            </button>
            <button 
                onClick={() => setFilter("My Roster")}
                className={`text-left hover:underline px-1 py-0.5 ${filter === "My Roster" ? "font-bold" : ""}`}
            >
                View my roster
            </button>
          </div>
        </div>

        <div className="bg-white rounded-t-sm rounded-b-sm overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1 flex justify-between items-center cursor-pointer">
             <span className="font-bold text-white">Filter by Tier</span>
          </div>
          <div className="bg-[#d6dff7] p-2 flex flex-col gap-1 text-[#215dc6]">
             {Object.values(ActorTier).map((t) => (
                <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`text-left hover:underline px-1 py-0.5 flex items-center gap-2 ${filter === t ? "font-bold" : ""}`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${filter === t ? "bg-[#215dc6]" : "bg-[#215dc6]/50"}`} />
                    {t}
                </button>
             ))}
          </div>
        </div>
      </div>

      {/* MAIN VIEW */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* TOOLBAR/ADDRESS */}
        <div className="h-8 bg-[#ece9d8] border-b border-[#808080] flex items-center px-2 gap-2 shadow-sm z-10">
            <span className="text-gray-500">Address:</span>
            <div className="flex-1 bg-white border border-[#808080] h-5 flex items-center px-1 shadow-inner">
                Database/{filter}
            </div>
            <div className="w-px h-4 bg-gray-400 mx-1" />
            <div className="flex gap-1">
                <button 
                   onClick={() => setViewMode("list")}
                   className={`p-1 border ${viewMode === 'list' ? 'bg-white border-gray-400' : 'border-transparent hover:border-gray-300'}`}
                   title="List View"
                >
                   <div className="w-3 h-3 flex flex-col justify-between">
                       <div className="h-px bg-black w-full" />
                       <div className="h-px bg-black w-full" />
                       <div className="h-px bg-black w-full" />
                   </div>
                </button>
                <button 
                   onClick={() => setViewMode("grid")}
                   className={`p-1 border ${viewMode === 'grid' ? 'bg-white border-gray-400' : 'border-transparent hover:border-gray-300'}`}
                   title="Grid View"
                >
                   <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                       <div className="bg-black" />
                       <div className="bg-black" />
                       <div className="bg-black" />
                       <div className="bg-black" />
                   </div>
                </button>
            </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-scroll max-h-[calc(100vh-200px)]">
            {viewMode === "list" ? (
                <table className="w-full text-left border-collapse cursor-default">
                    <thead className="sticky top-0 bg-[#ece9d8] z-10 shadow-sm">
                        <tr>
                            <th className="border-b border-r border-[#d4d0c8] px-2 py-0.5 font-normal text-gray-600 w-8"></th>
                            <th className="border-b border-r border-[#d4d0c8] px-2 py-0.5 font-normal text-gray-600">Name</th>
                            <th className="border-b border-r border-[#d4d0c8] px-2 py-0.5 font-normal text-gray-600 w-24">Tier</th>
                            <th className="border-b border-r border-[#d4d0c8] px-2 py-0.5 font-normal text-gray-600 w-12">Age</th>
                            <th className="border-b border-r border-[#d4d0c8] px-2 py-0.5 font-normal text-gray-600 w-24">Status</th>
                            <th className="border-b border-r border-[#d4d0c8] px-2 py-0.5 font-normal text-gray-600 w-16 text-right">Skill</th>
                            <th className="border-b border-r border-[#d4d0c8] px-2 py-0.5 font-normal text-gray-600 w-16 text-right">Rep</th>
                            <th className="border-b border-[#d4d0c8] px-2 py-0.5 font-normal text-gray-600 w-24 text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {filteredActors.map((actor, idx) => {
                            const isMyActor = myActorIds.includes(actor.id);
                            return (
                                <tr 
                                    key={actor.id}
                                    onClick={() => setSelectedActor(actor)}
                                    className={`
                                        group border-b border-gray-100 last:border-0 hover:bg-[#e0e8f5]
                                        ${selectedActor?.id === actor.id ? '!bg-[#316ac5] !text-white' : idx % 2 === 0 ? 'bg-white' : 'bg-[#f7f7f7]'}
                                    `}
                                >
                                    <td className="px-2 py-1 text-center">
                                        {isMyActor ? <span className="text-yellow-500">★</span> : <span className="text-gray-400">👤</span>}
                                    </td>
                                    <td className="px-2 py-1 font-bold">{actor.name}</td>
                                    <td className="px-2 py-1">{actor.tier}</td>
                                    <td className="px-2 py-1">{actor.age}</td>
                                    <td className="px-2 py-1 font-bold">
                                        <span className={
                                            selectedActor?.id === actor.id ? 'text-white' :
                                            actor.status === 'Available' ? 'text-green-600' : 
                                            actor.status === 'Retired' ? 'text-red-500' : 'text-gray-500'
                                        }>
                                            {actor.status}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1 text-right">{actor.skill}</td>
                                    <td className="px-2 py-1 text-right">{actor.reputation}</td>
                                    <td className="px-2 py-1 text-right font-mono text-[10px] opacity-90">
                                        ${(actor.salary / 1000).toFixed(0)}k
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                     {filteredActors.map(actor => (
                         <div 
                            key={actor.id} 
                            onClick={() => setSelectedActor(actor)}
                            className="bg-white border p-2 flex gap-2 items-center hover:bg-blue-50 cursor-pointer shadow-sm"
                         >
                            <div className="w-10 h-10 bg-gray-200 flex items-center justify-center">
                                <img src="/images/ce00f48541fffae4db3ea6a2096246e36e66a774.png" alt="Actor" className="w-8 h-8 object-contain" />
                            </div>
                            <div className="min-w-0">
                                <div className="font-bold truncate">{actor.name}</div>
                                <div className="text-[10px] text-gray-500">{actor.tier}</div>
                            </div>
                         </div>
                     ))}
                </div>
            )}
        </div>
      </div>

      {/* MODALS */}
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
                  setContractActor(selectedActor);
                  // Don't close details yet, maybe? Or close it.
                  // Usually properties dialog closes if you start an action.
                  // But user might want to check stats while signing.
                  // Let's close Details when opening Sign.
                  setSelectedActor(null);
                }
              : undefined
          }
        />
      )}

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

      {/* ERROR TOAST */}
      {signError && (
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[500] bg-red-600 text-white px-3 py-1.5 rounded shadow-lg text-xs">
          Error: {signError}
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
