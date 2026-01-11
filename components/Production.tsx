import React, { useState } from "react";
import { GameState, Script, Actor, ProjectStatus, ActorTier } from "../types";
import { RetroButton } from "./RetroUI";
import { calculateTotalChemistry } from "../services/gameService";
import { useContracts } from "../hooks/useContracts";
import { useGameState } from "../hooks/useGameState";
import { canHireActorTier, getStudioTier } from "../constants";

interface Props {
  state: GameState;
  onStartProduction: (
    scriptId: string,
    actorIds: string[],
    budget: number,
    marketing: number
  ) => void;
  onCancel: () => void;
}

export const ProductionWizard: React.FC<Props> = ({
  state,
  onStartProduction,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [selectedActors, setSelectedActors] = useState<string[]>([]);
  const [prodBudget, setProdBudget] = useState(1000000);
  const [marketingBudget, setMarketingBudget] = useState(500000);

  // Get contracts and reputation for tier checks
  const { getMyContracts, loading: contractsLoading, error: contractsError } = useContracts();
  const { gameState } = useGameState();

  // Use database reputation if available, fallback to local state
  const studioReputation = gameState?.reputation || state.reputation || 30;
  const studioTierInfo = getStudioTier(studioReputation);

  // Get contracted actor IDs (will be empty if database unavailable)
  const myContracts = getMyContracts();
  const myContractedActorIds = myContracts.map((c) => c.actorId);

  const availableScripts = state.ownedScripts.filter(
    (s) => !state.projects.some((p) => p.scriptId === s.id)
  );

  // Available actors:
  // 1. Contracted actors ("On Hiatus" and in your contracts) - FREE to cast
  // 2. Available actors that meet tier requirements
  const availableActors = state.actors.filter((a) => {
    // Always include your contracted actors (On Hiatus)
    if (myContractedActorIds.includes(a.id) && (a.status === "On Hiatus" || a.status === "Available")) {
      return true;
    }
    // For non-contracted actors, must be Available AND meet tier requirements
    if (a.status === "Available" && canHireActorTier(studioReputation, a.tier as ActorTier)) {
      return true;
    }
    return false;
  });

  // Check if actor is contracted (free to cast)
  const isContractedActor = (actorId: string) => myContractedActorIds.includes(actorId);

  const currentChemistry = calculateTotalChemistry(
    selectedActors,
    state.actors
  );

  const handleNext = () => {
    if (step === 1 && selectedScript) setStep(2);
    else if (
      step === 2 &&
      selectedActors.length >= (selectedScript?.requiredCast || 1)
    )
      setStep(3);
    else if (step === 3)
      onStartProduction(
        selectedScript!.id,
        selectedActors,
        prodBudget,
        marketingBudget
      );
  };

  const toggleActor = (id: string) => {
    if (selectedActors.includes(id))
      setSelectedActors(selectedActors.filter((aid) => aid !== id));
    else if (
      selectedScript &&
      selectedActors.length < selectedScript.requiredCast
    )
      setSelectedActors([...selectedActors, id]);
  };

  // Contracted actors are FREE to cast (already paying monthly salary)
  const totalCost =
    prodBudget +
    marketingBudget +
    selectedActors.reduce((sum, id) => {
      // Contracted actors don't add to cost
      if (isContractedActor(id)) return sum;
      const a = state.actors.find((act) => act.id === id);
      return sum + (a ? a.salary : 0);
    }, 0);

  const getPotentialChemistry = (actorId: string) => {
    if (selectedActors.length === 0) return 0;
    const newCast = selectedActors.includes(actorId)
      ? selectedActors
      : [...selectedActors, actorId];
    const newTotal = calculateTotalChemistry(newCast, state.actors);
    return selectedActors.includes(actorId) ? 0 : newTotal - currentChemistry;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[80vh] flex flex-col bg-[#ece9d8] bevel-outset rounded-t-lg overflow-hidden xp-window-shadow">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-2 h-[28px] shrink-0 select-none xp-title-gradient">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <img
              src="/images/Windows Flag.svg"
              alt=""
              className="w-4 h-4 flex-shrink-0"
            />
            <span
              className="text-white font-bold text-[12px] shadow-black drop-shadow-sm truncate"
              style={{ fontFamily: "Tahoma, sans-serif" }}
            >
              Greenlight Project Wizard
            </span>
          </div>
          <button
            onClick={onCancel}
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
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Sidebar Steps - Horizontal on mobile */}
          <div className="md:w-48 bg-[#d3d3d3] border-b md:border-b-0 md:border-r border-[#808080] p-2 md:p-4 flex flex-row md:flex-col gap-2 md:gap-4 shrink-0 overflow-x-auto no-scrollbar">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex items-center gap-2 shrink-0 ${
                  step === s ? "font-bold text-[#003399]" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs border ${
                    step === s
                      ? "bg-white border-[#003399]"
                      : "bg-gray-200 border-gray-400"
                  }`}
                >
                  {s}
                </div>
                <span className="text-[10px] md:text-sm">
                  {s === 1 ? "Script" : s === 2 ? "Casting" : "Budget"}
                </span>
              </div>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-2 md:p-4 bg-[#ece9d8] flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto bg-white border-2 border-[#808080] p-2 md:p-4 mb-2 md:mb-4 shadow-inner min-h-0">
              {step === 1 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-xs md:text-sm mb-2">
                    Select a Script:
                  </h3>
                  {availableScripts.length === 0 ? (
                    <p className="text-red-500 text-[10px]">
                      No scripts available.
                    </p>
                  ) : null}
                  {availableScripts.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedScript(s)}
                      className={`p-2 md:p-3 border-2 cursor-pointer transition-all ${
                        selectedScript?.id === s.id
                          ? "bg-blue-100 border-blue-500"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-bold text-xs md:text-sm">
                        {s.title}
                      </div>
                      <div className="text-[9px] md:text-xs text-gray-500">
                        {s.genre} | {s.requiredCast} Actors
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {step === 2 && selectedScript && (
                <div className="space-y-2 flex flex-col h-full overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-xs md:text-sm">
                      Cast {selectedScript.requiredCast} Actors:
                    </h3>
                    <div
                      className={`text-[10px] px-1.5 py-0.5 border rounded font-bold ${
                        currentChemistry >= 0
                          ? "bg-green-100 border-green-500 text-green-800"
                          : "bg-red-100 border-red-500 text-red-800"
                      }`}
                    >
                      Chem: {currentChemistry > 0 ? "+" : ""}
                      {currentChemistry}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto pr-1">
                    {availableActors.map((a) => {
                      const chemDiff = getPotentialChemistry(a.id);
                      const isSelected = selectedActors.includes(a.id);
                      const isContracted = isContractedActor(a.id);
                      return (
                        <div
                          key={a.id}
                          onClick={() => toggleActor(a.id)}
                          className={`p-1.5 md:p-2 border cursor-pointer text-[10px] md:text-xs flex gap-2 transition-all ${
                            isSelected
                              ? "bg-blue-100 border-blue-500"
                              : isContracted
                              ? "bg-green-50 border-green-300 hover:border-green-400"
                              : "bg-white border-gray-300 hover:border-blue-300"
                          }`}
                        >
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#0058ee] to-[#003399] flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-white">
                              {a.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="font-bold truncate">{a.name}</div>
                              {chemDiff !== 0 && !isSelected && (
                                <div className="text-[9px]">
                                  {chemDiff > 0 ? "+" : ""}{chemDiff}
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span>{a.tier}</span>
                              {isContracted ? (
                                <span className="text-green-600 font-bold">FREE</span>
                              ) : (
                                <span>${(a.salary / 1000).toFixed(0)}k</span>
                              )}
                            </div>
                            {isContracted && (
                              <div className="text-[8px] text-green-600 font-bold">CONTRACTED</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xs md:text-sm">
                    Project Budgeting:
                  </h3>

                  <div className="bg-[#f0f0f0] p-2 md:p-4 border border-gray-400">
                    <label className="block text-[10px] md:text-xs font-bold mb-1">
                      Production
                    </label>
                    <input
                      type="range"
                      min="100000"
                      max="10000000"
                      step="100000"
                      value={prodBudget}
                      onChange={(e) => setProdBudget(parseInt(e.target.value))}
                      className="w-full h-4"
                    />
                    <div className="text-right font-mono text-[#003399] text-xs md:text-sm font-bold">
                      ${prodBudget.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-[#f0f0f0] p-2 md:p-4 border border-gray-400">
                    <label className="block text-[10px] md:text-xs font-bold mb-1">
                      Marketing
                    </label>
                    <input
                      type="range"
                      min="50000"
                      max="5000000"
                      step="50000"
                      value={marketingBudget}
                      onChange={(e) =>
                        setMarketingBudget(parseInt(e.target.value))
                      }
                      className="w-full h-4"
                    />
                    <div className="text-right font-mono text-[#003399] text-xs md:text-sm font-bold">
                      ${marketingBudget.toLocaleString()}
                    </div>
                  </div>

                  <div className="border-t border-gray-300 pt-3 md:pt-4 text-xs">
                    <div className="flex justify-between">
                      <span>Salaries:</span>
                      <span className="font-mono">
                        $
                        {(
                          totalCost -
                          prodBudget -
                          marketingBudget
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-sm md:text-lg mt-2 border-t pt-2">
                      <span>Total Cost:</span>
                      <span
                        className={
                          totalCost > state.balance
                            ? "text-red-600"
                            : "text-green-700"
                        }
                      >
                        ${totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Controls */}
            <div className="flex justify-between items-center shrink-0">
              <RetroButton
                onClick={onCancel}
                className="text-[10px] md:text-sm"
              >
                Cancel
              </RetroButton>
              <div className="flex gap-1 md:gap-2">
                {step > 1 && (
                  <RetroButton
                    onClick={() => setStep(step - 1)}
                    className="text-[10px] md:text-sm"
                  >
                    Back
                  </RetroButton>
                )}
                <RetroButton
                  variant="primary"
                  onClick={handleNext}
                  className="text-[10px] md:text-sm min-w-[80px]"
                  disabled={
                    (step === 1 && !selectedScript) ||
                    (step === 2 &&
                      selectedActors.length <
                        (selectedScript?.requiredCast || 1)) ||
                    (step === 3 && totalCost > state.balance)
                  }
                >
                  {step === 3 ? "Greenlight" : "Next >"}
                </RetroButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
