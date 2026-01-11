import React, { useState } from "react";
import { GameState, StudioTier } from "../types";
import { RetroProgressBar } from "./RetroUI";
import { useGameState } from "../hooks/useGameState";
import { useOwnedScripts } from "../hooks/useOwnedScripts";
import { useAuth } from "../contexts/AuthContext";
import { getStudioTier, STUDIO_TIERS } from "../constants";

// Windows XP Profile Icons
const PROFILE_ICONS = [
  "/images/profile-airplane.jpg",
  "/images/profile-astronaut.jpg",
  "/images/profile-ball.jpg",
  "/images/profile-beach.jpg",
  "/images/profile-car.jpg",
  "/images/profile-cat.jpg",
  "/images/profile-chess.jpg",
  "/images/profile-dog.jpg",
  "/images/profile-duck.jpg",
  "/images/profile-fish.jpg",
  "/images/profile-guitar.jpg",
  "/images/profile-snowflake.jpg",
];

interface Props {
  state: GameState;
}

const StatusIcon: React.FC<{ type: string }> = ({ type }) => {
  if (type === "GOOD")
    return (
      <div className="w-4 h-4 bg-green-500 rounded-full border border-green-700 flex items-center justify-center shadow-inner">
        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
      </div>
    );
  if (type === "BAD")
    return (
      <div className="w-4 h-4 bg-red-600 border border-red-900 flex items-center justify-center transform rotate-45 shadow-sm">
        <div className="w-2 h-0.5 bg-white"></div>
      </div>
    );
  return (
    <div className="w-4 h-4 bg-blue-500 rounded-sm border border-blue-800 flex items-center justify-center shadow-sm">
      <span className="text-[10px] text-white font-bold">i</span>
    </div>
  );
};

