import React, { useState, useMemo } from 'react';
import { GameEvent, GameState } from '../types';
import { WindowFrame } from './RetroUI';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalClockContext } from '../contexts/GlobalClockContext';
import { useEvents } from '../hooks/useEvents';

interface Props {
  state: GameState;
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
  zIndex: number;
  onFocus: () => void;
}

type NewsCategory = 'all' | 'boxoffice' | 'gossip' | 'awards' | 'production' | 'business';

const CATEGORY_CONFIG: Record<NewsCategory, { label: string; color: string; filter: (e: GameEvent) => boolean }> = {
  all: { label: 'Top Stories', color: '#003366', filter: () => true },
  boxoffice: { label: 'Box Office', color: '#0066cc', filter: e => e.message.includes('BO:') || e.message.includes('RELEASE:') || e.message.includes('Revenue') },
  gossip: { label: 'The Slap', color: '#cc0066', filter: e => e.type === 'GOSSIP' || e.message.includes('GOSSIP:') },
  awards: { label: 'Awards Season', color: '#b8860b', filter: e => e.message.includes('AWARDS:') || e.message.includes('AWARD') },
  production: { label: 'Production', color: '#228b22', filter: e => e.message.includes('PRODUCTION') || e.message.includes('GREENLIT') || e.message.includes('DELAY') },
  business: { label: 'Industry Biz', color: '#4b0082', filter: e => e.message.includes('CONTRACT') || e.message.includes('WIRE') || e.message.includes('AUCTION') },
};

