import React, { useState } from "react";
import { Actor, ActorTier } from "../types";
import { WindowFrame, RetroProgressBar, RetroButton } from "./RetroUI";
import { useActors } from "../hooks/useActors";

interface Props {
  actors?: Actor[]; // Optional - will use Supabase if not provided
}

interface DetailProps {
  actor: Actor;
  allActors: Actor[];
  onClose: () => void;
}

// Fallback gossip if actor has no personalized gossip
const FALLBACK_GOSSIP = [
  "No major gossip at the moment. Laying low.",
  "Keeping a surprisingly clean image lately.",
];

const ActorDetailModal: React.FC<DetailProps> = ({
  actor,
  allActors,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"General" | "Career" | "Rumors">(
    "General"
  );

  const getGossip = () => {
    // Use real gossip from actor if available
    if (actor.gossip && actor.gossip.length > 0) {
      return actor.gossip.slice(0, 4); // Show up to 4 gossip items
    }
    return FALLBACK_GOSSIP;
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 pointer-events-auto">
      <div className="w-full max-w-md shadow-2xl">
        <WindowFrame
          title={`${actor.name} Properties`}
          onClose={onClose}
          showMaximize={false}
        >
          <div className="bg-[#ece9d8] p-3 flex flex-col gap-3 h-[450px]">
            <div className="flex items-end px-1 gap-1 shrink-0 border-b border-[#808080]">
              {(["General", "Career", "Rumors"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-3 py-1 text-[11px] border-t border-x rounded-t-sm mb-[-1px] relative z-10 transition-all
                    ${
                      activeTab === tab
                        ? "bg-white border-[#808080] border-b-white font-bold"
                        : "bg-[#dcd8c0] border-[#808080] text-gray-700 hover:bg-[#e4e0c8]"
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 bg-white border border-[#808080] p-4 overflow-y-auto shadow-inner">
              {activeTab === "General" && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bevel-inset p-0.5 bg-white shrink-0 w-24 h-32 flex items-center justify-center bg-gradient-to-br from-[#0058ee] to-[#003399]">
                      <span className="text-3xl font-black text-white/90 tracking-tighter">
                        {actor.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="border-b border-gray-200 pb-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase block">
                          Stage Name
                        </label>
                        <span className="text-sm font-bold text-[#003399]">
                          {actor.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold uppercase block">
                            Age
                          </label>
                          <span className="text-xs">{actor.age} years</span>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold uppercase block">
                            Tier
                          </label>
                          <span className="text-xs font-bold">
                            {actor.tier}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">
                      Official Bio
                    </label>
                    <p className="text-xs leading-relaxed text-gray-700 italic border-l-2 border-blue-200 pl-3">
                      {actor.bio}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "Career" && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold text-gray-400 border-b border-gray-100 uppercase pb-1 tracking-widest">
                      Core Performance Metrics
                    </h4>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>Thespian Capability</span>
                          <span>{actor.skill}%</span>
                        </div>
                        <RetroProgressBar progress={actor.skill} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>Marketability Index</span>
                          <span>{actor.reputation}%</span>
                        </div>
                        <RetroProgressBar progress={actor.reputation} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded shadow-inner">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-600 uppercase">
                        Standard Contract Fee
                      </span>
                      <span className="text-lg font-mono font-bold text-green-700">
                        ${actor.salary.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Rumors" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-red-700 border-b border-red-100 uppercase pb-1 tracking-widest">
                      Latest Gossip
                    </h4>
                    <div className="space-y-2">
                      {getGossip().map((msg, i) => (
                        <div
                          key={i}
                          className="bg-red-50 border border-red-100 p-3 text-[11px] italic text-red-900 shadow-sm leading-tight"
                        >
                          "{msg}"
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold text-blue-700 border-b border-blue-100 uppercase pb-1 tracking-widest">
                      Chemistry & Connections
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(actor.relationships).length === 0 ? (
                        <p className="text-[10px] text-gray-400 italic">
                          No public data on industry rivalries or romances.
                        </p>
                      ) : (
                        (Object.entries(actor.relationships) as [string, number][]).map(
                          ([otherId, value]) => {
                            const otherActor = allActors.find(
                              (a) => a.id === otherId
                            );
                            if (!otherActor) return null;
                            return (
                              <div
                                key={otherId}
                                className="flex items-center justify-between bg-blue-50/50 p-2 border border-blue-100 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full border border-blue-200 bg-gradient-to-br from-[#0058ee] to-[#003399] flex items-center justify-center">
                                    <span className="text-[8px] font-black text-white">
                                      {otherActor.name.split(" ").map(n => n[0]).join("")}
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-bold text-gray-700">
                                    {otherActor.name}
                                  </span>
                                </div>
                                <span
                                  className={`text-[10px] font-black ${
                                    value > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {value > 0 ? "SYNCHRONIZED" : "FRICTION"}
                                </span>
                              </div>
                            );
                          }
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 shrink-0 pt-1">
              <RetroButton
                onClick={onClose}
                variant="primary"
                className="min-w-[80px]"
              >
                OK
              </RetroButton>
              <RetroButton onClick={onClose} className="min-w-[80px]">
                Cancel
              </RetroButton>
            </div>
          </div>
        </WindowFrame>
      </div>
    </div>
  );
};

export const ActorDb: React.FC<Props> = ({ actors: propActors }) => {
  const { actors: supabaseActors, loading } = useActors();
  const [filter, setFilter] = React.useState<ActorTier | "All">("All");
  const [selectedActor, setSelectedActor] = React.useState<Actor | null>(null);

  // Use Supabase actors if no prop provided
  const actors = propActors || supabaseActors;

  const sortedActors = [...actors].sort((a, b) => {
    const scoreA = a.status === "Deceased" ? 2 : a.status === "Retired" ? 1 : 0;
    const scoreB = b.status === "Deceased" ? 2 : b.status === "Retired" ? 1 : 0;
    return scoreA - scoreB;
  });

  if (loading && !propActors) {
    return (
      <div className="h-full flex items-center justify-center bg-[#ece9d8]">
        <p className="text-gray-500 text-sm">Loading talent pool...</p>
      </div>
    );
  }

  const filteredActors =
    filter === "All"
      ? sortedActors
      : sortedActors.filter((a) => a.tier === filter);

  return (
    <div className="h-full flex flex-col bg-[#ece9d8] overflow-hidden">
      {/* FIXED FILTER HEADER */}
      <div className="flex gap-1 px-2 pt-2 pb-1 bg-[#ece9d8] border-b border-[#808080] overflow-x-auto no-scrollbar shrink-0">
        {["All", ...Object.values(ActorTier)].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t as any)}
            className={`px-3 py-1 text-[10px] border-2 transition-all whitespace-nowrap ${
              filter === t
                ? "bg-white border-[#808080] border-t-[#404040] border-l-[#404040] font-bold shadow-inner"
                : "bg-[#ece9d8] border-white border-r-[#808080] border-b-[#808080] hover:bg-[#f5f5f5]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* SCROLLABLE GRID BODY */}
      <div className="flex-1 min-h-0 flex flex-col bg-[#ece9d8] bevel-outset overflow-hidden mx-2 mb-2">
        <div className="bg-[#0058ee] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0">
          Talent Directory - {filteredActors.length} records
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-3 overflow-y-auto h-full bg-[#f1f1f1]">
          {filteredActors.map((actor) => {
            const isDeceased = actor.status === "Deceased";
            return (
              <div
                key={actor.id}
                className={`bg-[#ece9d8] bevel-outset p-1 ${
                  isDeceased ? "opacity-60" : ""
                }`}
              >
                {/* Title Bar */}
                <div className="bg-gradient-to-r from-[#0058ee] to-[#0040dd] text-white px-2 py-1 flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <span className="text-[10px]">👤</span>
                    <span className="text-[11px] font-bold truncate">
                      {actor.name}
                    </span>
                  </div>
                  <span className="text-[8px] bg-white/20 px-1 rounded shrink-0">
                    {actor.tier}
                  </span>
                </div>

                {/* Content */}
                <div className="bg-white bevel-inset p-2">
                  {/* Status Badge */}
                  <div className="mb-2">
                    <div
                      className={`text-[9px] font-bold px-2 py-0.5 border text-center inline-block ${
                        actor.status === "Available"
                          ? "bg-green-100 border-green-500 text-green-700"
                          : actor.status === "In Production"
                          ? "bg-blue-100 border-blue-500 text-blue-700"
                          : actor.status === "On Hiatus"
                          ? "bg-yellow-100 border-yellow-500 text-yellow-700"
                          : actor.status === "Retired"
                          ? "bg-purple-100 border-purple-500 text-purple-700"
                          : actor.status === "Deceased"
                          ? "bg-gray-200 border-gray-600 text-gray-600"
                          : "bg-gray-100 border-gray-400 text-gray-500"
                      }`}
                    >
                      {actor.status.toUpperCase()}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="space-y-1.5 mb-2">
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-gray-500 font-bold uppercase">
                        Age:
                      </span>
                      <span className="font-bold text-gray-700">
                        {actor.age}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-gray-500 font-bold uppercase">
                        Gender:
                      </span>
                      <span className="font-bold text-gray-700">
                        {actor.gender}
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-gray-500 uppercase mb-0.5">
                        <span>Skill</span>
                        <span>{actor.skill}%</span>
                      </div>
                      <RetroProgressBar progress={actor.skill} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-gray-500 uppercase mb-0.5">
                        <span>Reputation</span>
                        <span>{actor.reputation}%</span>
                      </div>
                      <RetroProgressBar progress={actor.reputation} />
                    </div>
                  </div>

                  {/* Visual Description */}
                  {actor.visualDescription && (
                    <div className="text-[8px] text-gray-600 italic mb-2 line-clamp-2">
                      {actor.visualDescription}
                    </div>
                  )}

                  {/* Personality Tags */}
                  {actor.personality && actor.personality.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {actor.personality.slice(0, 3).map((trait, i) => (
                        <span
                          key={i}
                          className="text-[7px] px-1.5 py-0.5 bg-purple-100 text-purple-700 border border-purple-300 rounded-sm font-bold"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Salary */}
                  <div className="border-t border-gray-200 pt-1.5 flex items-center justify-between">
                    <span className="text-[8px] text-gray-500 font-bold uppercase">
                      Salary:
                    </span>
                    <span className="text-sm font-mono font-bold text-[#003399]">
                      ${(actor.salary / 1000).toFixed(0)}K
                    </span>
                  </div>

                  {/* Details Button */}
                  <button
                    onClick={() => setSelectedActor(actor)}
                    className="w-full mt-2 px-2 py-1 bg-[#ece9d8] border-2 border-white border-r-[#808080] border-b-[#808080] text-[9px] font-bold hover:bg-[#f5f5f5] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
                  >
                    VIEW DETAILS
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedActor && (
        <ActorDetailModal
          actor={selectedActor}
          allActors={actors}
          onClose={() => setSelectedActor(null)}
        />
      )}
    </div>
  );
};
