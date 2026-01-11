import React, { useState, useMemo } from 'react';
import { GameEvent, GameState, AwardsCeremony } from '../types';
import { WindowFrame } from './RetroUI';

interface Props {
  events: GameEvent[];
  state: GameState;
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
  zIndex: number;
  onFocus: () => void;
}

type NewsCategory = 'all' | 'boxoffice' | 'gossip' | 'awards' | 'production' | 'business';

const CATEGORY_CONFIG: Record<NewsCategory, { label: string; color: string; filter: (e: GameEvent) => boolean }> = {
  all: { label: 'Front Page', color: '#999999', filter: () => true },
  boxoffice: { label: 'Box Office', color: '#0066cc', filter: e => e.message.includes('BO:') || e.message.includes('RELEASE:') || e.message.includes('Revenue') },
  gossip: { label: 'Gossip', color: '#cc0066', filter: e => e.type === 'GOSSIP' || e.message.includes('GOSSIP:') },
  awards: { label: 'Awards', color: '#d4af37', filter: e => e.message.includes('AWARDS:') || e.message.includes('AWARD') },
  production: { label: 'Production', color: '#339933', filter: e => e.message.includes('PRODUCTION') || e.message.includes('GREENLIT') || e.message.includes('DELAY') },
  business: { label: 'Business', color: '#663399', filter: e => e.message.includes('CONTRACT') || e.message.includes('WIRE') || e.message.includes('AUCTION') },
};

const getEventIcon = (event: GameEvent): string => {
  if (event.message.includes('AWARDS:')) return '🏆';
  if (event.message.includes('RELEASE:')) return '🎬';
  if (event.message.includes('BO:')) return '📊';
  if (event.message.includes('GOSSIP:')) return '💬';
  if (event.message.includes('PRODUCTION')) return '🎥';
  if (event.message.includes('CONTRACT')) return '📝';
  if (event.message.includes('GREENLIT')) return '✅';
  if (event.type === 'GOOD') return '⭐';
  if (event.type === 'BAD') return '⚠️';
  return '📰';
};

