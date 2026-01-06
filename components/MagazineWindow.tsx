import React from 'react';
import { GameEvent } from '../types';
import { WindowFrame } from './RetroUI';

interface Props {
  events: GameEvent[];
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
  zIndex: number;
  onFocus: () => void;
}

export const MagazineWindow: React.FC<Props> = ({ events, onClose, onMinimize, isActive, zIndex, onFocus }) => {
  const newsEvents = events.filter(e => e.type === 'GOSSIP' || e.type === 'BAD' || e.type === 'GOOD' || e.type === 'AD').reverse();
  const mainStory = newsEvents[0];
  const secondaryStories = newsEvents.slice(1, 4);
  const otherHeadlines = newsEvents.slice(4, 10);

  return (
    <WindowFrame 
      title="Variety News Online - Hollywood's Entertainment Leader" 
      onClose={onClose} 
      onMinimize={onMinimize}
      isActive={isActive}
      zIndex={zIndex}
      onFocus={onFocus}
      className="w-full max-w-5xl h-[90vh]"
      initialPos={{ x: 80, y: 50 }}
    >
      <div className="bg-white h-full flex flex-col overflow-hidden font-sans select-text" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
        
        {/* Top Service Bar */}
        <div className="bg-white px-2 py-1 border-b border-gray-100 flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase">
          <div className="flex gap-4">
            <span className="text-black hover:underline cursor-pointer">Variety Homepage</span>
            <span className="hover:underline cursor-pointer opacity-80">World Service</span>
            <span className="hover:underline cursor-pointer opacity-80">Education</span>
          </div>
          <div className="flex gap-3 normal-case font-normal text-blue-800">
            <span className="hover:underline cursor-pointer">low graphics version</span>
            <span className="text-gray-300">|</span>
            <span className="hover:underline cursor-pointer">feedback</span>
            <span className="text-gray-300">|</span>
            <span className="hover:underline cursor-pointer">help</span>
          </div>
        </div>

        {/* Variety Brand Header */}
        <div className="bg-[#cc0000] flex items-stretch shrink-0 overflow-hidden border-b-2 border-[#990000]">
          <div className="bg-white px-4 py-2 flex items-center">
             <div className="flex gap-1.5">
               {['V','A','R','I','E','T','Y'].map((l, i) => (
                 <span key={i} className="bg-[#cc0000] text-white font-black text-2xl w-8 h-8 flex items-center justify-center leading-none">
                   {l}
                 </span>
               ))}
             </div>
          </div>
          <div className="flex-1 flex items-center px-4 bg-[#cc0000]">
            <h1 className="text-white text-3xl font-black italic tracking-tighter">NEWS</h1>
          </div>
          <div className="w-48 bg-[#cc0000] relative overflow-hidden hidden md:block">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20"></div>
             <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-[12px] border-white/10"></div>
          </div>
        </div>

        {/* Breaking Bar */}
        <div className="bg-white border-b border-gray-300 px-3 py-1.5 flex flex-col md:flex-row md:items-center justify-between gap-1 text-[11px]">
          <div className="flex items-center gap-3">
            <span className="bg-[#999999] text-white px-2 py-0.5 font-bold uppercase">Front Page</span>
            <span className="text-gray-500 font-bold">Tuesday, 14 October, 2003, 11:24 GMT</span>
          </div>
          <div className="flex items-center gap-1 overflow-hidden">
            <span className="text-[#cc0000] font-black uppercase tracking-tight shrink-0">Latest:</span>
            <span className="text-black font-bold truncate">P_ {mainStory?.message.toUpperCase()}</span>
            <span className="w-1.5 h-3 bg-black/80 animate-pulse shrink-0"></span>
          </div>
        </div>

        {/* 3-Column Content */}
        <div className="flex-1 overflow-y-auto flex bg-white">
          {/* Sidebar Nav */}
          <div className="w-32 md:w-40 shrink-0 border-r border-gray-100 p-2 flex flex-col text-[12px] text-[#003366] font-bold space-y-0.5">
            <div className="text-right hover:underline cursor-pointer bg-gray-100 pr-2 py-1 text-black border-l-4 border-gray-400">Front Page</div>
            <div className="text-right hover:underline cursor-pointer pr-2 py-1">World</div>
            <div className="text-right hover:underline cursor-pointer pr-2 py-1">UK</div>
            <div className="text-right hover:underline cursor-pointer pr-2 py-1">Business</div>
            <div className="text-right hover:underline cursor-pointer pr-2 py-1">Sci/Tech</div>
            <div className="text-right hover:underline cursor-pointer pr-2 py-1">Health</div>
            <div className="text-right hover:underline cursor-pointer pr-2 py-1">Entertainment</div>
            <div className="text-right hover:underline cursor-pointer pr-2 py-1">Talking Point</div>
            <div className="text-right hover:underline cursor-pointer pr-2 py-1">In Depth</div>
            <div className="text-right hover:underline cursor-pointer pr-2 py-1">AudioVideo</div>
            
            <div className="mt-4 border-t border-gray-100 pt-3 pr-2 text-right">
               <div className="text-[10px] font-black text-black">
                 <span className="bg-black text-white px-1 mr-1">V</span> SPORT &gt;&gt;
               </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="flex-1 p-4 bg-white border-r border-gray-100">
             {mainStory && (
               <div className="mb-8">
                  <h2 className="text-2xl font-bold leading-tight text-[#003366] mb-4 hover:underline cursor-pointer">
                    {mainStory.message.split(':')[1]?.trim() || mainStory.message}
                  </h2>
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <img 
                      src={`https://picsum.photos/300/200?random=${mainStory.id}`} 
                      className="w-full md:w-56 border-2 border-gray-400 bg-gray-100 shadow-sm" 
                      alt="Story" 
                    />
                    <div className="flex-1 text-[13px] leading-[1.3] text-gray-800">
                       Top insiders report that production targets are shifting as the season peaks. Studio executives are reportedly holding emergency meetings to discuss recent market volatility. Variety's investigation looks at what this means for the upcoming slate.
                    </div>
                  </div>
                  <div className="pl-4 border-l-2 border-gray-100 space-y-2">
                     <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Also:</div>
                     {secondaryStories.map(s => (
                       <div key={s.id} className="text-[12px] font-bold text-[#003366] hover:underline cursor-pointer flex items-start gap-2">
                          <span className="text-[#cc0000] mt-1 text-[8px]">▶</span>
                          {s.message}
                       </div>
                     ))}
                  </div>
               </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                {otherHeadlines.slice(0, 2).map(h => (
                   <div key={h.id} className="space-y-2">
                      <div className="flex gap-3">
                         <img src={`https://picsum.photos/100/100?random=${h.id}`} className="w-20 h-20 border border-gray-300 shrink-0 shadow-sm" alt="" />
                         <h3 className="text-sm font-bold leading-tight text-[#003366] hover:underline cursor-pointer">
                           {h.message.replace('GOSSIP: ', '')}
                         </h3>
                      </div>
                      <p className="text-[11px] leading-tight text-gray-600">
                        Major studios are preparing for a showdown at the next quarter's results briefing. Analysts expect fireworks...
                      </p>
                   </div>
                ))}
             </div>
          </div>

          {/* Side Features */}
          <div className="w-56 md:w-64 shrink-0 bg-[#f6f6f6] p-2 space-y-4">
             <div className="bg-white border border-gray-300 p-2 space-y-1 shadow-sm">
                <div className="text-[11px] font-bold">Search Variety Online</div>
                <div className="flex gap-1">
                   <input type="text" className="flex-1 border border-gray-400 h-5 px-1 text-xs focus:ring-1 focus:ring-blue-300" />
                   <button className="bg-[#cc0000] text-white px-2 h-5 font-bold text-[10px] uppercase border border-black shadow-sm">GO</button>
                </div>
                <div className="text-[9px] text-[#003366] font-bold hover:underline cursor-pointer">Advanced search</div>
             </div>

             <div className="bg-[#cc0000] p-2 text-white flex justify-between items-center cursor-pointer hover:brightness-110 shadow-sm transition-all">
                <div className="leading-tight">
                  <div className="text-[11px] font-black italic uppercase">Launch console</div>
                  <div className="text-[9px] font-bold opacity-80">for latest audio/video</div>
                </div>
                <div className="bg-white text-[#cc0000] p-1 font-black text-xs">↑</div>
             </div>

             <div className="space-y-3">
                <div className="space-y-0.5 shadow-sm">
                   <div className="bg-[#99cc99] px-2 py-0.5 text-[10px] font-black flex items-center gap-1 border-b border-gray-300">
                      <span className="text-xs">▶</span> AUDIO/VIDEO
                   </div>
                   <div className="bg-white border border-gray-200 p-2 flex gap-2">
                      <div className="flex-1 space-y-1">
                         <div className="text-[11px] font-bold text-[#003366] hover:underline cursor-pointer leading-tight">Stars on set</div>
                         <div className="text-[10px] text-gray-500 leading-tight">Exclusive behind-the-scenes footage</div>
                      </div>
                      <img src="https://picsum.photos/50/40?random=11" className="w-12 h-10 border border-gray-200" alt="" />
                   </div>
                </div>

                <div className="space-y-0.5 shadow-sm">
                   <div className="bg-[#cccc99] px-2 py-0.5 text-[10px] font-black flex items-center gap-1 border-b border-gray-300">
                      <span className="text-xs">📁</span> IN DEPTH
                   </div>
                   <div className="bg-white border border-gray-200 p-2 flex gap-2">
                      <div className="flex-1 space-y-1">
                         <div className="text-[11px] font-bold text-[#003366] hover:underline cursor-pointer leading-tight">Production Crisis</div>
                         <div className="text-[10px] text-gray-500 leading-tight">Why indie films are struggling abroad</div>
                      </div>
                      <img src="https://picsum.photos/50/40?random=12" className="w-12 h-10 border border-gray-200" alt="" />
                   </div>
                </div>

                <div className="space-y-0.5 shadow-sm">
                   <div className="bg-[#cccccc] px-2 py-0.5 text-[10px] font-black flex items-center gap-1 border-b border-gray-300">
                      <span className="text-xs">💬</span> TALKING POINT
                   </div>
                   <div className="bg-white border border-gray-200 p-2 flex gap-2">
                      <div className="flex-1 space-y-1">
                         <div className="text-[11px] font-bold text-[#003399] hover:underline cursor-pointer leading-tight">Box Office Flops</div>
                         <div className="text-[10px] text-gray-500 leading-tight">Does star power still matter in 2003?</div>
                      </div>
                      <img src="https://picsum.photos/50/40?random=13" className="w-12 h-10 border border-gray-200" alt="" />
                   </div>
                </div>
             </div>

             <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="bg-black text-white text-center p-1 text-[10px] font-bold italic shadow-md">Life from outer space?</div>
                <div className="bg-[#ffffcc] border border-gray-300 p-2 flex items-center gap-2 shadow-sm">
                   <div className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center text-xl">👁️</div>
                   <div className="text-[10px] font-bold text-[#003366] hover:underline cursor-pointer">Sound and vision: The new digital frontier</div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </WindowFrame>
  );
};
