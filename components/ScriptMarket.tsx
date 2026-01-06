import React, { useState } from "react";
import { Script, RivalStudio } from "../types";
import { RetroButton, RetroInput } from "./RetroUI";

interface Props {
  marketScripts: Script[];
  ownedScripts: Script[];
  balance: number;
  rivals: RivalStudio[];
  onBid: (scriptId: string, amount: number) => void;
}

export const ScriptMarket: React.FC<Props> = ({
  marketScripts,
  ownedScripts,
  balance,
  rivals,
  onBid,
}) => {
  const [biddingScriptId, setBiddingScriptId] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);

  const getBidderName = (id: string) => {
    if (id === "player") return "YOU";
    return rivals.find((r) => r.id === id)?.name || "Unknown";
  };

  const startBid = (s: Script) => {
    setBiddingScriptId(s.id);
    setBidAmount(s.currentBid + 50000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 h-full bg-[#ece9d8] overflow-hidden p-2">
      {/* Market Feed */}
      <div className="md:col-span-8 h-full flex flex-col min-h-0">
        <div className="flex flex-col h-full bg-[#ece9d8] bevel-outset overflow-hidden">
          <div className="flex flex-col h-full bg-gray-200">
            <div className="bg-[#0058ee] p-2 text-center text-[10px] font-bold text-white uppercase tracking-widest shrink-0">
              ACTIVE TRADE FLOOR
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              {marketScripts.map((script) => (
                <div
                  key={script.id}
                  className={`bg-white bevel-outset p-3 transition-all ${
                    script.highBidderId === "player"
                      ? "ring-2 ring-[#38d438]"
                      : ""
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
                        script.highBidderId === "player"
                          ? "bg-[#38d438] text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {script.highBidderId === "player"
                        ? "HIGH BIDDER"
                        : "OUTBID"}
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-700 bg-gray-50 p-2 border border-gray-300 mb-3 leading-tight">
                    {script.description}
                  </div>

                  <div className="flex justify-between items-end border-t border-gray-100 pt-2">
                    <div>
                      <div className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">
                        Leading Entity
                      </div>
                      <div
                        className={`text-xs font-bold ${
                          script.highBidderId === "player"
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {getBidderName(script.highBidderId)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">
                        Current Value
                      </div>
                      <div className="text-lg font-bold text-[#003399] leading-none font-mono">
                        ${script.currentBid.toLocaleString()}
                      </div>
                      <RetroButton
                        variant="primary"
                        onClick={() => startBid(script)}
                        className="mt-2 text-[10px]"
                      >
                        PLACE BID
                      </RetroButton>
                    </div>
                  </div>
                </div>
              ))}
              {marketScripts.length === 0 && (
                <div className="text-center p-8 text-gray-400 italic">
                  Connecting to trade server...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio & Interface */}
      <div className="md:col-span-4 flex flex-col gap-2 h-full min-h-0">
        <div className="flex-1 flex flex-col bg-[#ece9d8] bevel-outset overflow-hidden">
          <div className="bg-[#0058ee] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0">
            IP Portfolio
          </div>
          <div className="flex flex-col h-full bg-[#f4f4f4]">
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {ownedScripts.map((script) => (
                <div
                  key={script.id}
                  className="bg-white p-2 bevel-outset flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-gray-800 text-xs truncate w-32">
                      {script.title}
                    </h3>
                    <div className="text-[9px] text-blue-600 font-bold uppercase">
                      {script.genre}
                    </div>
                  </div>
                  <div className="text-lg">🎬</div>
                </div>
              ))}
              {ownedScripts.length === 0 && (
                <div className="text-center p-4 text-gray-400 text-[10px] italic mt-4">
                  Rights Portfolio is empty.
                </div>
              )}
            </div>
          </div>
        </div>

        {biddingScriptId && (
          <div className="h-40 shrink-0 flex flex-col bg-[#ece9d8] bevel-outset overflow-hidden">
            <div className="bg-[#0058ee] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0">
              Bid Terminal
            </div>
            <div className="flex flex-col gap-2 p-3 bg-[#ffffdd] h-full">
              <p className="text-[10px] truncate font-bold">
                Project: "
                {marketScripts.find((s) => s.id === biddingScriptId)?.title}"
              </p>
              <div className="flex gap-2">
                <RetroInput
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(parseInt(e.target.value))}
                  className="flex-1 font-mono text-xl text-green-700 font-bold"
                />
                <RetroButton
                  variant="primary"
                  onClick={() => {
                    onBid(biddingScriptId, bidAmount);
                    setBiddingScriptId(null);
                  }}
                >
                  BID
                </RetroButton>
              </div>
              <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase mt-1">
                <span>Balance: ${balance.toLocaleString()}</span>
                <button
                  onClick={() => setBiddingScriptId(null)}
                  className="text-red-600 underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
