import React, { useState, useEffect } from "react";
import { GameState, RivalStudio } from "../types";
import { WindowFrame, RetroButton } from "./RetroUI";
import { useStudioMessages, StudioMessage, OtherStudio } from "../hooks/useStudioMessages";
import { useAuth } from "../contexts/AuthContext";

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

// Combined type for display - can be real player or AI rival
interface DisplayStudio {
  id: string;
  name: string;
  balance: number;
  reputation: number;
  isRealPlayer: boolean;
  relationship?: number;
  personality?: string;
  ownedActors?: string[];
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
  const { user } = useAuth();
  const {
    messages: realMessages,
    otherStudios,
    unreadCount,
    sendMessage: sendRealMessage,
    getConversation,
    markAllAsRead,
    transferMoney,
    loading: messagesLoading,
    error: messagesError,
  } = useStudioMessages();

  const [selectedStudio, setSelectedStudio] = useState<DisplayStudio | null>(null);
  const [viewMode, setViewMode] = useState<"chat" | "profile">("chat");
  const [amount, setAmount] = useState<number>(100000);
  const [msg, setMsg] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [transferring, setTransferring] = useState(false);

  // Combine real players and AI rivals into one list
  const allStudios: DisplayStudio[] = [
    // Real players first
    ...otherStudios.map((s) => ({
      id: s.id,
      name: s.username,
      balance: s.balance,
      reputation: s.reputation,
      isRealPlayer: true,
    })),
    // Then AI rivals
    ...state.rivals.map((r) => ({
      id: r.id,
      name: r.name,
      balance: r.balance,
      reputation: 50,
      isRealPlayer: false,
      relationship: r.relationship,
      personality: r.personality,
      ownedActors: r.ownedActors,
    })),
  ].sort((a, b) => b.balance - a.balance);

  // Mark messages as read when selecting a studio
  useEffect(() => {
    if (selectedStudio?.isRealPlayer) {
      markAllAsRead(selectedStudio.id);
    }
  }, [selectedStudio, markAllAsRead]);

  // Get messages for selected studio
  const getDisplayMessages = () => {
    if (!selectedStudio) return [];

    if (selectedStudio.isRealPlayer) {
      // Real player - use Supabase messages
      return getConversation(selectedStudio.id).map((m) => ({
        id: m.id,
        fromId: m.fromUserId,
        fromName: m.fromUsername,
        content: m.content,
        isFromMe: m.fromUserId === user?.id,
        createdAt: m.createdAt,
      }));
    } else {
      // AI rival - use local state messages
      return state.messages
        .filter(
          (m) =>
            m.fromId === selectedStudio.id || m.toId === selectedStudio.id
        )
        .map((m) => ({
          id: m.id,
          fromId: m.fromId,
          fromName: m.fromId === "player" ? "You" : selectedStudio.name,
          content: m.content,
          isFromMe: m.fromId === "player",
          createdAt: new Date(),
        }));
    }
  };

  const handleSendMessage = async () => {
    if (!selectedStudio || !msg.trim()) return;

    setSendingMessage(true);

    if (selectedStudio.isRealPlayer) {
      // Send to real player via Supabase
      const success = await sendRealMessage(selectedStudio.id, msg, isPublic);
      if (success) {
        setMsg("");
      }
    } else {
      // Send to AI rival via local state
      onSendMessage(selectedStudio.id, msg, isPublic);
      setMsg("");
    }

    setSendingMessage(false);
  };