export const Dashboard: React.FC<Props> = ({ state }) => {
  // Get real data from Supabase
  const { profile } = useAuth();
  const { gameState: supabaseGameState } = useGameState();
  const { ownedScripts } = useOwnedScripts();

  // Use Supabase balance if available, fallback to local state
  const currentBalance = supabaseGameState?.balance ?? state.balance;
  const currentReputation = supabaseGameState?.reputation ?? state.reputation;
  const studioName = profile?.username ?? state.studioName;

  // Get studio tier info
  const studioTierInfo = getStudioTier(currentReputation);
  const currentTierIndex = STUDIO_TIERS.findIndex(t => t.tier === studioTierInfo.tier);
  const nextTier = STUDIO_TIERS[currentTierIndex + 1];
  const progressToNextTier = nextTier
    ? ((currentReputation - studioTierInfo.minReputation) / (nextTier.minReputation - studioTierInfo.minReputation)) * 100
    : 100;

  // Count movies made (owned scripts represent acquired IPs, projects with Released status are movies)
  const moviesReleased = state.projects.filter(p => p.status === "Released").length;
  const scriptsOwned = ownedScripts.length;

  // Generate random profile icon once
  const [profileIcon] = useState(
    () => PROFILE_ICONS[Math.floor(Math.random() * PROFILE_ICONS.length)]
  );

  const allStudios = [
    {
      name: studioName,
      revenue: currentBalance,
      id: "player",
      color: "#0058ee",
    },
    ...state.rivals.map((r) => ({
      name: r.name,
      revenue: r.yearlyRevenue,
      id: r.id,
      color: r.color,
    })),
  ].sort((a, b) => b.revenue - a.revenue);

  const recentEvents = state.events.slice(-20).reverse();

  return (
    <div className="flex flex-col h-full bg-[#ece9d8] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Main Controls & Stats */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="shrink-0 bg-[#ece9d8] bevel-outset rounded-sm overflow-hidden flex flex-col">
              <div className="bg-[#0058ee] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0">
                Studio Console
              </div>
              <div className="flex-1 flex flex-col gap-3 p-3 bg-[#f4f4f4] overflow-hidden">
                {/* Studio Header with Tier Badge */}
                <div className="flex items-center gap-3 border-b border-gray-300 pb-3">
                  <div className="w-12 h-12 bevel-outset rounded-sm shrink-0 shadow-sm overflow-hidden">
                    <img
                      src={profileIcon}
                      alt="Studio"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-sm text-[#003399] leading-tight truncate uppercase tracking-tighter">
                      {studioName}
                    </h2>
                    <div
                      className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase rounded-sm text-white"
                      style={{ backgroundColor: studioTierInfo.color }}
                    >
                      {studioTierInfo.tier}
                    </div>
                  </div>
                </div>

                {/* Tier Progress */}
                <div className="bg-white border border-[#808080] p-2 shadow-inner">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] text-[#808080] font-bold uppercase">
                      Reputation
                    </span>
                    <span className="font-bold text-xs" style={{ color: studioTierInfo.color }}>
                      {currentReputation}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 border border-gray-400 rounded-sm overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${progressToNextTier}%`,
                        backgroundColor: studioTierInfo.color
                      }}
                    />
                  </div>
                  {nextTier && (
                    <div className="flex justify-between mt-1 text-[8px] text-gray-500">
                      <span>{studioTierInfo.tier}</span>
                      <span>{nextTier.minReputation}% for {nextTier.tier}</span>
                    </div>
                  )}
                </div>

                {/* Tier Benefits */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 p-2 rounded-sm">
                  <div className="text-[8px] font-bold uppercase text-gray-500 mb-1">Tier Benefits</div>
                  <div className="text-[9px] text-gray-700 leading-relaxed">
                    {studioTierInfo.description}
                  </div>
                  {studioTierInfo.salaryDiscount > 0 && (
                    <div className="mt-1 text-[9px] font-bold text-green-600">
                      {studioTierInfo.salaryDiscount}% salary discount active
                    </div>
                  )}
                </div>

                {/* Balance & Stats */}
                <div className="space-y-2">
                  <div className="bg-[#ffffe1] border border-[#808080] p-2 shadow-inner flex justify-between items-center">
                    <span className="text-[9px] text-[#808080] font-bold uppercase">
                      Balance
                    </span>
                    <span className="font-bold text-sm text-green-700 font-mono">
                      ${currentBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white border border-[#808080] p-2 shadow-inner flex flex-col items-center">
                      <span className="text-[9px] text-[#808080] font-bold uppercase">
                        Scripts
                      </span>
                      <span className="font-bold text-sm text-purple-700">
                        {scriptsOwned}
                      </span>
                    </div>
                    <div className="bg-white border border-[#808080] p-2 shadow-inner flex flex-col items-center">
                      <span className="text-[9px] text-[#808080] font-bold uppercase">
                        Movies
                      </span>
                      <span className="font-bold text-sm text-orange-600">
                        {moviesReleased}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recently Won Auctions */}
            <div className="h-32 shrink-0 bg-[#ece9d8] bevel-outset rounded-sm overflow-hidden flex flex-col">
              <div className="bg-[#38d438] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0">
                Your Script Library ({scriptsOwned})
              </div>
              <div className="flex-1 flex flex-col bg-white overflow-y-auto p-2 space-y-1">
                {ownedScripts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-[10px] text-center opacity-40 py-2">
                    <p className="italic">NO SCRIPTS YET</p>
                    <p className="text-[8px]">Win auctions to acquire scripts!</p>
                  </div>
                ) : (
                  ownedScripts.slice(0, 3).map((script) => (
                    <div
                      key={script.id}
                      className="p-1.5 border border-green-200 bg-green-50 flex justify-between items-center"
                    >
                      <div className="truncate">
                        <span className="text-[10px] font-bold text-[#003399]">
                          {script.title}
                        </span>
                        <span className="text-[8px] text-gray-500 ml-2">
                          {script.genre}
                        </span>
                      </div>
                      <span className="text-[8px] font-bold text-green-700">
                        ${script.purchase_price?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="shrink-0 bg-[#ece9d8] bevel-outset rounded-sm overflow-hidden flex flex-col">
              <div className="bg-[#0058ee] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0">
                Live Productions
              </div>
              <div className="flex-1 flex flex-col bg-white overflow-y-auto p-2 space-y-2 max-h-48">
                {state.projects.filter(
                  (p) => p.status !== "Released" && p.studioId === "player"
                ).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-[10px] text-center opacity-40 py-4">
                    <p className="italic">NO ACTIVE PRODUCTIONS</p>
                    <p className="text-[8px]">Greenlight a project to start</p>
                  </div>
                ) : (
                  state.projects
                    .filter(
                      (p) => p.status !== "Released" && p.studioId === "player"
                    )
                    .map((p) => {
                      const phaseColors: Record<string, string> = {
                        "Pre-Production": "#8b5cf6",
                        "Filming": "#ef4444",
                        "Post-Production": "#f59e0b",
                        "Marketing": "#3b82f6",
                      };
                      const phaseIcons: Record<string, string> = {
                        "Pre-Production": "📋",
                        "Filming": "🎬",
                        "Post-Production": "🎞️",
                        "Marketing": "📺",
                      };
                      return (
                        <div
                          key={p.id}
                          className="p-2 border bg-gradient-to-r from-white to-gray-50 space-y-1.5 shadow-sm shrink-0"
                          style={{ borderColor: phaseColors[p.status] || "#d4d4d4" }}
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-bold text-[#003399] uppercase truncate flex-1">
                              {p.title}
                            </h4>
                            <span
                              className="text-[8px] font-bold text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1"
                              style={{ backgroundColor: phaseColors[p.status] || "#808080" }}
                            >
                              {phaseIcons[p.status]} {p.status}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] text-gray-500">
                              <span>Overall: {p.progress}%</span>
                              <span>Phase: {p.phaseProgress || 0}%</span>
                            </div>
                            <RetroProgressBar progress={p.progress} />
                          </div>
                          {(p.productionEvents?.length || 0) > 0 && (
                            <div className="text-[8px] text-gray-500 italic truncate">
                              Latest: {p.productionEvents?.[p.productionEvents.length - 1]?.title}
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="lg:col-span-4 h-[540px]">
            <div className="h-full bg-[#ece9d8] bevel-outset rounded-sm overflow-hidden flex flex-col">
              <div className="bg-[#0058ee] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0">
                Global Power Rankings
              </div>
              <div className="bg-white flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-600 text-[9px] font-bold sticky top-0 z-10 border-b">
                    <tr>
                      <th className="px-2 py-2 border-r">#</th>
                      <th className="px-2 py-2 border-r">STUDIO</th>
                      <th className="px-2 py-2 text-right">GROSS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allStudios.map((s, idx) => (
                      <tr
                        key={s.id}
                        className={`text-[10px] ${
                          s.id === "player"
                            ? "bg-[#ffffcc]"
                            : "hover:bg-blue-50 cursor-default"
                        }`}
                      >
                        <td className="px-2 py-2 font-bold text-gray-400 w-8 border-r">
                          {idx + 1}
                        </td>
                        <td className="px-2 py-2 font-bold text-gray-800 uppercase truncate border-r">
                          {s.id === "player" && (
                            <span className="mr-1 text-blue-600 font-bold">
                              ★
                            </span>
                          )}
                          {s.name}
                        </td>
                        <td className="px-2 py-2 text-right font-mono text-blue-600">
                          ${(s.revenue / 1000000).toFixed(1)}M
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Variety Industry News */}
          <div className="lg:col-span-4 h-[540px]">
            <div className="h-full bg-[#ece9d8] bevel-outset rounded-sm overflow-hidden flex flex-col">
              <div className="bg-[#0058ee] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0">
                Variety Industry Reports
              </div>
              <div className="flex flex-col h-full bg-[#f1f1f1] overflow-hidden">
                <div className="bg-[#cc0000] border-b border-black p-2 flex flex-col items-center shrink-0">
                  <h1
                    className="text-white font-serif text-2xl italic font-black tracking-tighter"
                    style={{
                      fontFamily: "Georgia, serif",
                      textShadow: "1px 1px 0px rgba(0,0,0,0.5)",
                    }}
                  >
                    VARIETY
                  </h1>
                  <div className="w-full h-[1px] bg-white/30 my-1"></div>
                  <span className="text-[8px] text-white font-bold uppercase tracking-[0.2em]">
                    Daily Headlines • Hollywood, CA
                  </span>
                </div>

                <div className="flex-1 bg-white overflow-y-auto border-t border-[#808080]">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead className="bg-gray-100 border-b border-gray-300 text-[8px] font-bold text-gray-500 uppercase">
                      <tr>
                        <th className="w-8 px-2 py-1 border-r">ST</th>
                        <th className="w-10 px-2 py-1 border-r">PER</th>
                        <th className="px-2 py-1">SUBJECT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentEvents.map((e) => (
                        <tr
                          key={e.id}
                          className="hover:bg-blue-600 hover:text-white group transition-colors cursor-default"
                        >
                          <td className="px-2 py-2 border-r border-gray-50 group-hover:border-blue-500 align-top">
                            <StatusIcon type={e.type} />
                          </td>
                          <td className="px-2 py-2 border-r border-gray-50 group-hover:border-blue-500 text-[9px] font-mono font-bold align-top">
                            M{e.month}
                          </td>
                          <td className="px-2 py-2 text-[10px] font-medium leading-snug">
                            {e.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-2 py-1 bg-[#ece9d8] border-t border-[#808080] text-[8px] text-gray-500 font-bold flex justify-between shrink-0">
                  <span>CONNECTED TO WIRE SERVICE</span>
                  <span>v1.0.3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