const formatDate = (month: number, year: number): string => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[month - 1]} ${year}`;
};

export const MagazineWindow: React.FC<Props> = ({ events, state, onClose, onMinimize, isActive, zIndex, onFocus }) => {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = events.filter(e =>
      e.type === 'GOSSIP' || e.type === 'BAD' || e.type === 'GOOD' || e.type === 'AD' || e.type === 'INFO'
    );

    // Apply category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(CATEGORY_CONFIG[activeCategory].filter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => e.message.toLowerCase().includes(query));
    }

    return filtered.reverse();
  }, [events, activeCategory, searchQuery]);

  const mainStory = filteredEvents[0];
  const secondaryStories = filteredEvents.slice(1, 4);
  const otherHeadlines = filteredEvents.slice(4, 12);

  // Get upcoming/recent awards
  const upcomingAwards = state.awardsCeremonies?.find(c => !c.completed);
  const recentAwards = state.awardsCeremonies?.find(c => c.completed && c.year === state.year - 1);

  // Generate dynamic "In Depth" content based on game state
  const getInDepthContent = () => {
    if (upcomingAwards) {
      const playerNoms = upcomingAwards.nominations.filter(n => n.studioId === 'player').length;
      return {
        title: `${upcomingAwards.year} Awards Preview`,
        subtitle: playerNoms > 0 ? `${state.studioName}: ${playerNoms} nominations` : 'Who will take home gold?',
      };
    }
    if (state.projects.filter(p => p.status !== 'Released' && p.studioId === 'player').length > 0) {
      return {
        title: 'Production Pipeline',
        subtitle: `${state.studioName} has ${state.projects.filter(p => p.status !== 'Released' && p.studioId === 'player').length} films in production`,
      };
    }
    return {
      title: 'Industry Watch',
      subtitle: 'What\'s next for Hollywood?',
    };
  };

  const inDepth = getInDepthContent();

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
            <span className="text-gray-500">{formatDate(state.month, state.year)}</span>
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
            <span
              className="px-2 py-0.5 font-bold uppercase text-white"
              style={{ backgroundColor: CATEGORY_CONFIG[activeCategory].color }}
            >
              {CATEGORY_CONFIG[activeCategory].label}
            </span>
            <span className="text-gray-500 font-bold">{formatDate(state.month, state.year)}</span>
          </div>
          <div className="flex items-center gap-1 overflow-hidden">
            <span className="text-[#cc0000] font-black uppercase tracking-tight shrink-0">Latest:</span>
            <span className="text-black font-bold truncate">{mainStory?.message.toUpperCase() || 'NO NEWS AVAILABLE'}</span>
            <span className="w-1.5 h-3 bg-black/80 animate-pulse shrink-0"></span>
          </div>
        </div>

        {/* 3-Column Content */}
        <div className="flex-1 overflow-y-auto flex bg-white">
          {/* Sidebar Nav - Categories */}
          <div className="w-32 md:w-40 shrink-0 border-r border-gray-100 p-2 flex flex-col text-[12px] text-[#003366] font-bold space-y-0.5">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <div
                key={key}
                onClick={() => setActiveCategory(key as NewsCategory)}
                className={`text-right hover:underline cursor-pointer pr-2 py-1 ${
                  activeCategory === key
                    ? 'bg-gray-100 text-black border-l-4'
                    : ''
                }`}
                style={{ borderColor: activeCategory === key ? config.color : 'transparent' }}
              >
                {config.label}
              </div>
            ))}

            <div className="mt-4 border-t border-gray-100 pt-3 pr-2 text-right">
               <div className="text-[10px] font-black text-black">
                 <span className="bg-black text-white px-1 mr-1">V</span> SPORT &gt;&gt;
               </div>
            </div>

            {/* Event count */}
            <div className="mt-auto pt-4 border-t border-gray-100 text-[9px] text-gray-400 text-right pr-2">
              {filteredEvents.length} stories
            </div>
          </div>

          {/* Main Feed */}
          <div className="flex-1 p-4 bg-white border-r border-gray-100 overflow-y-auto">
             {filteredEvents.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-gray-400">
                 <span className="text-4xl mb-2">📰</span>
                 <p className="text-sm font-bold">No stories in this category</p>
                 <p className="text-xs mt-1">Check back later for updates</p>
               </div>
             ) : (
               <>
                 {mainStory && (
                   <div className="mb-8">
                      <h2 className="text-2xl font-bold leading-tight text-[#003366] mb-4 hover:underline cursor-pointer">
                        {getEventIcon(mainStory)} {mainStory.message.split(':').slice(1).join(':')?.trim() || mainStory.message}
                      </h2>
                      <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div
                          className="w-full md:w-56 h-32 border-2 border-gray-400 bg-gray-100 shadow-sm flex items-center justify-center"
                          style={{
                            background: mainStory.type === 'GOOD' ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)' :
                                       mainStory.type === 'BAD' ? 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)' :
                                       'linear-gradient(135deg, #e2e3e5 0%, #d6d8db 100%)'
                          }}
                        >
                          <span className="text-6xl opacity-50">{getEventIcon(mainStory)}</span>
                        </div>
                        <div className="flex-1 text-[13px] leading-[1.3] text-gray-800">
                           <p className="mb-2">{mainStory.message}</p>
                           <p className="text-[11px] text-gray-500 italic">
                             Reported in {formatDate(mainStory.month || state.month, state.year)}
                           </p>
                        </div>
                      </div>
                      {secondaryStories.length > 0 && (
                        <div className="pl-4 border-l-2 border-gray-100 space-y-2">
                           <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Also:</div>
                           {secondaryStories.map(s => (
                             <div key={s.id} className="text-[12px] font-bold text-[#003366] hover:underline cursor-pointer flex items-start gap-2">
                                <span className="text-[#cc0000] mt-1 text-[8px]">▶</span>
                                <span>{getEventIcon(s)}</span>
                                {s.message}
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                 )}

                 {otherHeadlines.length > 0 && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                      {otherHeadlines.map(h => (
                         <div key={h.id} className="space-y-2 p-2 hover:bg-gray-50 rounded">
                            <div className="flex gap-3">
                               <div
                                 className="w-16 h-16 border border-gray-300 shrink-0 shadow-sm flex items-center justify-center"
                                 style={{
                                   background: h.type === 'GOOD' ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)' :
                                              h.type === 'BAD' ? 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)' :
                                              'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)'
                                 }}
                               >
                                 <span className="text-2xl opacity-70">{getEventIcon(h)}</span>
                               </div>
                               <div className="flex-1">
                                 <h3 className="text-[12px] font-bold leading-tight text-[#003366] hover:underline cursor-pointer mb-1">
                                   {h.message.replace(/^(GOSSIP|BO|PRODUCTION|CONTRACT|AWARDS|RELEASE|GREENLIT|DELAY|WIRE|AUCTION): ?/i, '')}
                                 </h3>
                                 <p className="text-[9px] text-gray-400">
                                   {h.type === 'GOOD' && '✓ Positive news'}
                                   {h.type === 'BAD' && '⚠ Alert'}
                                   {h.type === 'GOSSIP' && '💬 Industry buzz'}
                                   {h.type === 'INFO' && '📋 Update'}
                                 </p>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                 )}
               </>
             )}
          </div>

          {/* Side Features */}
          <div className="w-56 md:w-64 shrink-0 bg-[#f6f6f6] p-2 space-y-4 overflow-y-auto">
             <div className="bg-white border border-gray-300 p-2 space-y-1 shadow-sm">
                <div className="text-[11px] font-bold">Search Variety News</div>
                <div className="flex gap-1">
                   <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search stories..."
                     className="flex-1 border border-gray-400 h-5 px-1 text-xs focus:ring-1 focus:ring-blue-300"
                   />
                   <button
                     onClick={() => setSearchQuery('')}
                     className="bg-[#cc0000] text-white px-2 h-5 font-bold text-[10px] uppercase border border-black shadow-sm"
                   >
                     {searchQuery ? 'X' : 'GO'}
                   </button>
                </div>
             </div>

             {/* Awards Section */}
             {(upcomingAwards || recentAwards) && (
               <div className="space-y-0.5 shadow-sm">
                  <div className="bg-[#d4af37] px-2 py-0.5 text-[10px] font-black flex items-center gap-1 border-b border-gray-300 text-white">
                     <span className="text-xs">🏆</span> AWARDS CENTRAL
                  </div>
                  <div className="bg-white border border-gray-200 p-2">
                     {upcomingAwards && !upcomingAwards.completed && (
                       <div className="mb-2 pb-2 border-b border-gray-100">
                         <div className="text-[11px] font-bold text-[#003366] leading-tight">
                           Nominations Announced
                         </div>
                         <div className="text-[9px] text-gray-500">
                           {upcomingAwards.nominations.filter(n => n.studioId === 'player').length} nominations for {state.studioName}
                         </div>
                         <div className="text-[9px] text-[#d4af37] font-bold mt-1">
                           Ceremony in February
                         </div>
                       </div>
                     )}
                     {recentAwards && (
                       <div>
                         <div className="text-[11px] font-bold text-[#003366] leading-tight">
                           {recentAwards.year} Results
                         </div>
                         <div className="text-[9px] text-gray-500">
                           {recentAwards.nominations.filter(n => n.studioId === 'player' && n.isWinner).length} wins for {state.studioName}
                         </div>
                       </div>
                     )}
                  </div>
               </div>
             )}

             {/* Studio Standing */}
             <div className="space-y-0.5 shadow-sm">
                <div className="bg-[#0066cc] px-2 py-0.5 text-[10px] font-black flex items-center gap-1 border-b border-gray-300 text-white">
                   <span className="text-xs">📊</span> STUDIO STANDING
                </div>
                <div className="bg-white border border-gray-200 p-2">
                   <div className="text-[11px] font-bold text-[#003366] leading-tight mb-1">
                     {state.studioName}
                   </div>
                   <div className="grid grid-cols-2 gap-1 text-[9px]">
                     <div>
                       <span className="text-gray-500">Reputation:</span>
                       <span className="font-bold ml-1">{state.reputation}%</span>
                     </div>
                     <div>
                       <span className="text-gray-500">Balance:</span>
                       <span className="font-bold ml-1 text-green-700">${(state.balance / 1000000).toFixed(1)}M</span>
                     </div>
                     <div>
                       <span className="text-gray-500">In Prod:</span>
                       <span className="font-bold ml-1">{state.projects.filter(p => p.status !== 'Released' && p.studioId === 'player').length}</span>
                     </div>
                     <div>
                       <span className="text-gray-500">Released:</span>
                       <span className="font-bold ml-1">{state.projects.filter(p => p.status === 'Released' && p.studioId === 'player').length}</span>
                     </div>
                   </div>
                </div>
             </div>

             {/* In Depth */}
             <div className="space-y-0.5 shadow-sm">
                <div className="bg-[#cccc99] px-2 py-0.5 text-[10px] font-black flex items-center gap-1 border-b border-gray-300">
                   <span className="text-xs">📁</span> IN DEPTH
                </div>
                <div className="bg-white border border-gray-200 p-2 flex gap-2">
                   <div className="flex-1 space-y-1">
                      <div className="text-[11px] font-bold text-[#003366] hover:underline cursor-pointer leading-tight">
                        {inDepth.title}
                      </div>
                      <div className="text-[10px] text-gray-500 leading-tight">{inDepth.subtitle}</div>
                   </div>
                </div>
             </div>

             {/* Quick Stats */}
             <div className="space-y-0.5 shadow-sm">
                <div className="bg-[#339933] px-2 py-0.5 text-[10px] font-black flex items-center gap-1 border-b border-gray-300 text-white">
                   <span className="text-xs">📈</span> MARKET PULSE
                </div>
                <div className="bg-white border border-gray-200 p-2 text-[9px] space-y-1">
                   <div className="flex justify-between">
                     <span className="text-gray-500">Scripts on Market:</span>
                     <span className="font-bold">{state.marketScripts.length}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-500">Available Talent:</span>
                     <span className="font-bold">{state.actors.filter(a => a.status === 'Available').length}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-500">Rival Studios:</span>
                     <span className="font-bold">{state.rivals.length}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </WindowFrame>
  );
};