  const handleTransfer = async () => {
    setTransferError(null);
    setTransferSuccess(false);

    if (!selectedStudio) {
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

    setTransferring(true);

    if (selectedStudio.isRealPlayer) {
      // Real player - use database transfer
      const result = await transferMoney(selectedStudio.id, amount);
      if (result.success) {
        setTransferSuccess(true);
        setShowConfirm(false);
        setTimeout(() => setTransferSuccess(false), 3000);
      } else {
        setTransferError(result.error || "Transfer failed");
      }
    } else {
      // AI rival - use local state (existing behavior)
      onSendMoney(selectedStudio.id, amount);
      setShowConfirm(false);
      setTransferSuccess(true);
      setTimeout(() => setTransferSuccess(false), 3000);
    }

    setTransferring(false);
  };

  const displayMessages = getDisplayMessages();
  const realPlayerCount = otherStudios.length;

  return (
    <WindowFrame
      title={`Hollywood Messenger v4.0 ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
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
            <span className="text-sm">👤</span> Buddy List ({allStudios.length})
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Real Players Section */}
            {realPlayerCount > 0 && (
              <>
                <div className="bg-green-100 p-1 text-[10px] font-bold text-green-700 border-b flex items-center gap-1">
                  <span className="text-green-500">●</span> Real Players ({realPlayerCount})
                </div>
                {allStudios.filter(s => s.isRealPlayer).map((s) => {
                  const unreadFromThis = realMessages.filter(
                    (m) => m.fromUserId === s.id && !m.isRead
                  ).length;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudio(s)}
                      className={`p-1.5 cursor-pointer text-[11px] flex items-center gap-2 ${
                        selectedStudio?.id === s.id
                          ? "bg-blue-600 text-white shadow-inner"
                          : "hover:bg-blue-50 text-black"
                      }`}
                    >
                      <span className="text-green-500">●</span>
                      <span className="truncate flex-1 font-medium">{s.name}</span>
                      {unreadFromThis > 0 && (
                        <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                          {unreadFromThis}
                        </span>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* AI Studios Section */}
            <div className="bg-gray-100 p-1 text-[10px] font-bold text-gray-500 border-b italic">
              AI Studios
            </div>
            {allStudios.filter(s => !s.isRealPlayer).map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedStudio(s)}
                className={`p-1.5 cursor-pointer text-[11px] flex items-center gap-2 ${
                  selectedStudio?.id === s.id
                    ? "bg-blue-600 text-white shadow-inner"
                    : "hover:bg-blue-50 text-black"
                }`}
              >
                <span
                  className={
                    (s.relationship || 0) > 30
                      ? "text-green-500"
                      : (s.relationship || 0) < -30
                      ? "text-red-500"
                      : "text-gray-400"
                  }
                >
                  ●
                </span>
                <span className="truncate flex-1 font-medium">{s.name}</span>
                <span className="text-[9px] opacity-60">
                  ({s.personality?.[0] || "AI"})
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
          {selectedStudio ? (
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
                {selectedStudio.isRealPlayer && (
                  <span className="ml-auto px-2 py-1 text-[9px] bg-green-100 text-green-700 font-bold rounded">
                    REAL PLAYER
                  </span>
                )}
              </div>

              {viewMode === "chat" ? (
                <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
                  <div className="flex-1 bg-white bevel-inset p-3 overflow-y-auto space-y-3 font-mono text-[12px] shadow-inner">
                    <div className="text-gray-400 text-center text-[10px] italic border-b pb-2 mb-2">
                      *** You are now chatting with {selectedStudio.name} ***
                      {selectedStudio.isRealPlayer && (
                        <div className="text-green-600 mt-1">This is a real player - messages are delivered!</div>
                      )}
                    </div>
                    {displayMessages.length === 0 ? (
                      <div className="text-center text-gray-400 text-[10px] py-8">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      displayMessages.map((m) => (
                        <div key={m.id}>
                          <span
                            className={`font-black uppercase ${
                              m.isFromMe ? "text-blue-600" : "text-red-600"
                            }`}
                          >
                            {m.isFromMe ? "You" : m.fromName}:
                          </span>
                          <span className="ml-2 font-sans">{m.content}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="bg-white bevel-inset h-24 flex flex-col shadow-inner">
                    <textarea
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      className="flex-1 p-2 text-xs outline-none resize-none"
                      placeholder={`Type a message to ${selectedStudio.name}...`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <div className="flex justify-between items-center p-1 bg-gray-100 border-t">
                      <label className="text-[9px] font-bold ml-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                        />{" "}
                        PRESS RELEASE
                      </label>
                      <RetroButton
                        onClick={handleSendMessage}
                        className="!py-0.5 !px-4"
                        disabled={!msg.trim() || sendingMessage}
                      >
                        {sendingMessage ? '...' : 'Send'}
                      </RetroButton>
                    </div>
                  </div>
                  {/* Wire Transfer Section */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] text-gray-500 px-1">
                      <span>Your Balance: ${(state.balance / 1000000).toFixed(2)}M</span>
                      {!selectedStudio.isRealPlayer && selectedStudio.relationship !== undefined && (
                        <span className={`font-medium ${selectedStudio.relationship >= 30 ? 'text-green-600' : selectedStudio.relationship <= -30 ? 'text-red-600' : 'text-gray-500'}`}>
                          Relationship: {selectedStudio.relationship}
                        </span>
                      )}
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
                        disabled={amount <= 0 || transferring}
                      >
                        {transferring ? '...' : showConfirm ? 'CONFIRM' : 'TRANSFER'}
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
                        Confirm transfer of ${(amount / 1000000).toFixed(2)}M to {selectedStudio.name}? Click CONFIRM to proceed.
                      </div>
                    )}
                    {transferSuccess && (
                      <div className="text-[9px] text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                        Transfer successful!{selectedStudio?.isRealPlayer && ' Money sent to their account.'}
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
                    {selectedStudio.name}
                    {selectedStudio.isRealPlayer && (
                      <span className="ml-2 text-xs font-normal bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Real Player
                      </span>
                    )}
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
                        ${(selectedStudio.balance / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-bold uppercase text-[9px]">
                        Reputation
                      </span>{" "}
                      <span className="font-bold">
                        {selectedStudio.reputation}%
                      </span>
                    </div>
                    {!selectedStudio.isRealPlayer && selectedStudio.personality && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-bold uppercase text-[9px]">
                          Personality
                        </span>{" "}
                        <span className="font-bold">
                          {selectedStudio.personality}
                        </span>
                      </div>
                    )}
                    {!selectedStudio.isRealPlayer && selectedStudio.ownedActors && (
                      <div className="border-t pt-2 mt-4">
                        <h3 className="text-[10px] font-bold uppercase text-gray-400 mb-2">
                          Contracted Talent
                        </h3>
                        <div className="text-[11px] text-gray-700">
                          {selectedStudio.ownedActors.length} stars on roster.
                        </div>
                      </div>
                    )}
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
              {realPlayerCount > 0 && (
                <p className="text-[10px] mt-2 text-green-600">
                  {realPlayerCount} real player{realPlayerCount > 1 ? 's' : ''} online!
                </p>
              )}
              {messagesError && (
                <p className="text-[10px] mt-2 text-yellow-600">
                  Note: Real-time messaging not configured yet
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </WindowFrame>
  );
};
