import React, { useState } from "react";
import { GameState } from "../types";
import { WindowFrame, RetroProgressBar, RetroButton } from "./RetroUI";

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
  // Generate random profile icon once
  const [profileIcon] = useState(
    () => PROFILE_ICONS[Math.floor(Math.random() * PROFILE_ICONS.length)]
  );

  const allStudios = [
    {
      name: state.studioName,
      revenue: state.balance,
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
            <div className="h-64 shrink-0 bg-[#ece9d8] bevel-outset rounded-sm overflow-hidden flex flex-col">
              <div className="bg-[#0058ee] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0">
                Studio Console
              </div>
              <div className="flex-1 flex flex-col gap-4 p-3 bg-[#f4f4f4] overflow-hidden">
                <div className="flex items-center gap-3 border-b border-gray-300 pb-3">
                  <div className="w-12 h-12 bevel-outset rounded-sm shrink-0 shadow-sm overflow-hidden">
                    <img
                      src={profileIcon}
                      alt="Studio"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-sm text-[#003399] leading-tight truncate uppercase tracking-tighter">
                      {state.studioName}
                    </h2>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                      Active Session
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-[#ffffe1] border border-[#808080] p-2 shadow-inner flex justify-between items-center">
                    <span className="text-[9px] text-[#808080] font-bold uppercase">
                      Balance
                    </span>
                    <span className="font-bold text-sm text-green-700 font-mono">
                      ${state.balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white border border-[#808080] p-2 shadow-inner flex justify-between items-center">
                    <span className="text-[9px] text-[#808080] font-bold uppercase">
                      Industry Clout
                    </span>
                    <span className="font-bold text-sm text-blue-700">
                      {state.reputation}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-64 shrink-0 bg-[#ece9d8] bevel-outset rounded-sm overflow-hidden flex flex-col">
              <div className="bg-[#0058ee] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0">
                Live Stages
              </div>
              <div className="flex-1 flex flex-col bg-white overflow-y-auto p-2 space-y-2">
                {state.projects.filter(
                  (p) => p.status !== "Released" && p.studioId === "player"
                ).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-[10px] text-center opacity-40 py-8">
                    <p className="italic">NO ACTIVE PRODUCTIONS</p>
                  </div>
                ) : (
                  state.projects
                    .filter(
                      (p) => p.status !== "Released" && p.studioId === "player"
                    )
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-2 border border-[#d4d4d4] bg-[#f9f9f9] space-y-1.5 shadow-sm shrink-0"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-bold text-[#003399] uppercase truncate w-32">
                            {p.title}
                          </h4>
                          <span className="text-[8px] font-bold text-white bg-gray-500 px-1 py-0.5 rounded-sm uppercase">
                            {p.status.split("-")[0]}
                          </span>
                        </div>
                        <RetroProgressBar progress={p.progress} />
                      </div>
                    ))
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
