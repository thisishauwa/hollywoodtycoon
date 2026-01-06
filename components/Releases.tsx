import React from "react";
import { GameState, ProjectStatus } from "../types";
import { WindowFrame } from "./RetroUI";

interface Props {
  state: GameState;
}

export const ReleasedFilms: React.FC<Props> = ({ state }) => {
  const released = state.projects
    .filter((p) => p.status === ProjectStatus.Released)
    .reverse();

  return (
    <div className="h-full flex flex-col bg-[#ece9d8] overflow-hidden p-2">
      <div className="flex flex-col h-full bg-[#ece9d8] bevel-outset overflow-hidden">
        <div className="bg-[#0058ee] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0">
          Historical Filmography Records
        </div>
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
              {released.map((movie) => (
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
                    <div className="flex gap-2 mb-2">
                      {/* Info Section */}
                      <div className="flex-1 space-y-1">
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
                            Quality:
                          </span>
                          <span className="font-bold text-green-700">
                            {movie.quality}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="text-gray-500 font-bold uppercase">
                            Box Office:
                          </span>
                          <span className="font-bold text-[#003399] font-mono">
                            ${(movie.revenue / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review */}
                    <div className="border-t border-gray-200 pt-1 mt-1">
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
