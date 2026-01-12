import React, { useState, useMemo, useEffect } from "react";
import { Script } from "../types";
import { RetroButton, RetroInput } from "./RetroUI";
import { useScripts } from "../hooks/useScripts";
import { useBids } from "../hooks/useBids";
import { useAllBids } from "../hooks/useAllBids";
import { useGameState } from "../hooks/useGameState";
import { useOwnedScripts } from "../hooks/useOwnedScripts";
import { supabase } from "../lib/supabase";

// Countdown timer component for bids
const BidCountdown: React.FC<{ expiresAt: string }> = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      return Math.max(0, Math.floor((expiry - now) / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (timeLeft <= 0) {
    return <span className="text-red-600 font-bold animate-pulse">CLOSING...</span>;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <span className={`font-mono font-bold ${timeLeft <= 10 ? "text-red-600 animate-pulse" : "text-orange-600"}`}>
      {minutes}:{seconds.toString().padStart(2, "0")}
    </span>
  );
};

const GENRES = ["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi", "Thriller"];

interface DetailProps {
  script: Script;
  isOwned: boolean;
  onClose: () => void;
  // We handle bidding internally with hooks
  refetchAllBids: () => void;
  highestBidAmount: number;
  highBidderName: string;
}

const ScriptDetailModal: React.FC<DetailProps> = ({
  script,
  isOwned,
  onClose,
  refetchAllBids,
  highestBidAmount,
  highBidderName
}) => {
  const [activeTab, setActiveTab] = useState<"General" | "Plot" | "Market">("General");
  const { gameState, loading: gameStateLoading } = useGameState();
  
  // Bidding Hook
  const { placing, placeBid } = useBids(script.id);
  const [bidAmount, setBidAmount] = useState<number>(highestBidAmount + 50000);

  const handlePlaceBid = async () => {
    if (!bidAmount) return;
    const { error } = await placeBid(script.id, bidAmount);
    if (error) {
      alert(`Failed to place bid: ${error}`);
      return;
    }
    await refetchAllBids();
    onClose(); // Close on success? Or maybe stay open? Let's close for now to return to explorer.
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/20 backdrop-blur-[1px] font-sans">
      <div className="w-[450px] bg-[#ece9d8] bevel-outset rounded-t-lg rounded-b shadow-2xl flex flex-col xp-window-shadow">
        {/* XP HEADER */}
        <div className="
           flex items-center justify-between px-2 h-[28px] shrink-0 select-none cursor-default
           bg-gradient-to-r from-[#0058ee] to-[#3f8cf3] rounded-t-[3px]
        ">
           <div className="flex items-center gap-1.5">
             <span className="font-bold text-white text-[12px] drop-shadow-sm" style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.5)" }}>
                {script.title} Properties
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
          {(["General", "Plot", isOwned ? "Rights" : "Market"] as const).map((tab) => (
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

        {/* CONTENT */}
        <div className="flex-1 p-4 bg-white m-3 mt-0 border border-[#808080] shadow-inner h-[320px] overflow-y-auto">
          {activeTab === "General" && (
             <div className="flex gap-4">
                <div className="w-20 shrink-0 flex flex-col items-center gap-2">
                   <div className="w-16 h-20 bg-yellow-50 border border-yellow-200 shadow-sm flex items-center justify-center">
                      <img src="/images/a452f2899a0222d68b78c6d0316b8e5b4001de15.png" alt="Script" className="w-12 h-12 object-contain" />
                   </div>
                   <div className="text-[10px] text-center font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {script.genre}
                   </div>
                </div>
                <div className="flex-1 space-y-3">
                   <div className="border-b border-gray-200 pb-2">
                      <div className="text-[10px] text-gray-500 uppercase font-bold">Project Title</div>
                      <div className="text-sm font-bold text-gray-800">{script.title}</div>
                      <div className="text-[10px] text-gray-500 italic">"{script.tagline}"</div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2">
                      <div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold">Script Quality</div>
                          <div className="h-3 bg-gray-200 border border-gray-300 rounded-sm overflow-hidden mt-1">
                              <div className="h-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${script.quality}%` }} />
                          </div>
                          <div className="text-[9px] text-right text-gray-500">{script.quality}/100</div>
                      </div>
                      <div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold">Complexity</div>
                          <div className="h-3 bg-gray-200 border border-gray-300 rounded-sm overflow-hidden mt-1">
                              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${script.complexity}%` }} />
                          </div>
                      </div>
                   </div>

                   <div>
                       <div className="text-[10px] text-gray-500 uppercase font-bold">Tone</div>
                       <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px]">
                          {script.tone}
                       </span>
                   </div>
                </div>
             </div>
          )}

          {activeTab === "Plot" && (
             <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-gray-700 border-b border-gray-200 pb-1">Logline</h4>
                <div className="p-3 bg-gray-50 border border-gray-200 text-[11px] leading-relaxed italic text-gray-800">
                   {script.description}
                </div>
                
                <div className="pt-2">
                    <h4 className="text-[11px] font-bold text-gray-700 border-b border-gray-200 pb-1 mb-2">Requirements</h4>
                    <ul className="list-disc list-inside text-[11px] text-gray-600 space-y-1">
                       <li>Required Cast Size: <span className="font-bold">{script.requiredCast} actors</span></li>
                       <li>Estimated Budget Base: <span className="font-bold text-green-700">${script.baseCost.toLocaleString()}</span></li>
                       <li>Genre: {script.genre}</li>
                    </ul>
                </div>
             </div>
          )}

          {activeTab === "Market" && !isOwned && (
             <div className="space-y-4 pt-2">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded text-center">
                    <div className="text-[10px] text-blue-600 uppercase font-bold mb-1">Current High Bid</div>
                    <div className="text-2xl font-mono font-bold text-blue-800">
                        ${highestBidAmount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                        High Bidder: <span className="font-bold text-gray-700">{highBidderName || "None"}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-700 block">Place Your Bid ($)</label>
                    <div className="flex gap-2">
                        <input 
                           type="number" 
                           value={bidAmount}
                           onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                           className="flex-1 border-2 border-gray-300 p-1 font-mono text-sm focus:border-blue-500 outline-none"
                           min={highestBidAmount + 1}
                        />
                        <RetroButton 
                           onClick={handlePlaceBid}
                           disabled={placing || bidAmount <= highestBidAmount || (gameState && gameState.balance < bidAmount)}
                           variant="primary"
                           isLoading={placing}
                        >
                           BID NOW
                        </RetroButton>
                    </div>
                    {gameState && gameState.balance < bidAmount && (
                        <p className="text-[10px] text-red-600 font-bold">Insufficient funds ({gameState.balance.toLocaleString()})</p>
                    )}
                    {bidAmount <= highestBidAmount && (
                        <p className="text-[10px] text-red-600">Bid must be higher than current value.</p>
                    )}
                </div>
             </div>
          )}

          {activeTab === "Rights" && isOwned && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl">
                      ✓
                  </div>
                  <h3 className="text-lg font-bold text-green-800">Rights Acquired</h3>
                  <p className="text-[11px] text-gray-600 max-w-[200px]">
                      Your studio owns the exclusive production rights to this script.
                  </p>
                  <div className="inline-block px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold rounded">
                      Ready for Pre-Production
                  </div>
              </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 flex justify-end gap-2 bg-[#ece9d8] border-t border-white rounded-b-lg">
           <button onClick={onClose} className="min-w-[70px] px-3 py-1 bg-white border border-[#003c74] rounded-[3px] text-[11px] hover:bg-gray-50 shadow-sm">
             Close
           </button>
        </div>
      </div>
    </div>
  );
};

export const ScriptMarketMultiplayer: React.FC = () => {
  const { scripts: marketScripts, loading: scriptsLoading } = useScripts();
  const { ownedScripts, loading: ownedLoading } = useOwnedScripts();
  const { bidsByScript, getHighestBidForScript, refetch: refetchAllBids } = useAllBids();
  
  const [filter, setFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  // Immediately close any expired auctions when component mounts
  useEffect(() => {
    const closeExpiredAuctions = async () => {
      const { error } = await supabase.rpc("close_expired_auctions");
      if (error) {
        console.error("[ScriptMarket] Error closing expired auctions:", error);
      } else {
        console.log("[ScriptMarket] Checked for expired auctions");
      }
    };
    closeExpiredAuctions();
  }, []);

  // Create set of owned script IDs for fast lookup
  const ownedScriptIds = useMemo(() =>
    new Set(ownedScripts.map(s => s.script_id)),
    [ownedScripts]
  );

  // Merge scripts for display logic
  // Filter out owned scripts from market to prevent duplicates
  const allScripts = useMemo(() => {
     // Only show scripts in market if they're NOT owned by this user
     const market = marketScripts
        .filter(s => !ownedScriptIds.has(s.id))
        .map(s => ({
           id: s.id,
           title: s.title,
           genre: s.genre as any,
           quality: s.quality,
           baseCost: s.base_cost,
           currentBid: s.base_cost, // Default to base cost if no bids
           highBidderId: null,
           description: s.description,
           tagline: s.tagline,
           complexity: s.complexity,
           tone: s.tone as any,
           requiredCast: s.required_cast,
           status: 'Market' as const
        }));

     const owned = ownedScripts.map(s => ({
        id: s.script_id,
        title: s.title,
        genre: s.genre as any,
        quality: s.quality,
        baseCost: s.purchase_price,
        currentBid: s.purchase_price,
        highBidderId: 'player',
        description: s.description,
        tagline: s.tagline,
        complexity: s.complexity,
        tone: s.tone as any,
        requiredCast: s.required_cast,
        status: 'Owned' as const
     }));
     return [...market, ...owned] as (Script & { status: string })[];
  }, [marketScripts, ownedScripts, ownedScriptIds]);

  const displayScripts = useMemo(() => {
     if (filter === "My Portfolio") return allScripts.filter(s => s.status === 'Owned');
     
     // Market logic
     const activeMarket = allScripts.filter(s => s.status === 'Market');
     if (filter === "All") return activeMarket;
     return activeMarket.filter(s => s.genre === filter);
  }, [allScripts, filter]);

  // Sidebar Feed Logic
  const allBidsFlat = useMemo(() => {
    const allBids: Array<{ id: string; script_id: string; username: string; amount: number; created_at: string; expires_at: string; scriptTitle?: string }> = [];
    Object.entries(bidsByScript).forEach(([scriptId, bids]) => {
      const script = marketScripts.find(s => s.id === scriptId);
      bids.forEach(bid => {
        allBids.push({
          ...bid,
          scriptTitle: script?.title || "Unknown Script",
        });
      });
    });
    return allBids.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [bidsByScript, marketScripts]);

  if (scriptsLoading || ownedLoading) {
     return <div className="p-4 text-center text-gray-500">Loading Market Data...</div>;
  }

  return (
    <div className="h-full flex bg-[#ece9d8] font-tahoma text-[11px]">
      {/* WINDOWS XP SIDEBAR */}
      <div className="w-48 flex flex-col gap-3 p-3 bg-gradient-to-b from-[#7b9fe9] to-[#6079d6] border-r border-[#003399] overflow-y-auto shrink-0">
        
        {/* TASKS BOX */}
        <div className="bg-white rounded-t-sm rounded-b-sm overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1 flex justify-between items-center cursor-pointer">
             <span className="font-bold text-white">Market Tasks</span>
          </div>
          <div className="bg-[#d6dff7] p-2 flex flex-col gap-1 text-[#215dc6]">
            <button 
                onClick={() => setFilter("All")}
                className={`text-left hover:underline px-1 py-0.5 flex items-center gap-2 ${filter === "All" ? "font-bold" : ""}`}
            >
                <img src="/images/search.svg" className="w-3 h-3 opacity-70" alt="" />
                View Active Market
            </button>
            <button 
                onClick={() => setFilter("My Portfolio")}
                className={`text-left hover:underline px-1 py-0.5 flex items-center gap-2 ${filter === "My Portfolio" ? "font-bold" : ""}`}
            >
                <img src="/images/star.svg" className="w-3 h-3 opacity-70" alt="" />
                View My Portfolio
            </button>
          </div>
        </div>

        {/* LIVE BID FEED BOX */}
         <div className="bg-white rounded-t-sm rounded-b-sm overflow-hidden shadow-sm flex-1 min-h-[150px] flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1 flex justify-between items-center cursor-pointer shrink-0">
             <span className="font-bold text-white">Live Bid Feed</span>
          </div>
          <div className="bg-[#d6dff7] p-2 flex flex-col gap-1 overflow-y-auto flex-1 h-0">
             {allBidsFlat.length > 0 ? (
                 allBidsFlat.map((bid) => (
                    <div key={bid.id} className="bg-white p-1 border border-blue-200 mb-1 shadow-sm">
                        <div className="flex justify-between">
                            <span className="font-bold text-[#003399] truncate w-20">{bid.username}</span>
                            <span className="text-green-700 font-bold">${(bid.amount / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="text-[9px] text-gray-500 truncate">{bid.scriptTitle}</div>
                        {bid.expires_at && <div className="text-[9px] text-right"><BidCountdown expiresAt={bid.expires_at} /></div>}
                    </div>
                 ))
             ) : (
                <div className="text-center text-gray-400 italic mt-2">No active bids.</div>
             )}
          </div>
        </div>

        {/* GENRE FILTER BOX */}
        <div className="bg-white rounded-t-sm rounded-b-sm overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1 flex justify-between items-center cursor-pointer">
             <span className="font-bold text-white">Filter by Genre</span>
          </div>
          <div className="bg-[#d6dff7] p-2 flex flex-col gap-1 text-[#215dc6]">
             {GENRES.map((g) => (
                <button
                    key={g}
                    onClick={() => setFilter(g)}
                    className={`text-left hover:underline px-1 py-0.5 flex items-center gap-2 ${filter === g ? "font-bold" : ""}`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${filter === g ? "bg-[#215dc6]" : "bg-[#215dc6]/50"}`} />
                    {g}
                </button>
             ))}
          </div>
        </div>
      </div>

      {/* MAIN VIEW */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* ADDRESS/TOOLBAR */}
        <div className="h-8 bg-[#ece9d8] border-b border-[#808080] flex items-center px-2 gap-2 shrink-0 shadow-sm z-10">
            <span className="text-gray-500">Address:</span>
            <div className="flex-1 bg-white border border-[#808080] h-5 flex items-center px-1 shadow-inner">
                Script Market/{filter}
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
                            <th className="border-b border-r border-[#d4d0c8] px-2 py-0.5 font-normal text-gray-600">Title</th>
                            <th className="border-b border-r border-[#d4d0c8] px-2 py-0.5 font-normal text-gray-600 w-24">Genre</th>
                            <th className="border-b border-r border-[#d4d0c8] px-2 py-0.5 font-normal text-gray-600 w-16">Quality</th>
                            <th className="border-b border-r border-[#d4d0c8] px-2 py-0.5 font-normal text-gray-600 w-24 text-right">Current Bid</th>
                            <th className="border-b border-[#d4d0c8] px-2 py-0.5 font-normal text-gray-600 w-32 pl-4">Leading Entity</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {displayScripts.map((script, idx) => {
                           const highestBid = getHighestBidForScript(script.id);
                           const currentPrice = script.status === 'Owned' ? 0 : (highestBid ? highestBid.amount : (script.baseCost || 0));
                           const bidderName = highestBid ? highestBid.username : '-';
                           
                           return (
                           <tr 
                                key={script.id}
                                onClick={() => setSelectedScript(script)}
                                className={`
                                    group border-b border-gray-100 last:border-0 hover:bg-[#e0e8f5]
                                    ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f7f7f7]'}
                                `}
                            >
                                <td className="px-2 py-1 text-center text-lg leading-none">
                                    {script.status === 'Owned' ? (
                                      <img src="/images/ce00f48541fffae4db3ea6a2096246e36e66a774.png" alt="Owned" className="w-6 h-6 object-contain" />
                                    ) : (
                                      <img src="/images/a452f2899a0222d68b78c6d0316b8e5b4001de15.png" alt="Script" className="w-6 h-6 object-contain" />
                                    )}
                                </td>
                                <td className="px-2 py-1 font-bold text-[#003399]">
                                    {script.title}
                                </td>
                                <td className="px-2 py-1">{script.genre}</td>
                                <td className="px-2 py-1">
                                    <div className="w-full bg-gray-200 h-1.5 rounded-sm overflow-hidden">
                                        <div className="bg-green-500 h-full" style={{ width: `${script.quality}%` }} />
                                    </div>
                                </td>
                                <td className="px-2 py-1 text-right font-mono">
                                    {script.status === 'Owned' ? '-' : `$${currentPrice.toLocaleString()}`}
                                </td>
                                <td className="px-2 py-1 pl-4">
                                     <span className={`font-bold ${script.status === 'Owned' ? 'text-blue-600' : (highestBid ? 'text-red-800' : 'text-gray-400')}`}>
                                        {script.status === 'Owned' ? 'YOU' : bidderName}
                                     </span>
                                     {highestBid?.expires_at && <span className="ml-2 text-[9px]"><BidCountdown expiresAt={highestBid.expires_at} /></span>}
                                </td>
                            </tr>
                        )})}
                    </tbody>
                 </table>
             ) : (
                <div className="grid grid-cols-3 gap-4 p-4">
                    {displayScripts.map((script) => (
                        <div
                            key={script.id}
                            onClick={() => setSelectedScript(script)}
                            className="flex flex-col items-center gap-1 p-4 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded cursor-pointer"
                        >
                            <img src="/images/a452f2899a0222d68b78c6d0316b8e5b4001de15.png" alt="Script" className="w-16 h-16 object-contain shadow-sm" />
                            <div className="text-center">
                                <div className="font-bold text-[#003399] truncate w-32">{script.title}</div>
                                <div className="text-[10px] text-gray-500">{script.genre}</div>
                            </div>
                        </div>
                    ))}
                </div>
             )}
             
             {displayScripts.length === 0 && (
                 <div className="p-8 text-center text-gray-400 italic">
                     No scripts found in this category.
                 </div>
             )}
        </div>
      </div>

      {selectedScript && (
          <ScriptDetailModal 
              script={selectedScript}
              isOwned={selectedScript.status === 'Owned'}
              onClose={() => setSelectedScript(null)}
              refetchAllBids={refetchAllBids}
              highestBidAmount={(() => {
                 const h = getHighestBidForScript(selectedScript.id);
                 return h ? h.amount : (selectedScript.baseCost || 0);
              })()}
              highBidderName={(() => {
                  const h = getHighestBidForScript(selectedScript.id);
                  return h ? h.username : "None";
              })()}
          />
      )}
    </div>
  );
};
