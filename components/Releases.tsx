import React, { useState } from "react";
import { GameState, ProjectStatus, Movie } from "../types";
import { RetroButton } from "./RetroUI";

interface Props {
  state: GameState;
}

// Get quality rating as stars
const getQualityStars = (quality: number): string => {
  if (quality >= 90) return "★★★★★";
  if (quality >= 75) return "★★★★☆";
  if (quality >= 60) return "★★★☆☆";
  if (quality >= 45) return "★★☆☆☆";
  if (quality >= 30) return "★☆☆☆☆";
  return "☆☆☆☆☆";
};

// Get profit/loss info
const getProfitInfo = (movie: Movie) => {
  const totalCost = movie.productionBudget + movie.marketingBudget;
  const profit = movie.revenue - totalCost;
  const roi = totalCost > 0 ? ((profit / totalCost) * 100) : 0;
  return { profit, roi, totalCost };
};

// Box Office Charts Tab
const BoxOfficeCharts: React.FC<{ state: GameState }> = ({ state }) => {
  // Get all released movies from current year, sorted by revenue
  const thisYearMovies = state.projects
    .filter(p => p.status === ProjectStatus.Released && p.releaseYear === state.year)
    .sort((a, b) => b.revenue - a.revenue);

  // All-time top 10
  const allTimeTop = state.projects
    .filter(p => p.status === ProjectStatus.Released)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return (
    <div className="p-3 space-y-4 overflow-y-auto h-full">
      {/* This Year's Rankings */}
      <div className="bg-[#ece9d8] bevel-outset p-1">
        <div className="bg-gradient-to-r from-[#0058ee] to-[#0040dd] text-white px-2 py-1 mb-1">
          <span className="text-[10px] font-bold uppercase">📊 {state.year} Box Office Rankings</span>
        </div>
        <div className="bg-white bevel-inset p-2">
          {thisYearMovies.length === 0 ? (
            <p className="text-[10px] text-gray-500 italic text-center py-2">No releases this year</p>
          ) : (
            <table className="w-full text-[9px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-1 font-bold text-gray-600">#</th>
                  <th className="text-left py-1 font-bold text-gray-600">Title</th>
                  <th className="text-left py-1 font-bold text-gray-600">Studio</th>
                  <th className="text-right py-1 font-bold text-gray-600">Gross</th>
                  <th className="text-center py-1 font-bold text-gray-600">Rating</th>
                </tr>
              </thead>
              <tbody>
                {thisYearMovies.map((movie, idx) => {
                  const studio = movie.studioId === 'player'
                    ? state.studioName
                    : state.rivals.find(r => r.id === movie.studioId)?.name || 'Unknown';
                  const isPlayer = movie.studioId === 'player';
                  return (
                    <tr
                      key={movie.id}
                      className={`border-b border-gray-100 ${isPlayer ? 'bg-yellow-50' : ''}`}
                    >
                      <td className="py-1 font-bold text-[#003399]">{idx + 1}</td>
                      <td className="py-1 truncate max-w-[120px]" title={movie.title}>
                        {isPlayer && <span className="text-yellow-600 mr-1">★</span>}
                        {movie.title}
                      </td>
                      <td className="py-1 text-gray-500 truncate max-w-[80px]">{studio}</td>
                      <td className="py-1 text-right font-mono text-green-700">
                        ${(movie.revenue / 1000000).toFixed(1)}M
                      </td>
                      <td className="py-1 text-center text-yellow-500">
                        {getQualityStars(movie.quality)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* All-Time Top 10 */}
      <div className="bg-[#ece9d8] bevel-outset p-1">
        <div className="bg-gradient-to-r from-[#800080] to-[#600060] text-white px-2 py-1 mb-1">
          <span className="text-[10px] font-bold uppercase">🏆 All-Time Top 10</span>
        </div>
        <div className="bg-white bevel-inset p-2">
          {allTimeTop.length === 0 ? (
            <p className="text-[10px] text-gray-500 italic text-center py-2">No releases yet</p>
          ) : (
            <table className="w-full text-[9px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-1 font-bold text-gray-600">#</th>
                  <th className="text-left py-1 font-bold text-gray-600">Title</th>
                  <th className="text-left py-1 font-bold text-gray-600">Year</th>
                  <th className="text-right py-1 font-bold text-gray-600">Gross</th>
                </tr>
              </thead>
              <tbody>
                {allTimeTop.map((movie, idx) => {
                  const isPlayer = movie.studioId === 'player';
                  return (
                    <tr
                      key={movie.id}
                      className={`border-b border-gray-100 ${isPlayer ? 'bg-yellow-50' : ''}`}
                    >
                      <td className="py-1 font-bold text-[#800080]">{idx + 1}</td>
                      <td className="py-1 truncate max-w-[150px]" title={movie.title}>
                        {isPlayer && <span className="text-yellow-600 mr-1">★</span>}
                        {movie.title}
                      </td>
                      <td className="py-1 text-gray-500">{movie.releaseYear}</td>
                      <td className="py-1 text-right font-mono text-green-700 font-bold">
                        ${(movie.revenue / 1000000).toFixed(1)}M
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// My Films Tab
const MyFilms: React.FC<{ state: GameState }> = ({ state }) => {
  const released = state.projects
    .filter((p) => p.status === ProjectStatus.Released && p.studioId === 'player')
    .reverse();

  return (
    <div className="flex flex-col h-full bg-white">
      {released.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
          <img
            src="/images/Documents.ico"
            alt="No files"
            className="w-16 h-16 mb-2 opacity-20"
          />
          <p className="text-[10px] font-bold uppercase tracking-widest">
            No archival footage found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 overflow-y-auto h-full">
          {released.map((movie) => {
            const { profit, roi, totalCost } = getProfitInfo(movie);
            const isProfit = profit >= 0;
            const cast = state.actors.filter(a => movie.cast.includes(a.id));

            return (
              <div
                key={movie.id}
                className="bg-[#ece9d8] bevel-outset p-1 shrink-0"
              >
                {/* Title Bar */}
                <div className="bg-gradient-to-r from-[#0058ee] to-[#0040dd] text-white px-2 py-1 flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <span className="text-[10px]">🎬</span>
                    <span className="text-[11px] font-bold truncate">
                      {movie.title}
                    </span>
                  </div>
                  <span className="text-[9px] bg-white/20 px-1 rounded shrink-0">
                    {movie.genre}
                  </span>
                </div>

                {/* Content */}
                <div className="bg-white bevel-inset p-2">
                  {/* Quality Stars */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-500 text-[14px]">{getQualityStars(movie.quality)}</span>
                    <span className="text-[9px] text-gray-500">({movie.quality}% quality)</span>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-gray-50 border border-gray-200 p-1.5 mb-2 rounded">
                    <div className="grid grid-cols-2 gap-1 text-[9px]">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Budget:</span>
                        <span className="font-mono">${(totalCost / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Gross:</span>
                        <span className="font-mono font-bold text-[#003399]">
                          ${(movie.revenue / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Profit:</span>
                        <span className={`font-mono font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                          {isProfit ? '+' : ''}${(profit / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">ROI:</span>
                        <span className={`font-mono font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                          {roi > 0 ? '+' : ''}{roi.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-gray-500 font-bold uppercase">
                        Released:
                      </span>
                      <span className="font-bold text-[#003399]">
                        Q{Math.ceil(movie.releaseMonth / 3)}{" "}
                        {movie.releaseYear}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-gray-500 font-bold uppercase">
                        Chemistry:
                      </span>
                      <span className="font-bold text-purple-600">
                        {movie.chemistry > 0 ? `+${movie.chemistry}` : movie.chemistry}
                      </span>
                    </div>
                  </div>

                  {/* Cast */}
                  {cast.length > 0 && (
                    <div className="border-t border-gray-200 pt-1.5 mb-2">
                      <div className="text-[8px] text-gray-400 font-bold uppercase mb-1">
                        Cast:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cast.map(actor => (
                          <span
                            key={actor.id}
                            className="text-[8px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200"
                            title={`${actor.name} (${actor.tier})`}
                          >
                            {actor.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review */}
                  <div className="border-t border-gray-200 pt-1">
                    <div className="text-[8px] text-gray-400 font-bold uppercase mb-0.5">
                      Review:
                    </div>
                    <p
                      className="text-[10px] text-gray-700 italic leading-snug"
                      style={{ fontFamily: "Tahoma, sans-serif" }}
                    >
                      "{movie.reviews?.[0] || "..."}"
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ReleasedFilms: React.FC<Props> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'my-films' | 'charts'>('my-films');

  return (
    <div className="h-full flex flex-col bg-[#ece9d8] overflow-hidden p-2">
      <div className="flex flex-col h-full bg-[#ece9d8] bevel-outset overflow-hidden">
        {/* Header with tabs */}
        <div className="bg-[#0058ee] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0 flex items-center justify-between">
          <span>Historical Filmography Records</span>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('my-films')}
              className={`px-2 py-0.5 text-[9px] rounded ${
                activeTab === 'my-films'
                  ? 'bg-white text-[#0058ee]'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              My Films
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-2 py-0.5 text-[9px] rounded ${
                activeTab === 'charts'
                  ? 'bg-white text-[#0058ee]'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Box Office Charts
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'my-films' ? (
          <MyFilms state={state} />
        ) : (
          <BoxOfficeCharts state={state} />
        )}
      </div>
    </div>
  );
};
