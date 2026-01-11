import React, { useState } from "react";
import { GameState, RivalStudio, StudioMessage } from "../types";
import { WindowFrame, RetroButton } from "./RetroUI";

interface Props {
  state: GameState;
  onSendMoney: (studioId: string, amount: number) => void;
  onSendMessage: (studioId: string, content: string, isPublic: boolean) => void;
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
  zIndex: number;
  onFocus: () => void;
}

export const StudioNetwork: React.FC<Props> = ({
  state,
  onSendMoney,
  onSendMessage,
  onClose,
  onMinimize,
  isActive,
  zIndex,
  onFocus,
}) => {
  const [selectedRival, setSelectedRival] = useState<RivalStudio | null>(null);
  const [viewMode, setViewMode] = useState<"chat" | "profile">("chat");
  const [amount, setAmount] = useState<number>(100000);
  const [msg, setMsg] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const rivals = [...state.rivals].sort((a, b) => b.balance - a.balance);

  const handleTransfer = () => {
    setTransferError(null);
    setTransferSuccess(false);

    if (!selectedRival) {
      setTransferError("Select a studio first");
      return;
    }

    if (amount <= 0) {
      setTransferError("Amount must be positive");
      return;
    }

    if (amount > state.balance) {
      setTransferError(`Insufficient funds! You have $${(state.balance / 1000000).toFixed(2)}M`);
      return;
    }

    // Confirm large transfers (over $1M)
    if (amount > 1000000 && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    onSendMoney(selectedRival.id, amount);
    setShowConfirm(false);
    setTransferSuccess(true);
    setTimeout(() => setTransferSuccess(false), 3000);
  };

  return (
    <WindowFrame
      title="Hollywood Messenger v4.0 (AOL Connected)"
      onClose={onClose}
      onMinimize={onMinimize}
      isActive={isActive}
      zIndex={zIndex}
      onFocus={onFocus}
      className="w-full max-w-3xl h-[600px]"
      initialPos={{ x: 150, y: 100 }}
    >
      <div className="flex h-full bg-[#ece9d8] overflow-hidden font-sans">
        {/* Buddy List */}
        <div className="w-56 border-r-2 border-[#808080] flex flex-col bg-white">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm shrink-0">
            <span className="text-sm">👤</span> Buddy List (30)
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="bg-gray-100 p-1 text-[10px] font-bold text-gray-500 border-b italic">
              Studios Online
            </div>
            {rivals.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRival(r)}
                className={`p-1.5 cursor-pointer text-[11px] flex items-center gap-2 ${
                  selectedRival?.id === r.id
                    ? "bg-blue-600 text-white shadow-inner"
                    : "hover:bg-blue-50 text-black"
                }`}
              >
                <span
                  className={
                    r.relationship > 30
                      ? "text-green-500"
                      : r.relationship < -30
                      ? "text-red-500"
                      : "text-gray-400"
                  }
                >
                  ●
                </span>
                <span className="truncate flex-1 font-medium">{r.name}</span>
                <span className="text-[9px] opacity-60">
                  ({r.personality?.[0] || "Unknown"})
                </span>
              </div>
            ))}
          </div>
          <div className="p-2 border-t bg-gray-50 flex gap-1 shrink-0">
            <button className="flex-1 bg-white border border-gray-400 text-[9px] font-bold py-1 shadow-sm active:shadow-inner">
              Setup
            </button>
            <button className="flex-1 bg-white border border-gray-400 text-[9px] font-bold py-1 shadow-sm active:shadow-inner">
              Away
            </button>
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-[#ece9d8]">
          {selectedRival ? (
            <div className="flex flex-col h-full">
              <div className="flex p-1 gap-1 bg-gray-200 border-b border-[#808080]">
                <button
                  onClick={() => setViewMode("chat")}
                  className={`px-3 py-1 text-[10px] font-bold border-2 ${
                    viewMode === "chat"
                      ? "bg-white border-[#808080] shadow-sm"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  IM
                </button>
                <button
                  onClick={() => setViewMode("profile")}
                  className={`px-3 py-1 text-[10px] font-bold border-2 ${
                    viewMode === "profile"
                      ? "bg-white border-[#808080] shadow-sm"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  Profile
                </button>
              </div>

              {viewMode === "chat" ? (
                <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
                  <div className="flex-1 bg-white bevel-inset p-3 overflow-y-auto space-y-3 font-mono text-[12px] shadow-inner">
                    <div className="text-gray-400 text-center text-[10px] italic border-b pb-2 mb-2">
                      *** You are now chatting with {selectedRival.name} ***
                    </div>
                    {state.messages
                      .filter(
                        (m) =>
                          m.fromId === selectedRival.id ||
                          m.toId === selectedRival.id
                      )
                      .map((m) => (
                        <div key={m.id}>
                          <span
                            className={`font-black uppercase ${
                              m.fromId === "player"
                                ? "text-blue-600"
                                : "text-red-600"
                            }`}
                          >
                            {m.fromId === "player" ? "You" : selectedRival.name}
                            :
                          </span>
                          <span className="ml-2 font-sans">{m.content}</span>
                        </div>
                      ))}
                  </div>
                  <div className="bg-white bevel-inset h-24 flex flex-col shadow-inner">
                    <textarea
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      className="flex-1 p-2 text-xs outline-none resize-none"
                      placeholder="Type a message..."
                    />
                    <div className="flex justify-between items-center p-1 bg-gray-100 border-t">
                      <label className="text-[9px] font-bold ml-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                        />{" "}
                        PRESS
                      </label>
                      <RetroButton
                        onClick={() => {
                          onSendMessage(selectedRival.id, msg, isPublic);
                          setMsg("");
                        }}
                        className="!py-0.5 !px-4"
                      >
                        Send
                      </RetroButton>
                    </div>
                  </div>
                  {/* Wire Transfer Section */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] text-gray-500 px-1">
                      <span>Your Balance: ${(state.balance / 1000000).toFixed(2)}M</span>
                      <span className={`font-medium ${selectedRival.relationship >= 30 ? 'text-green-600' : selectedRival.relationship <= -30 ? 'text-red-600' : 'text-gray-500'}`}>
                        Relationship: {selectedRival.relationship}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2 bg-white bevel-inset px-2 py-1 shadow-inner">
                        <span className="text-[9px] font-bold text-gray-400">
                          WIRE: $
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => {
                            setAmount(parseInt(e.target.value) || 0);
                            setTransferError(null);
                            setShowConfirm(false);
                          }}
                          className="flex-1 text-xs font-mono outline-none"
                          min={0}
                          step={100000}
                        />
                      </div>
                      <RetroButton
                        onClick={handleTransfer}
                        className="!text-[9px] !px-4"
                        disabled={amount <= 0}
                      >
                        {showConfirm ? 'CONFIRM' : 'TRANSFER'}
                      </RetroButton>
                      {showConfirm && (
                        <RetroButton
                          onClick={() => setShowConfirm(false)}
                          className="!text-[9px] !px-2 !bg-gray-100"
                        >
                          Cancel
                        </RetroButton>
                      )}
                    </div>
                    {/* Transfer feedback */}
                    {transferError && (
                      <div className="text-[9px] text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                        {transferError}
                      </div>
                    )}
                    {showConfirm && (
                      <div className="text-[9px] text-yellow-700 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                        Confirm transfer of ${(amount / 1000000).toFixed(2)}M to {selectedRival.name}? Click CONFIRM to proceed.
                      </div>
                    )}
                    {transferSuccess && (
                      <div className="text-[9px] text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                        Transfer successful! (+10 relationship)
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-4 overflow-y-auto m-2 bg-white bevel-inset shadow-inner">
                  <h2
                    className="text-xl font-black text-[#003399] border-b-2 border-blue-600 mb-4"
                    style={{ fontFamily: "Tahoma, sans-serif" }}
                  >
                    {selectedRival.name}
                  </h2>
                  <div
                    className="space-y-4 text-xs"
                    style={{ fontFamily: "Tahoma, sans-serif" }}
                  >
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-bold uppercase text-[9px]">
                        Balance
                      </span>{" "}
                      <span className="font-mono font-bold">
                        ${(selectedRival.balance / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-bold uppercase text-[9px]">
                        Personality
                      </span>{" "}
                      <span className="font-bold">
                        {selectedRival.personality}
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-4">
                      <h3 className="text-[10px] font-bold uppercase text-gray-400 mb-2">
                        Contracted Talent
                      </h3>
                      <div className="text-[11px] text-gray-700">
                        {selectedRival.ownedActors.length} stars on roster.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-gray-300">
              <div className="text-6xl mb-4 opacity-10">💬</div>
              <p className="text-xs font-bold uppercase tracking-widest">
                Select a studio to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </WindowFrame>
  );
};
