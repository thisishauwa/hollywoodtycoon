import React, { useState } from "react";
import { GameState, StudioTier } from "../types";
import { RetroProgressBar } from "./RetroUI";
import { useGameState } from "../hooks/useGameState";
import { useOwnedScripts } from "../hooks/useOwnedScripts";
import { useAuth } from "../contexts/AuthContext";
import { useGlobalClock } from "../hooks/useGlobalClock";
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
  const { user, profile } = useAuth();
  const { gameState: supabaseGameState } = useGameState();
  const { ownedScripts } = useOwnedScripts();
  const { clock, formatTimeRemaining, getMonthName, isAwardSeason } = useGlobalClock();

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
          <div className="lg:col-span-4 h-full">
            <div className="h-full bg-[#ece9d8] bevel-outset rounded-sm overflow-hidden flex flex-col">
              <div className="bg-[#0058ee] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0 flex justify-between items-center">
                <span>Studio Console</span>
                <span className="opacity-80 font-normal normal-case">v2.0</span>
              </div>
              
              <div className="flex-1 flex flex-col bg-[#f4f4f4] overflow-y-auto">
                {/* STUDIO IDENTITY SECTION */}
                <div className="p-3 bg-gradient-to-b from-white to-[#f4f4f4] border-b border-[#d4d4d4]">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 bevel-outset bg-gray-200 rounded-sm shrink-0 shadow-sm overflow-hidden relative group">
                      <img
                        src={profileIcon}
                        alt="Studio"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-sm text-[#003399] leading-tight truncate uppercase tracking-tight">
                        {studioName}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm text-white shadow-sm"
                          style={{ backgroundColor: studioTierInfo.color }}
                        >
                          {studioTierInfo.tier}
                        </div>
                        <span className="text-[9px] text-gray-500 font-bold">
                          Lv.{Math.floor(currentReputation / 10) + 1}
                        </span>
                      </div>
                      
                      {/* Condensed Stats */}
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-gray-500 uppercase font-bold">Balance</span>
                          <span className="text-xs font-bold text-green-700 font-mono leading-none">
                            ${(currentBalance / 1000000).toFixed(2)}M
                          </span>
                        </div>
                        <div className="w-[1px] h-6 bg-gray-300"></div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-gray-500 uppercase font-bold">Reputation</span>
                          <span className="text-xs font-bold text-[#003399] font-mono leading-none">
                            {currentReputation}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tier Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[8px] text-gray-500 mb-0.5 uppercase tracking-wider">
                      <span>Progress to {nextTier ? nextTier.tier : 'Max Tier'}</span>
                      <span>{Math.round(progressToNextTier)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 border border-gray-400 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{
                          width: `${progressToNextTier}%`,
                          backgroundColor: studioTierInfo.color
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* ACTIVE PRODUCTIONS SECTION */}
                <div className="border-b border-[#d4d4d4] bg-white">
                  <div className="px-3 py-1.5 bg-[#e8e8e8] border-b border-[#d4d4d4] flex justify-between items-center">
                    <h3 className="text-[9px] font-bold text-gray-600 uppercase tracking-wide">
                      Live Productions
                    </h3>
                    <span className="px-1.5 py-0.5 bg-white border border-gray-300 rounded-full text-[8px] font-bold text-gray-500">
                      {state.projects.filter(p => p.status !== "Released" && p.studioId === user?.id).length} Active
                    </span>
                  </div>
                  
                  <div className="p-2 space-y-2 min-h-[100px]">
                    {state.projects.filter(
                      (p) => p.status !== "Released" && p.studioId === user?.id
                    ).length === 0 ? (
                      <div className="py-6 flex flex-col items-center justify-center text-gray-400 text-[10px] text-center border-2 border-dashed border-gray-100 rounded-md">
                        <p className="font-bold mb-0.5">Studio Dark</p>
                        <p className="text-[9px]">No productions currently running</p>
                      </div>
                    ) : (
                      state.projects
                        .filter(
                          (p) => p.status !== "Released" && p.studioId === user?.id
                        )
                        .map((p) => {
                          const phaseColors: Record<string, string> = {
                            "Pre-Production": "#8b5cf6",
                            "Filming": "#ef4444",
                            "Post-Production": "#f59e0b",
                            "Marketing": "#3b82f6",
                          };
                          return (
                            <div
                              key={p.id}
                              className="group relative bg-white border border-gray-200 rounded-sm p-2 shadow-sm hover:border-[#0058ee] hover:shadow-md transition-all"
                            >
                              <div className="flex justify-between items-start mb-1.5">
                                <h4 className="text-[10px] font-bold text-gray-800 uppercase truncate pr-2">
                                  {p.title}
                                </h4>
                                <span
                                  className="text-[8px] font-bold text-white px-1.5 py-0.5 rounded-sm shrink-0 uppercase tracking-tight"
                                  style={{ backgroundColor: phaseColors[p.status] || "#808080" }}
                                >
                                  {p.status}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-[9px] text-gray-500 font-mono mb-1">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                  <div 
                                    className="h-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${p.progress}%` }}
                                  />
                                </div>
                                <span className="text-[8px]">{p.progress}%</span>
                              </div>
                              
                              {(p.productionEvents?.length || 0) > 0 && (
                                <div className="text-[8px] text-gray-400 italic truncate pl-0.5 border-l-2 border-gray-200">
                                  {p.productionEvents?.[p.productionEvents.length - 1]?.title}
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* SCRIPT LIBRARY SECTION */}
                <div className="flex-1 bg-white min-h-[140px]">
                  <div className="px-3 py-1.5 bg-[#e8e8e8] border-b border-[#d4d4d4] flex justify-between items-center">
                    <h3 className="text-[9px] font-bold text-gray-600 uppercase tracking-wide">
                      Script Vault
                    </h3>
                     <span className="text-[9px] font-bold text-gray-500">
                      {scriptsOwned} Owned
                    </span>
                  </div>
                  
                  <div className="p-0">
                    {ownedScripts.length === 0 ? (
                      <div className="py-8 flex flex-col items-center justify-center text-gray-400 text-[10px] text-center opacity-60">
                        <img src="/images/Full Recycle Bin.ico" alt="" className="w-8 h-8 mb-2 opacity-50 grayscale" />
                        <p>Vault Empty</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {ownedScripts.map((script) => (
                          <div
                            key={script.id}
                            className="px-3 py-2 flex justify-between items-center hover:bg-blue-50 transition-colors group cursor-default"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-[10px] font-bold text-gray-800 truncate group-hover:text-[#0058ee]">
                                {script.title}
                              </div>
                              <div className="text-[9px] text-gray-500 flex gap-2">
                                <span>{script.genre}</span>
                                <span className="text-gray-300">•</span>
                                <span className="capitalize">{script.quality || 'Standard'} Quality</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                               <div className="text-[9px] font-bold text-green-700 font-mono">
                                ${script.purchase_price?.toLocaleString() ?? '0'}
                               </div>
                               <div className="text-[8px] text-gray-400 uppercase">Valuation</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

{/* Leaderboard Table */}
          <div className="lg:col-span-4 h-full">
            <div className="h-full bg-[#ece9d8] bevel-outset rounded-sm overflow-hidden flex flex-col">
              <div className="bg-[#0058ee] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0 flex justify-between items-center">
                <span>Box Office Power Rankings</span>
                <span className="opacity-80 font-normal normal-case">{clock ? clock.year : state.year} Season</span>
              </div>
              <div className="bg-white flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#f0f0f0] text-gray-500 text-[8px] font-bold uppercase sticky top-0 z-10 border-b border-gray-300">
                    <tr>
                      <th className="px-3 py-2 border-r border-gray-200 w-10 text-center">Rank</th>
                      <th className="px-3 py-2 border-r border-gray-200">Studio</th>
                      <th className="px-3 py-2 text-right">Yearly Gross</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(() => {
                      // Calculate Player's Real Yearly Gross
                      const playerYearlyGross = state.projects
                        .filter(p => p.status === "Released" && p.releaseYear === (clock ? clock.year : state.year))
                        .reduce((sum, p) => sum + p.revenue, 0);

                      const rankedStudios = [
                        {
                          name: studioName,
                          revenue: playerYearlyGross,
                          id: "player",
                          color: "#0058ee",
                          tier: studioTierInfo.tier,
                        },
                        ...state.rivals.map((r) => ({
                          name: r.name,
                          revenue: r.yearlyRevenue,
                          id: r.id,
                          color: r.color,
                          tier: getStudioTier(r.reputation).tier,
                        })),
                      ].sort((a, b) => b.revenue - a.revenue);

                      return rankedStudios.map((s, idx) => (
                        <tr
                          key={s.id}
                          className={`group transition-colors cursor-default ${
                            s.id === "player"
                              ? "bg-blue-50 hover:bg-blue-100"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-3 py-2.5 text-center">
                            <div className={`
                              w-5 h-5 mx-auto flex items-center justify-center text-[10px] font-bold rounded-full
                              ${idx === 0 ? "bg-yellow-100 text-yellow-700" : 
                                idx === 1 ? "bg-gray-100 text-gray-600" :
                                idx === 2 ? "bg-orange-50 text-orange-700" : "text-gray-400"}
                            `}>
                              {idx + 1}
                            </div>
                          </td>
                          <td className="px-3 py-2 border-r border-gray-50 group-hover:border-gray-200">
                            <div className="flex flex-col">
                              <span className={`text-[11px] font-bold truncate ${s.id === "player" ? "text-[#0058ee]" : "text-gray-800"}`}>
                                {s.name} {s.id === "player" && "(You)"}
                              </span>
                              <span className="text-[8px] text-gray-400 uppercase tracking-wide">
                                {s.tier}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                             <div className="flex flex-col items-end">
                                <span className={`font-mono font-bold text-[11px] ${s.revenue > 0 ? "text-green-700" : "text-gray-400"}`}>
                                  ${(s.revenue / 1000000).toFixed(1)}M
                                </span>
                                {s.revenue > 0 && (
                                  <div className="w-16 h-1 mt-1 bg-gray-100 rounded-full overflow-hidden">
                                     <div 
                                        className="h-full bg-green-500 rounded-full opacity-60"
                                        style={{ width: `${Math.min(100, (s.revenue / (rankedStudios[0].revenue || 1)) * 100)}%` }}
                                     />
                                  </div>
                                )}
                             </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Variety Industry News - REDESIGNED */}
          <div className="lg:col-span-4 h-[540px]">
            <div className="h-full bg-white border border-gray-400 flex flex-col shadow-sm">
                {/* Y2K HEADER */}
                <div className="bg-[#cc0000] p-3 flex flex-col border-b-4 border-black">
                    <h1 className="text-white text-3xl font-black italic tracking-tighter leading-none text-center" style={{ fontFamily: "Times New Roman, serif" }}>
                        VARIETY<span className="text-xl font-normal not-italic opacity-80">.com</span>
                    </h1>
                    <div className="text-[9px] text-white font-bold tracking-[0.3em] text-center mt-1 uppercase opacity-90">
                        The Global Authority
                    </div>
                </div>

                {/* SUBHEADER INFO */}
                <div className="bg-[#f0f0f0] border-b border-gray-300 px-2 py-1 flex justify-between items-center text-[9px] text-gray-600 font-bold uppercase">
                    <span>{studioName} Edition</span>
                    <span>{clock ? getMonthName(clock.month) + ' ' + clock.year : state.year}</span>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto bg-white p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f8f8f8] border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-3 py-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-wider w-8">Type</th>
                                <th className="px-3 py-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-wider">Headline</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                             {recentEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="px-4 py-8 text-center text-gray-400 text-xs italic">
                                        No recent industry news.
                                    </td>
                                </tr>
                             ) : (
                                recentEvents.map((e) => (
                                    <tr key={e.id} className="group hover:bg-[#fff9e6] transition-colors">
                                        <td className="px-3 py-2.5 align-top">
                                           <StatusIcon type={e.type} />
                                        </td>
                                        <td className="px-3 py-2.5 align-top">
                                            <div className="text-[11px] leading-snug text-gray-800 font-medium font-sans" style={{ fontFamily: "Verdana, sans-serif" }}>
                                                {e.message}
                                            </div>
                                            <div className="text-[9px] text-gray-400 mt-0.5 font-mono">
                                                {getMonthName(e.month)} {e.year}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                             )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER */}
                <div className="bg-[#f0f0f0] border-t border-gray-300 p-2 text-center">
                    <button className="text-[10px] text-[#cc0000] font-bold hover:underline uppercase tracking-wide">
                        Read Full Issue &rarr;
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