const formatDate = (month: number): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1].toUpperCase()}`;
};

export const MagazineWindow: React.FC<Props> = ({ state, onClose, onMinimize, isActive, zIndex, onFocus }) => {
  const { user } = useAuth();
  const { clock } = useGlobalClockContext();
  const { events } = useEvents();
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handler to open variety window (focus) when clicking read full story
  const onReadFullStory = (event: GameEvent) => {
    onFocus(); // Focus the variety window
  };

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = events.filter(e =>
      e.type === 'GOSSIP' || e.type === 'BAD' || e.type === 'GOOD' || e.type === 'AD' || e.type === 'INFO'
    );

    if (activeCategory !== 'all') {
      filtered = filtered.filter(CATEGORY_CONFIG[activeCategory].filter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => e.message.toLowerCase().includes(query));
    }

    // Sort chronologically: most recent first (based on hook order which is created_at)
    // We trust useEvents to return latest events first
    return filtered;
  }, [events, activeCategory, searchQuery]);

  const mainStory = filteredEvents[0];
  const otherHeadlines = filteredEvents.slice(1);

  return (
    <WindowFrame
      title="Variety.com - The Business of Entertainment"
      onClose={onClose}
      onMinimize={onMinimize}
      isActive={isActive}
      zIndex={zIndex}
      onFocus={onFocus}
      className="w-full max-w-5xl h-[85vh]"
      initialPos={{ x: 60, y: 40 }}
    >
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 20s linear infinite;
          padding-left: 100%;
        }
      `}</style>
      <div className="bg-white h-full flex flex-col font-sans text-sm overflow-hidden select-text border border-gray-400">
        
        {/* HEADER: Y2K WEB STYLE */}
        <div className="bg-[#f0f0f0] border-b border-gray-400 p-2">
           <div className="flex justify-between items-end mb-2">
             <div className="flex flex-col">
               <h1 className="text-4xl font-serif italic font-black tracking-tighter text-[#cc0000] leading-none" style={{ fontFamily: 'Times New Roman, serif' }}>
                 VARIETY<span className="text-gray-500 text-lg font-normal not-italic tracking-normal">.com</span>
               </h1>
               <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-1">The Global Leader in Entertainment News</span>
             </div>
             <div className="text-right">
                <div className="text-[10px] font-bold text-gray-600 mb-1">
                  EDITION: U.S. | GAME TIME: {formatDate(clock?.month || state.month)}
                </div>
                <div className="bg-white border border-gray-400 p-0.5 flex justify-between items-center w-40">
                  <input 
                    type="text" 
                    placeholder="Search Site" 
                    className="w-full text-[10px] outline-none px-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="bg-[#cc0000] text-white text-[9px] font-bold px-1 ml-1 h-full shrink-0">GO</button>
                </div>
             </div>
           </div>
           
           {/* NAV BAR */}
           <div className="flex gap-4 text-[10px] font-bold uppercase border-t border-gray-300 pt-1">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key as NewsCategory)}
                  className={`hover:text-[#cc0000] hover:underline ${activeCategory === key ? 'text-[#cc0000] underline' : 'text-[#003366]'}`}
                >
                  {config.label}
                </button>
              ))}
              <span className="text-gray-400">|</span>
              <a href="#" className="text-[#003366] hover:underline">Subscribe</a>
              <a href="#" className="text-[#003366] hover:underline">Archives</a>
              <a href="#" className="text-[#003366] hover:underline">Box Office Charts</a>
           </div>
        </div>

        {/* MARQUEE */}
        <div className="bg-[#003366] text-white py-1 border-b border-black overflow-hidden relative whitespace-nowrap">
           <div className="animate-marquee inline-block text-[10px] font-bold">
             <span className="text-yellow-400 mx-2">+++ BREAKING NEWS +++</span>
             {mainStory ? mainStory.message.toUpperCase() : "NO BREAKING NEWS"}
             <span className="mx-4 text-gray-400">|</span>
             {otherHeadlines[0] ? otherHeadlines[0].message.toUpperCase() : "..."}
             <span className="mx-4 text-gray-400">|</span>
             {(state.awardsCeremonies[0] && !state.awardsCeremonies[0].completed) ? `AWARDS SEASON: ${state.awardsCeremonies[0].name.toUpperCase()} COMING SOON` : "INDUSTRY UPDATE"}
           </div>
        </div>

        {/* MAIN BODY - 2 COL LAYOUT */}
        <div className="flex-1 overflow-hidden flex bg-white">
          
          {/* MAIN CONTENT COLUMN */}
          <div className="flex-1 overflow-y-auto p-4 border-r border-gray-200 scrollbar-thin">
            {filteredEvents.length === 0 ? (
               <div className="text-center p-8 text-gray-400 font-bold italic">
                 No stories found in this section.
               </div>
            ) : (
              <>
                 {/* LEAD STORY */}
                 {mainStory && (
                   <div className="mb-6 border-b border-dotted border-gray-400 pb-4">
                      <h2 className="text-2xl font-bold text-[#003366] mb-2 leading-tight hover:underline cursor-pointer font-serif">
                        {mainStory.message.split(':')[1] || mainStory.message}
                      </h2>
                      <div className="flex gap-3">
                         <div className="flex-1">
                            <div className="text-[10px] font-bold text-[#cc0000] mb-1 uppercase">
                              INDUSTRY REPORT
                            </div>
                            <p className="text-[12px] leading-snug text-gray-800">
                              <span className="font-bold uppercase text-gray-500 text-[9px] mr-1">HOLLYWOOD, CA &mdash;</span>
                              {mainStory.message} The industry is reacting to the news with mixed emotions as analysts predict long-term impacts on the studio system.
                            </p>
                            <div 
                              onClick={() => onReadFullStory?.(mainStory)}
                              className="mt-2 text-[10px] text-[#003366] font-bold hover:underline cursor-pointer"
                            >
                              Read Full Story &gt;&gt;
                            </div>
                         </div>
                      </div>
                   </div>
                 )}

                 {/* HEADLINES LIST */}
                 <div className="grid grid-cols-1 gap-3">
                   {otherHeadlines.map(event => (
                     <div key={event.id} className="flex gap-2 items-start py-2 border-b border-gray-100 last:border-0 hover:bg-[#f9f9f9]">
                        <div className="mt-1 w-1.5 h-1.5 bg-[#cc0000] shrink-0"></div>
                        <div>
                           <h3 className="text-[12px] font-bold text-[#003366] leading-tight hover:underline cursor-pointer">
                             {event.message}
                           </h3>
                           <div className="flex items-center gap-2 mt-0.5">
                             <div className="text-[9px] text-gray-400">
                               {formatDate(event.month)}
                             </div>
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
              </>
            )}
          </div>

          {/* RIGHT SIDEBAR - ADVERTISEMENTS & CHARTS */}
          <div className="w-48 bg-[#f4f4f4] border-l border-gray-300 p-2 overflow-y-auto shrink-0 hidden md:block">
             {/* LOGIN BOX STYLE */}
             <div className="bg-white border text-[10px] p-2 mb-4 border-gray-400">
               <div className="font-bold text-[#cc0000] mb-1">SUBSCRIBER LOGIN</div>
               <div className="mb-1">Welcome, <span className="font-bold">{state.studioName}</span></div>
               <div className="text-gray-500">Tier: {state.reputation > 80 ? 'Legendary' : state.reputation > 60 ? 'Major' : 'Indie'} Access</div>
               <div className="mt-1 text-[#003366] underline cursor-pointer">Manage Account</div>
             </div>

             {/* ADVERTISEMENT */}
             <div className="border border-gray-400 bg-white p-1 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-blue-200">Ad</div>
                  <div className="font-bold text-sm my-1">FILM FESTIVAL 2003</div>
                  <div className="text-[9px]">Submit your entries now!</div>
                  <button className="bg-yellow-400 text-black text-[9px] font-bold px-2 py-0.5 mt-2 rounded-sm border-b-2 border-yellow-600">CLICK HERE</button>
                </div>
             </div>

             {/* MINI CHART */}
             <div className="bg-white border border-gray-400 p-2">
               <div className="font-bold text-[10px] text-[#003366] border-b border-gray-200 mb-1 pb-1">
                 TOTAL GROSS
               </div>
               {state.projects
                  .filter(p => p.status === 'Released')
                  .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 3)
                  .map((p, i) => (
                  <div key={p.id} className="mb-1.5 last:mb-0">
                    <div className="flex justify-between text-[9px]">
                      <span className="font-bold text-gray-700 truncate w-24">{i+1}. {p.title}</span>
                    </div>
                    <div className="text-[8px] text-green-700 font-mono">
                      ${(p.revenue / 1000000).toFixed(1)}M
                    </div>
                  </div>
               ))}
               <div className="text-[9px] text-[#cc0000] font-bold text-right mt-1 cursor-pointer hover:underline">
                 View Full Chart
               </div>
             </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-[#e0e0e0] border-t border-gray-400 p-2 text-center text-[9px] text-gray-500">
           Copyright &copy; 2003 Variety Media, LLC. All Rights Reserved. <br/>
           <a href="#" className="underline">Terms of Use</a> | <a href="#" className="underline">Privacy Policy</a> | <a href="#" className="underline">Contact Us</a>
        </div>
      </div>
    </WindowFrame>
  );
};
