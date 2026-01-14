import React, { useState } from "react";
import { GameState, ProjectStatus, Movie } from "../types";
import { RetroButton, ExplorerToolbar } from "./RetroUI";
import { useAuth } from "../contexts/AuthContext";

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

// Box Office Charts Tab
const BoxOfficeCharts: React.FC<{ state: GameState }> = ({ state }) => {
  const { user } = useAuth();
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
    <div className="flex flex-col h-full bg-white font-tahoma text-[11px] overflow-hidden">
       {/* Info Bar */}
      <div className="bg-[#ece9d8] p-2 border-b border-[#d8d0c8] flex items-center gap-2">
         <img src="/images/info.svg" className="w-5 h-5" alt="Charts" />
         <div className="flex flex-col">
            <span className="font-bold text-gray-800">Box Office & Rankings</span>
            <span className="text-[9px] text-gray-500">Industry Performance Data</span>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white">
        
        {/* THIS YEAR CHART */}
        <div className="w-full">
            <h3 className="text-[#003399] font-bold text-[12px] mb-1 flex items-center gap-1 border-b border-[#003399] pb-0.5">
                <img src="/images/Documents.ico" className="w-4 h-4" /> 
                {state.year} Box Office Leaders
            </h3>
            {thisYearMovies.length === 0 ? (
                <div className="text-gray-400 italic p-4 text-center border border-dashed border-gray-300 rounded">
                    Waiting for box office results...
                </div>
            ) : (
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#ece9d8] text-gray-600 border-b border-[#d8d0c8]">
                            <th className="text-left px-2 py-1 w-8">#</th>
                            <th className="text-left px-2 py-1">Title</th>
                            <th className="text-left px-2 py-1">Studio</th>
                            <th className="text-right px-2 py-1">Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {thisYearMovies.map((m, i) => (
                             <tr key={m.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-2 py-1 font-bold text-gray-500">{i + 1}</td>
                                <td className="px-2 py-1 text-[#003399] font-medium">{m.title}</td>
                                <td className="px-2 py-1 text-gray-500 text-[10px]">
                                    {m.studioId === user?.id ? "You" : state.rivals.find(r => r.id === m.studioId)?.name || "Unknown"}
                                </td>
                                <td className="px-2 py-1 text-right font-bold text-green-700">
                                    ${(m.revenue / 1000000).toFixed(1)}M
                                </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>

        {/* ALL TIME CHART */}
         <div className="w-full">
            <h3 className="text-[#003399] font-bold text-[12px] mb-1 flex items-center gap-1 border-b border-[#003399] pb-0.5">
                <img src="/images/Documents.ico" className="w-4 h-4" /> 
                All-Time Blockbusters
            </h3>
             <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#ece9d8] text-gray-600 border-b border-[#d8d0c8]">
                            <th className="text-left px-2 py-1 w-8">#</th>
                            <th className="text-left px-2 py-1">Title</th>
                            <th className="text-left px-2 py-1">Year</th>
                            <th className="text-right px-2 py-1">Gross</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allTimeTop.map((m, i) => (
                             <tr key={m.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-2 py-1 font-bold text-gray-500">{i + 1}</td>
                                <td className="px-2 py-1 text-[#003399] font-medium">{m.title}</td>
                                <td className="px-2 py-1 text-gray-500">{m.releaseYear}</td>
                                <td className="px-2 py-1 text-right font-bold text-green-700">
                                    ${(m.revenue / 1000000).toFixed(1)}M
                                </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
        </div>

      </div>
    </div>
  );
};

// My Films Tab - Renamed to "Detailed List"
const MyFilms: React.FC<{ state: GameState }> = ({ state }) => {
  const { user } = useAuth();
  const [sortCol, setSortCol] = useState<'title' | 'release' | 'genre' | 'revenue' | 'rating'>('release');
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const released = state.projects
    .filter((p) => p.status === ProjectStatus.Released && p.studioId === user?.id);

  const sorted = [...released].sort((a, b) => {
      let valA, valB;
      switch(sortCol) {
          case 'title': valA = a.title; valB = b.title; break;
          case 'release': valA = a.releaseYear * 12 + a.releaseMonth; valB = b.releaseYear * 12 + b.releaseMonth; break;
          case 'genre': valA = a.genre; valB = b.genre; break;
          case 'revenue': valA = a.revenue; valB = b.revenue; break;
          case 'rating': valA = a.quality; valB = b.quality; break;
          default: return 0;
      }
      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
  });

  const handleSort = (col: typeof sortCol) => {
      if (sortCol === col) setSortDesc(!sortDesc);
      else {
          setSortCol(col);
          setSortDesc(true);
      }
  }

  const SortHeader: React.FC<{ label: string; col: typeof sortCol; width?: string }> = ({ label, col, width }) => (
      <th 
        className={`px-2 py-0.5 text-left font-normal text-gray-600 border-r border-[#d8d0c8] cursor-pointer hover:bg-[#f5f2e6] active:bg-[#e0decb] select-none ${width}`}
        onClick={() => handleSort(col)}
      >
        <div className="flex items-center justify-between">
            {label}
            {sortCol === col && (
                <span className="text-[9px] text-gray-400 ml-1">{sortDesc ? '▼' : '▲'}</span>
            )}
        </div>
      </th>
  )

  return (
    <div className="flex bg-white h-full font-tahoma text-[11px]">
        {/* SIDEBAR */}
        <div className="w-48 bg-gradient-to-b from-[#7b9fe9] to-[#6079d6] p-3 flex flex-col gap-3 border-r border-[#003399] overflow-y-auto shrink-0">
             {/* Film Tasks Panel */}
             <div className="bg-white rounded-t-sm rounded-b-sm overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1 flex justify-between items-center cursor-pointer">
                    <span className="font-bold text-white">Film Tasks</span>
                </div>
                <div className="bg-[#d6dff7] p-2 flex flex-col gap-1 text-[#215dc6]">
                    <button className="text-left hover:underline px-1 py-0.5 flex items-center gap-1">
                        <img src="/images/Documents.ico" className="w-3 h-3" />
                        <span>View script details</span>
                    </button>
                    <button className="text-left hover:underline px-1 py-0.5 flex items-center gap-1">
                        <img src="/images/Video.ico" className="w-3 h-3" />
                         <span>Distribute to DVD</span>
                    </button>
                    <button className="text-left hover:underline px-1 py-0.5 flex items-center gap-1 opacity-50 cursor-not-allowed">
                        <img src="/images/Chart.ico" className="w-3 h-3 grayscale" />
                        <span>Archive record</span>
                    </button>
                </div>
             </div>
             
             {/* Details Panel */}
             <div className="bg-white rounded-t-sm rounded-b-sm overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1 flex justify-between items-center cursor-pointer">
                    <span className="font-bold text-white">Details</span>
                </div>
                <div className="bg-[#d6dff7] p-2 text-[#215dc6] min-h-[100px]">
                    {selectedId ? (
                        <div className="text-[10px] space-y-1">
                            {(() => {
                                const m = released.find(f => f.id === selectedId);
                                if (!m) return null;
                                const totalCost = m.productionBudget + m.marketingBudget;
                                const profit = m.revenue - totalCost;
                                return (
                                    <>
                                        <div className="font-bold text-[11px] mb-1">{m.title}</div>
                                        <div className="grid grid-cols-[50px_1fr] gap-x-1">
                                            <span className="opacity-70">Genre:</span>
                                            <span>{m.genre}</span>
                                            
                                            <span className="opacity-70">Quality:</span>
                                            <span>{m.quality}%</span>
                                            
                                            <span className="opacity-70">Budget:</span>
                                            <span>${(totalCost/1000000).toFixed(1)}M</span>
                                            
                                            <span className="opacity-70">Profit:</span>
                                            <span className={profit >= 0 ? "text-green-700 font-bold" : "text-red-700 font-bold"}>
                                                {profit >= 0 ? '+' : ''}${(profit/1000000).toFixed(1)}M
                                            </span>
                                        </div>
                                        <div className="italic mt-2 p-1 bg-white/50 border border-white/60 rounded text-gray-600">
                                            "{m.reviews?.[0] || '...'}"
                                        </div>
                                    </>
                                )
                            })()}
                        </div>
                    ) : (
                        <div className="text-[10px] opacity-70 italic p-2 text-center">
                            Select a film to view details.
                        </div>
                    )}
                </div>
             </div>
        </div>

        {/* MAIN LIST VIEW */}
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
            <div className="py-1 px-2 text-gray-500 border-b border-[#d8d0c8]">
                Address: <span className="text-black ml-1 border border-[#ccc] px-1 bg-white w-64 inline-block">C:\My Documents\My Films\</span>
            </div>
            
            <div className="flex-1 overflow-auto bg-white">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-[#ece9d8] hover:bg-[#f1efe6] shadow-sm z-10 border-b border-[#d4d0c8]">
                        <tr>
                            <th className="w-6 border-r border-[#d4d0c8]"></th>
                            <SortHeader label="Name" col="title" />
                            <SortHeader label="Date Modified" col="release" width="w-24" />
                            <SortHeader label="Type" col="genre" width="w-24" />
                            <SortHeader label="Size (Gross)" col="revenue" width="w-24 text-right" />
                            <SortHeader label="Rating" col="rating" width="w-20" />
                        </tr>
                    </thead>
                    <tbody className="bg-white cursor-default">
                        {sorted.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                                    <img src="/images/Documents.ico" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    No films in archive.
                                </td>
                            </tr>
                        ) : sorted.map((movie) => {
                            const isSelected = selectedId === movie.id;
                            return (
                                <tr 
                                    key={movie.id}
                                    onClick={() => setSelectedId(movie.id)}
                                    className={`${isSelected ? 'bg-[#316ac5] text-white' : 'hover:bg-[#e8f1ff] text-gray-800'}`}
                                >
                                    <td className="px-2 py-0.5 text-center">
                                        <img src="/images/Video.ico" className="w-3 h-3" />
                                    </td>
                                    <td className="px-2 py-0.5 whitespace-nowrap">{movie.title}</td>
                                    <td className="px-2 py-0.5 whitespace-nowrap">
                                        {movie.releaseMonth}/{movie.releaseYear}
                                    </td>
                                    <td className="px-2 py-0.5 whitespace-nowrap text-gray-500">{movie.genre} Movie</td>
                                    <td className="px-2 py-0.5 text-right font-mono">
                                        ${(movie.revenue/1000000).toFixed(1)}M
                                    </td>
                                    <td className="px-2 py-0.5 text-center text-yellow-500 text-[10px]">
                                        {getQualityStars(movie.quality)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            
            <div className="h-5 bg-[#ece9d8] border-t border-[#aca899] flex items-center select-none cursor-default font-tahoma text-[11px] shrink-0">
                 <div className="flex-1 flex items-center gap-2 px-2 border-r border-[#aca899] shadow-[1px_0_0_white]">
                      <span className="font-bold">{released.length} objects</span>
                      {released.length > 0 && (
                        <span className="text-gray-600 ml-2 border-l border-white pl-2">
                             Disk free space: {(state.balance / 1000000).toFixed(2)} MB
                        </span>
                      )}
                 </div>
                 <div className="w-[150px] px-2 border-l border-white border-r border-[#aca899] shadow-[1px_0_0_white_inset] truncate">
                     <span className="truncate">My Computer</span>
                 </div>
            </div>
        </div>
    </div>
  );
};

// Simplified ReleasedFilms component - My Films only
export const ReleasedFilms: React.FC<Props> = ({ state }) => {
  return (
    <div className="h-full flex flex-col bg-[#ece9d8] font-tahoma text-[11px]">
        {/* CONTENT FRAME */}
        <div className="flex-1 bg-white overflow-hidden">
             <MyFilms state={state} />
        </div>
    </div>
  );
};
