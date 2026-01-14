import React, { useState } from "react";
import { GameState, Script, Actor, ProjectStatus, ActorTier } from "../types";
import { RetroButton } from "./RetroUI";
import { calculateTotalChemistry } from "../services/gameService";
import { useContracts } from "../hooks/useContracts";
import { useGameState } from "../hooks/useGameState";
import { getStudioTier } from "../constants";

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
  const { getMyContracts } = useContracts();
  const { gameState } = useGameState();

  // Use database values if available, fallback to local state
  const studioReputation = gameState?.reputation || state.reputation || 30;
  const studioBalance = gameState?.balance ?? state.balance;

  // Get contracted actor IDs (will be empty if database unavailable)
  const myContracts = getMyContracts();
  const myContractedActorIds = myContracts.map((c) => c.actorId);

  const availableScripts = state.ownedScripts.filter(
    (s) => !state.projects.some((p) => p.scriptId === s.id)
  );

  // Available actors:
  // 1. Contracted actors ("On Hiatus" and in your contracts) - FREE to cast
  // 2. Available actors that meet tier requirements
  // NOTE: For now, we trust the parent component/hooks to filter "Available" status correctly
  // but we enforce the "My Roster" check here for free casting
  const availableActors = state.actors.filter((a) => {
    // Always include your contracted actors (On Hiatus)
    if (myContractedActorIds.includes(a.id) && (a.status === "On Hiatus" || a.status === "Available")) {
      return true;
    }
    // For non-contracted actors, must be Available
    if (a.status === "Available") {
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

  // Wizard Steps Configuration
  const steps = [
    { title: "Script Selection", description: "Choose a script to produce." },
    { title: "Casting", description: "Select actors for your film." },
    { title: "Budgeting", description: "Set production and marketing budgets." },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm font-tahoma">
      <div className="w-[650px] h-[500px] flex flex-col bg-[#ece9d8] border border-[#0055e5] rounded-[3px] shadow-2xl overflow-hidden relative">
        
        {/* Top Window Bar (Blue Gradient) */}
        <div className="h-[30px] flex items-center justify-between px-2 shrink-0 select-none"
             style={{
               background: "linear-gradient(to bottom, #0058ee 0%, #3593ff 4%, #288eff 6%, #127dff 8%, #036ffc 10%, #0262ee 14%, #0057e5 20%, #0054e3 24%, #0055eb 56%, #005bf5 66%, #026afe 76%, #0062ef 86%, #0052d6 92%, #0040ab 94%, #003087 100%)",
               boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)"
             }}>
          <span className="text-white font-bold text-[13px] shadow-sm ml-1" style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.5)" }}>
            Greenlight New Project
          </span>
          <button 
            onClick={onCancel}
            className="w-[21px] h-[21px] bg-[#d73f40] hover:bg-[#e65555] active:bg-[#b02b2c] border border-white/50 rounded-[3px] flex items-center justify-center shadow-sm"
          >
             <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L9 9M9 1L1 9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Wizard Layout */}
        <div className="flex flex-1 overflow-hidden">
            
            {/* Left Sidebar (Dark Blue) */}
            <div className="w-[180px] bg-[#003399] p-4 flex flex-col justify-between shrink-0 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
                     style={{ 
                         backgroundImage: "radial-gradient(circle at top left, white 0%, transparent 60%)" 
                     }}></div>

                <div className="z-10">
                    <h2 className="text-white font-bold text-[18px] mb-6 leading-tight">
                        Production<br/>Wizard
                    </h2>
                    
                    <div className="space-y-4">
                        {steps.map((s, idx) => (
                            <div key={idx} className={`flex items-start gap-2 ${step === idx + 1 ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`mt-1.5 w-2 h-2 rounded-full ${step === idx + 1 ? 'bg-[#ff9900] shadow-[0_0_5px_#ff9900]' : 'bg-white/50'}`}></div>
                                <div className="text-white text-[11px]">
                                    <div className="font-bold">{s.title}</div>
                                    {step === idx + 1 && <div className="text-[10px] opacity-80 leading-tight mt-0.5">{s.description}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="z-10 opacity-30">
                   <img src="/images/High-Res_XP_Icons/Video.ico" className="w-16 h-16 ml-auto -mr-6 -mb-6" alt="" />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                
                {/* Header Banner */}
                <div className="h-[60px] bg-white border-b border-[#dcdcdc] p-4 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="font-bold text-black text-[12px] mb-1">
                            {steps[step-1].title}
                        </h3>
                        <p className="text-[11px] text-[#666666]">
                            {steps[step-1].description}
                        </p>
                    </div>
                    <img src="/images/High-Res_XP_Icons/Video File.ico" className="w-[32px] h-[32px]" alt="" />
                </div>

                {/* Inner Content */}
                <div className="flex-1 p-6 overflow-y-auto bg-[#f0f0f0]">
                    
                    {step === 1 && (
                        <div className="h-full flex flex-col">
                           <label className="text-[11px] mb-2 font-bold block">Select a script from your owned properties:</label>
                           <div className="flex-1 bg-white border border-[#7f9db9] overflow-y-auto p-1">
                                {availableScripts.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-[11px]">No scripts available. Purchase one from the Script Market first.</div>
                                ) : (
                                    availableScripts.map(s => (
                                        <div 
                                            key={s.id}
                                            onClick={() => setSelectedScript(s)}
                                            className={`flex items-center gap-2 p-2 cursor-pointer border hover:bg-[#eef3fb] mb-0.5 ${selectedScript?.id === s.id ? 'bg-[#316ac5] text-white hover:bg-[#316ac5] border-[#316ac5]' : 'bg-white border-transparent'}`}
                                        >
                                            <img src="/images/High-Res_XP_Icons/File.ico" className="w-4 h-4" alt=""/>
                                            <div className="flex-1">
                                                <div className="text-[11px] font-bold">{s.title}</div>
                                                <div className={`text-[10px] ${selectedScript?.id === s.id ? 'text-white/80' : 'text-gray-500'}`}>{s.genre} | Cast: {s.requiredCast}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                           </div>
                        </div>
                    )}

                    {step === 2 && selectedScript && (
                        <div className="h-full flex flex-col gap-4">
                            <div className="bg-white border border-[#7f9db9] p-3 flex-1 overflow-y-auto">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                                    <span className="text-[11px] font-bold">Available Talent</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selectedActors.length >= selectedScript.requiredCast ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        Selected: {selectedActors.length} / {selectedScript.requiredCast}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableActors.map(a => {
                                        const isContracted = isContractedActor(a.id);
                                        const isSelected = selectedActors.includes(a.id);
                                        return (
                                            <div 
                                                key={a.id}
                                                onClick={() => toggleActor(a.id)}
                                                className={`p-2 border cursor-pointer flex gap-2 items-center ${isSelected ? 'bg-[#316ac5] text-white border-[#316ac5]' : 'bg-white hover:bg-[#eef3fb] border-[#dcdcdc]'}`}
                                            >
                                                <div className="w-8 h-8 bg-gray-200 border border-gray-400 shrink-0">
                                                    {/* Placeholder for actor face if needed, or colored box */}
                                                    <div className={`w-full h-full flex items-center justify-center font-bold text-[10px] ${isSelected ? 'text-black' : 'text-gray-500'}`}>
                                                        {a.name.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[11px] font-bold truncate">{a.name}</div>
                                                    <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                                        {a.tier} • {isContracted ? 'FREE' : `$${(a.salary/1000).toFixed(0)}k`}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Chemistry Meter */}
                            <div className="h-8 bg-[#d4d0c8] border border-[#808080] p-1 flex items-center gap-2 relative">
                                <span className="text-[10px] font-bold px-2">Total Chemistry:</span>
                                <div className="flex-1 h-3 bg-white border border-[#808080] relative">
                                    <div 
                                        className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, currentChemistry))}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold min-w-[30px] text-right">{currentChemistry}</span>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="h-full flex flex-col gap-6">
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-[11px] font-bold">Production Quality Budget</label>
                                        <span className="text-[11px] font-mono">${prodBudget.toLocaleString()}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="100000" max="10000000" step="100000" 
                                        value={prodBudget}
                                        onChange={(e) => setProdBudget(parseInt(e.target.value))}
                                        className="w-full h-5 cursor-pointer accent-[#003399]"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Higher budget improves base quality and reduces flop chance.</p>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-[11px] font-bold">Marketing Campaign</label>
                                        <span className="text-[11px] font-mono">${marketingBudget.toLocaleString()}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="50000" max="5000000" step="50000" 
                                        value={marketingBudget}
                                        onChange={(e) => setMarketingBudget(parseInt(e.target.value))}
                                        className="w-full h-5 cursor-pointer accent-[#003399]"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Marketing directly boosts opening weekend box office.</p>
                                </div>
                            </div>

                            <div className="mt-auto bg-[#ffffcc] border border-[#d2c08e] p-3">
                                <div className="flex justify-between text-[11px] mb-1">
                                    <span>Cast Salaries:</span>
                                    <span>${(totalCost - prodBudget - marketingBudget).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[11px] mb-2">
                                    <span>Production & Marketing:</span>
                                    <span>${(prodBudget + marketingBudget).toLocaleString()}</span>
                                </div>
                                <div className="border-t border-[#d2c08e] my-1"></div>
                                <div className="flex justify-between text-[12px] font-bold">
                                    <span>Total Investment:</span>
                                    <span className={totalCost > studioBalance ? 'text-red-600' : 'text-black'}>${totalCost.toLocaleString()}</span>
                                </div>
                                {totalCost > studioBalance && (
                                    <p className="text-red-600 text-[10px] mt-1 font-bold text-center">Insufficient Funds</p>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* Bottom Separator */}
                <div className="h-[2px] bg-white border-b border-[#dcdcdc] mx-4"></div>

                {/* Footer Controls */}
                <div className="h-[50px] flex items-center justify-end gap-2 px-4 shrink-0">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-1 min-w-[75px] bg-[#ece9d8] border border-gray-400 rounded-[3px] text-[11px] hover:bg-gray-100 shadow-[1px_1px_0px_white_inset]"
                    >
                        Cancel
                    </button>
                    <div className="flex gap-2 ml-2">
                         <button 
                            onClick={() => setStep(Math.max(1, step - 1))}
                            disabled={step === 1}
                            className="px-4 py-1 min-w-[75px] bg-[#ece9d8] border border-gray-400 rounded-[3px] text-[11px] hover:bg-gray-100 shadow-[1px_1px_0px_white_inset] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &lt; Back
                        </button>
                        <button 
                            onClick={handleNext}
                            disabled={
                                (step === 1 && !selectedScript) ||
                                (step === 2 && selectedActors.length < (selectedScript?.requiredCast || 1)) ||
                                (step === 3 && totalCost > studioBalance)
                            }
                            className="px-4 py-1 min-w-[75px] bg-[#ece9d8] border border-[#003c74] rounded-[3px] text-[11px] font-bold hover:bg-[#f3f3f3] shadow-[1px_1px_0px_white_inset] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                        >
                            {step === 3 ? "Greenlight" : "Next >"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
