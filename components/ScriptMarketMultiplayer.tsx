import React, { useState } from "react";
import { RetroButton, RetroInput } from "./RetroUI";
import { useScripts } from "../hooks/useScripts";
import { useBids } from "../hooks/useBids";
import { useAllBids } from "../hooks/useAllBids";
import { useGameState } from "../hooks/useGameState";

export const ScriptMarketMultiplayer: React.FC = () => {
  const { scripts, loading: scriptsLoading } = useScripts();
  const { gameState } = useGameState();
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);

  // Get all bids for all scripts
  const { bidsByScript, getHighestBidForScript, isUserHighBidderForScript } =
    useAllBids();

  // Get bids for selected script (for detail view)
  const {
    bids: selectedScriptBids,
    placing,
    placeBid,
  } = useBids(selectedScriptId || undefined);

  const handleStartBid = (scriptId: string, baseCost: number) => {
    setSelectedScriptId(scriptId);
    const highestBid = getHighestBidForScript(scriptId);
    setBidAmount(highestBid ? highestBid.amount + 50000 : baseCost);
  };

  const handlePlaceBid = async () => {
    if (!selectedScriptId || !bidAmount) return;

    const { error } = await placeBid(selectedScriptId, bidAmount);
    if (error) {
      alert(`Failed to place bid: ${error}`);
      return;
    }

    // Reset
    setSelectedScriptId(null);
    setBidAmount(0);
  };

  if (scriptsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading scripts...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 h-full bg-[#ece9d8] overflow-hidden p-2">
      {/* Market Feed */}
      <div className="md:col-span-8 h-full flex flex-col min-h-0">
        <div className="flex flex-col h-full bg-[#ece9d8] bevel-outset overflow-hidden">
          <div className="flex flex-col h-full bg-gray-200">
            <div className="bg-[#0058ee] p-2 text-center text-[10px] font-bold text-white uppercase tracking-widest shrink-0">
              ACTIVE TRADE FLOOR ({scripts.length} SCRIPTS)
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              {scripts.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <p className="text-sm">No scripts available</p>
                  <p className="text-xs mt-2">
                    Check back later for new releases!
                  </p>
                </div>
              ) : (
                scripts.map((script) => {
                  const highestBid = getHighestBidForScript(script.id);
                  const currentPrice = highestBid
                    ? highestBid.amount
                    : script.base_cost;
                  const isHighBidder = isUserHighBidderForScript(script.id);

                  return (
                    <div
                      key={script.id}
                      className={`bg-white bevel-outset p-3 transition-all ${
                        isHighBidder ? "ring-2 ring-[#38d438]" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-4">
                          <h3 className="font-bold text-[#003399] text-sm flex items-center gap-2">
                            <span className="text-xl">📜</span> {script.title}
                          </h3>
                          <p className="text-[10px] text-gray-500 italic mt-0.5">
                            "{script.tagline}"
                          </p>
                        </div>
                        <div
                          className={`text-[9px] px-2 py-1 bevel-outset font-bold uppercase ${
                            isHighBidder
                              ? "bg-[#38d438] text-white"
                              : highestBid
                              ? "bg-red-600 text-white"
                              : "bg-gray-400 text-white"
                          }`}
                        >
                          {isHighBidder
                            ? "HIGH BIDDER"
                            : highestBid
                            ? "ACTIVE BIDS"
                            : "NO BIDS"}
                        </div>
                      </div>

                      <p className="text-[10px] text-gray-700 mb-2 line-clamp-2">
                        {script.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[9px] mb-2">
                        <div className="flex justify-between bg-gray-100 px-2 py-1 bevel-inset">
                          <span className="text-gray-600">Genre:</span>
                          <span className="font-bold text-[#003399]">
                            {script.genre}
                          </span>
                        </div>
                        <div className="flex justify-between bg-gray-100 px-2 py-1 bevel-inset">
                          <span className="text-gray-600">Quality:</span>
                          <span className="font-bold text-green-700">
                            {script.quality}%
                          </span>
                        </div>
                        <div className="flex justify-between bg-gray-100 px-2 py-1 bevel-inset">
                          <span className="text-gray-600">Complexity:</span>
                          <span className="font-bold text-orange-600">
                            {script.complexity}
                          </span>
                        </div>
                        <div className="flex justify-between bg-gray-100 px-2 py-1 bevel-inset">
                          <span className="text-gray-600">Tone:</span>
                          <span className="font-bold text-purple-700">
                            {script.tone}
                          </span>
                        </div>
                      </div>

                      {/* Current Bid Info */}
                      <div className="flex justify-between items-center mb-2 bg-yellow-50 p-2 bevel-inset">
                        <div>
                          <div className="text-[9px] text-gray-600 uppercase">
                            {highestBid ? "Current Bid" : "Base Cost"}
                          </div>
                          <div className="text-sm font-bold text-green-700">
                            ${currentPrice.toLocaleString()}
                          </div>
                        </div>
                        {highestBid && (
                          <div className="text-right">
                            <div className="text-[9px] text-gray-600 uppercase">
                              High Bidder
                            </div>
                            <div
                              className={`text-xs font-bold ${
                                isHighBidder ? "text-green-700" : "text-red-700"
                              }`}
                            >
                              {highestBid.username}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bidding Interface */}
                      {selectedScriptId === script.id ? (
                        <div className="flex gap-2 items-center">
                          <RetroInput
                            type="number"
                            value={bidAmount}
                            onChange={(e) =>
                              setBidAmount(parseInt(e.target.value) || 0)
                            }
                            className="flex-1"
                            placeholder="Enter bid amount"
                            min={currentPrice + 10000}
                          />
                          <RetroButton
                            onClick={handlePlaceBid}
                            variant="primary"
                            isLoading={placing}
                            disabled={
                              bidAmount <= currentPrice ||
                              !gameState ||
                              bidAmount > gameState.balance
                            }
                            className="!bg-[#38d438] !text-white !border-white"
                          >
                            {placing ? "PLACING..." : "PLACE BID"}
                          </RetroButton>
                          <RetroButton
                            onClick={() => setSelectedScriptId(null)}
                          >
                            CANCEL
                          </RetroButton>
                        </div>
                      ) : (
                        <RetroButton
                          onClick={() =>
                            handleStartBid(script.id, script.base_cost)
                          }
                          variant="primary"
                          className="w-full"
                        >
                          {highestBid ? "COUNTER BID" : "PLACE BID"}
                        </RetroButton>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Bid Activity */}
      <div className="md:col-span-4 h-full flex flex-col min-h-0">
        <div className="flex flex-col h-full bg-[#ece9d8] bevel-outset overflow-hidden">
          <div className="bg-[#0058ee] p-2 text-center text-[10px] font-bold text-white uppercase tracking-widest shrink-0">
            LIVE BID FEED
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-white">
            {selectedScriptId && selectedScriptBids.length > 0 ? (
              selectedScriptBids.map((bid, index) => (
                <div
                  key={bid.id}
                  className={`p-2 bevel-outset text-xs ${
                    index === 0 ? "bg-yellow-100" : "bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#003399]">
                      {bid.username}
                    </span>
                    {index === 0 && (
                      <span className="text-[8px] bg-green-600 text-white px-1 py-0.5 rounded">
                        HIGHEST
                      </span>
                    )}
                  </div>
                  <div className="text-green-700 font-bold">
                    ${bid.amount.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-gray-500">
                    {new Date(bid.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 mt-8 text-xs">
                <p>Select a script to see bids</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
