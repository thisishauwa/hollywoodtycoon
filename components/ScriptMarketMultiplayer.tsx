import React, { useState, useMemo, useEffect } from "react";
import { RetroButton, RetroInput } from "./RetroUI";
import { useScripts } from "../hooks/useScripts";
import { useBids } from "../hooks/useBids";
import { useAllBids } from "../hooks/useAllBids";
import { useGameState } from "../hooks/useGameState";

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

export const ScriptMarketMultiplayer: React.FC = () => {
  const { scripts, loading: scriptsLoading } = useScripts();
  const { gameState, loading: gameStateLoading } = useGameState();
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);

  // Get all bids for all scripts
  const { bidsByScript, getHighestBidForScript, isUserHighBidderForScript, refetch: refetchAllBids } =
    useAllBids();

  // Get bids for selected script (for placing bids)
  const {
    placing,
    placeBid,
  } = useBids(selectedScriptId || undefined);

  // Flatten all bids for live feed, sorted by time (newest first)
  const allBidsFlat = useMemo(() => {
    const allBids: Array<{ id: string; script_id: string; username: string; amount: number; created_at: string; expires_at: string; scriptTitle?: string }> = [];
    Object.entries(bidsByScript).forEach(([scriptId, bids]) => {
      const script = scripts.find(s => s.id === scriptId);
      bids.forEach(bid => {
        allBids.push({
          ...bid,
          scriptTitle: script?.title || "Unknown Script",
        });
      });
    });
    return allBids.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [bidsByScript, scripts]);

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

    // Refetch all bids to update the main list immediately
    await refetchAllBids();

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
                        <div className="space-y-2">
                          <div className="flex gap-2 items-center">
                            <RetroInput
                              type="number"
                              value={bidAmount}
                              onChange={(e) =>
                                setBidAmount(parseInt(e.target.value) || 0)
                              }
                              className="flex-1"
                              placeholder="Enter bid amount"
                              min={currentPrice + 1}
                            />
                            <RetroButton
                              onClick={handlePlaceBid}
                              variant="primary"
                              isLoading={placing}
                              disabled={
                                placing ||
                                bidAmount <= currentPrice ||
                                gameStateLoading ||
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
                          {/* Show why disabled */}
                          {gameStateLoading && (
                            <p className="text-[9px] text-orange-600">Loading your balance...</p>
                          )}
                          {!gameStateLoading && !gameState && (
                            <p className="text-[9px] text-red-600">Error loading game state. Try refreshing.</p>
                          )}
                          {gameState && bidAmount > gameState.balance && (
                            <p className="text-[9px] text-red-600">
                              Insufficient funds. Your balance: ${gameState.balance.toLocaleString()}
                            </p>
                          )}
                          {bidAmount <= currentPrice && bidAmount > 0 && (
                            <p className="text-[9px] text-red-600">
                              Bid must be higher than ${currentPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <RetroButton
                          onClick={() =>
                            handleStartBid(script.id, script.base_cost)
                          }
                          variant="primary"
                          className="w-full"
                          disabled={gameStateLoading}
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
            LIVE BID FEED ({allBidsFlat.length})
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-white">
            {allBidsFlat.length > 0 ? (
              allBidsFlat.map((bid) => {
                const isHighest = getHighestBidForScript(bid.script_id)?.id === bid.id;
                return (
                  <div
                    key={bid.id}
                    className={`p-2 bevel-outset text-xs ${
                      isHighest ? "bg-yellow-100" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#003399]">
                        {bid.username}
                      </span>
                      {isHighest && (
                        <span className="text-[8px] bg-green-600 text-white px-1 py-0.5 rounded">
                          HIGHEST
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-purple-700 font-medium truncate" title={bid.scriptTitle}>
                      {bid.scriptTitle}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-bold">
                        ${bid.amount.toLocaleString()}
                      </span>
                      {isHighest && bid.expires_at && (
                        <BidCountdown expiresAt={bid.expires_at} />
                      )}
                    </div>
                    <div className="text-[9px] text-gray-500">
                      {new Date(bid.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400 mt-8 text-xs">
                <p>No bids yet</p>
                <p className="mt-1">Be the first to bid!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
