import React, { useState } from 'react';
import { GameState, AwardsCeremony, AwardCategory, AwardNomination } from '../types';
import { getPlayerAwardCount } from '../services/awardsService';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  state: GameState;
}

const CATEGORY_LABELS: Record<AwardCategory, string> = {
  [AwardCategory.BestPicture]: 'Best Picture',
  [AwardCategory.BestActor]: 'Best Actor',
  [AwardCategory.BestActress]: 'Best Actress',
  [AwardCategory.BestDirector]: 'Best Director',
  [AwardCategory.BestScreenplay]: 'Best Screenplay',
  [AwardCategory.BestCinematography]: 'Best Cinematography',
  [AwardCategory.BestScore]: 'Best Score',
};

// Start Menu/Toolbar component usage would go here if extracted, 
// for now we inline the toolbar to match Releases.tsx pattern

export const Awards: React.FC<Props> = ({ state }) => {
  const { user } = useAuth();
  const { wins, nominations } = getPlayerAwardCount(state.awardsCeremonies || []);
  const ceremonies = [...(state.awardsCeremonies || [])].reverse();
  const [selectedCeremonyId, setSelectedCeremonyId] = useState<string | null>(null);
  const selectedCeremony = ceremonies.find(c => c.id === selectedCeremonyId);

  return (
    <div className="h-full flex flex-col bg-[#ece9d8] font-tahoma text-[11px]">
        {/* MENUBAR (Visual Only) */}
        <div className="h-5 bg-[#ece9d8] flex items-center px-1 border-b border-[#d4d0c8] select-none text-black">
            <span className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white cursor-default">File</span>
            <span className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white cursor-default">Edit</span>
            <span className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white cursor-default">View</span>
            <span className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white cursor-default">Favorites</span>
            <span className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white cursor-default">Tools</span>
            <span className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white cursor-default">Help</span>
        </div>

        {/* STANDARD BUTTONS TOOLBAR */}
        <div className="h-10 bg-[#ece9d8] border-b border-[#d4d0c8] flex items-center px-2 gap-1 shrink-0 select-none">
            <div className="flex items-center gap-1 pr-1 border-r border-[#d4d0c8] mr-1">
                <button className="flex items-center gap-1 hover:brightness-110 active:brightness-95 group">
                    <img src="/images/Frame 99.svg" className="w-5 h-5 transform scale-x-[-1]" alt="Back" />
                    <span className="text-[11px]">Back</span>
                    <span className="text-[8px] ml-1">▼</span>
                </button>
                <img src="/images/Frame 99.svg" className="w-5 h-5 opacity-50" alt="Forward" />
            </div>
            
            <button className="p-1 hover:border border-[#d4d0c8] hover:shadow-sm active:shadow-inner rounded mx-1 w-6 h-6 flex items-center justify-center bg-white border border-gray-300">
                <span className="font-bold text-gray-500 text-[10px] pb-1">↑</span>
            </button>
            
            <div className="w-[1px] h-6 bg-[#d4d0c8] mx-1"></div>
            
             <div className="flex items-center gap-1 px-2">
                <img src="/images/Documents.ico" className="w-5 h-5" />
                <span className="font-bold text-gray-500">Awards Database</span>
             </div>
        </div>

        {/* ADDRESS BAR */}
        <div className="h-6 bg-[#ece9d8] border-b border-[#d8d0c8] flex items-center px-2 gap-2 shadow-sm z-10 shrink-0">
            <span className="text-gray-500">Address:</span>
            <div className="bg-white border border-[#7f9db9] h-4 flex-1 flex items-center px-1 shadow-inner">
                 <img src="/images/Documents.ico" className="w-3 h-3 mr-1" />
                 <span className="text-black">C:\My Documents\Awards\history</span>
            </div>
            <div className="flex items-center gap-1 text-[#0066cc] hover:underline cursor-pointer">
                <span className="font-bold text-[11px] text-white bg-green-500 px-2 rounded-sm border border-green-600">Go</span>
            </div>
        </div>

       <div className="flex flex-1 overflow-hidden bg-white">
            {/* SIDEBAR */}
            <div className="w-48 bg-gradient-to-b from-[#7b9fe9] to-[#6079d6] p-3 flex flex-col gap-3 border-r border-[#003399] overflow-y-auto shrink-0 text-white">
                 {/* Award Tasks Panel */}
                <div className="bg-white rounded-t-sm rounded-b-sm overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1 flex justify-between items-center cursor-pointer">
                        <span className="font-bold text-white">Award Tasks</span>
                    </div>
                    <div className="bg-[#d6dff7] p-2 flex flex-col gap-1 text-[#215dc6]">
                        <div className="flex items-center gap-1 px-1 py-0.5">
                             <img src="/images/Documents.ico" className="w-3 h-3" />
                             <span className="font-bold">Total Wins: {wins}</span>
                        </div>
                        <div className="flex items-center gap-1 px-1 py-0.5">
                             <img src="/images/Documents.ico" className="w-3 h-3 opacity-50" />
                             <span>Total Noms: {nominations}</span>
                        </div>
                    </div>
                </div>

                {/* Details Panel */}
                <div className="bg-white rounded-t-sm rounded-b-sm overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1 flex justify-between items-center cursor-pointer">
                        <span className="font-bold text-white">Ceremony Info</span>
                    </div>
                    <div className="bg-[#d6dff7] p-2 text-[#215dc6] min-h-[100px]">
                        {selectedCeremony ? (
                            <div className="text-[10px] space-y-2">
                                <div className="font-bold border-b border-[#abc0e7] pb-1">{selectedCeremony.name}</div>
                                
                                {(() => {
                                    const cWins = selectedCeremony.nominations.filter(n => n.studioId === 'player' && n.isWinner).length;
                                    const cNoms = selectedCeremony.nominations.filter(n => n.studioId === 'player').length;
                                    return (
                                        <div className="grid grid-cols-[60px_1fr] gap-x-1">
                                            <span>Your Wins:</span>
                                            <span className="font-bold">{cWins}</span>
                                            
                                            <span>Your Noms:</span>
                                            <span>{cNoms}</span>
                                            
                                            <span>Status:</span>
                                            <span>{selectedCeremony.completed ? "Completed" : "Announced"}</span>
                                        </div>
                                    )
                                })()}
                            </div>
                        ) : (
                            <div className="text-[10px] opacity-70 italic p-2 text-center">
                                Select a ceremony to view winners.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-auto bg-white flex flex-col">
                 <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-[#ece9d8] hover:bg-[#f1efe6] shadow-sm z-10 border-b border-[#d4d0c8]">
                        <tr>
                            <th className="w-6 border-r border-[#d4d0c8] px-1 py-0.5"></th>
                            <th className="text-left px-2 py-0.5 border-r border-[#d4d0c8] font-normal text-gray-600">Ceremony Name</th>
                            <th className="text-left px-2 py-0.5 border-r border-[#d4d0c8] font-normal text-gray-600">Year</th>
                            <th className="text-left px-2 py-0.5 border-r border-[#d4d0c8] font-normal text-gray-600">Your Results</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white cursor-default">
                        {ceremonies.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                                    <img src="/images/Documents.ico" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    No award ceremonies recorded yet.
                                </td>
                            </tr>
                        ) : ceremonies.map((ceremony) => {
                             const cWins = ceremony.nominations.filter(n => n.studioId === 'player' && n.isWinner).length;
                             const cNoms = ceremony.nominations.filter(n => n.studioId === 'player').length;
                             const isSelected = selectedCeremonyId === ceremony.id;

                             return (
                                <React.Fragment key={ceremony.id}>
                                    {/* Ceremony Row */}
                                    <tr 
                                        onClick={() => setSelectedCeremonyId(isSelected ? null : ceremony.id)}
                                        className={`${isSelected ? 'bg-[#316ac5] text-white' : 'hover:bg-[#e8f1ff] text-gray-800'}`}
                                    >
                                        <td className="px-2 py-0.5 text-center">
                                            <img src="/images/Documents.ico" className="w-3 h-3" />
                                        </td>
                                        <td className="px-2 py-0.5 font-bold">{ceremony.name}</td>
                                        <td className="px-2 py-0.5">{ceremony.year}</td>
                                        <td className="px-2 py-0.5">
                                            {cWins > 0 ? (
                                                <span className={isSelected ? 'text-yellow-300 font-bold' : 'text-green-600 font-bold'}>
                                                    {cWins} Win{cWins !== 1 ? 's' : ''}
                                                </span>
                                            ) : (
                                                <span className="opacity-70">{cNoms} Nom{cNoms !== 1 ? 's' : ''}</span>
                                            )}
                                        </td>
                                    </tr>
                                    
                                    {/* Expanded Details Row (Folder Open) */}
                                    {isSelected && (
                                        <tr>
                                            <td colSpan={4} className="bg-white pl-8 pr-2 py-2 border-b border-[#d8d0c8]">
                                                <div className="border border-[#d4d0c8] rounded p-2 bg-[#f8f8fa]">
                                                    <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2 border-b border-gray-200 pb-1">Award Winners & Nominations</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {Object.values(AwardCategory).map(cat => {
                                                            const catNoms = ceremony.nominations.filter(n => n.category === cat);
                                                            if (catNoms.length === 0) return null;
                                                            const winner = catNoms.find(n => n.isWinner);
                                                            const playerWinner = winner?.studioId === 'player';
                                                            const yourNoms = catNoms.filter(n => n.studioId === 'player');
                                                            
                                                            return (
                                                                <div key={cat} className="flex flex-col gap-0.5 bg-white border border-gray-200 p-1.5 rounded">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="font-bold text-[#003399]">{CATEGORY_LABELS[cat]}</span>
                                                                    </div>
                                                                    
                                                                    {winner && (
                                                                        <div className={`p-1 mt-1 rounded text-[10px] flex items-center gap-1 ${playerWinner ? 'bg-yellow-100 border border-yellow-300' : 'bg-gray-50'}`}>
                                                                            <span>🏆</span>
                                                                            <span className="font-bold">{winner.actorName || winner.movieTitle}</span>
                                                                            {!playerWinner && <span className="text-gray-400 italic text-[9px]">({winner.studioId === 'player' ? 'You' : 'Rival'})</span>}
                                                                        </div>
                                                                    )}

                                                                    {yourNoms.length > 0 && (
                                                                        <div className="mt-1 pl-1">
                                                                            <div className="text-[9px] text-gray-400">Your Nominations:</div>
                                                                            {yourNoms.map(n => (
                                                                                <div key={n.id} className="text-[10px] pl-1 text-gray-600">
                                                                                    {n.isWinner ? '• ' : '◦ '}{n.actorName || n.movieTitle}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                             );
                        })}
                    </tbody>
                 </table>
            </div>
            
            <div className="h-5 bg-[#ece9d8] border-t border-[#aca899] flex items-center select-none cursor-default font-tahoma text-[11px] shrink-0">
                 <div className="flex-1 flex items-center gap-2 px-2 border-r border-[#aca899] shadow-[1px_0_0_white]">
                      <span className="font-bold">{ceremonies.length} objects</span>
                 </div>
                 <div className="w-[150px] px-2 border-l border-white border-r border-[#aca899] shadow-[1px_0_0_white_inset] truncate">
                     <span className="truncate">My Computer</span>
                 </div>
            </div>
       </div>
    </div>
  );
};
