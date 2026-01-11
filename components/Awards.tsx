import React, { useState } from 'react';
import { GameState, AwardsCeremony, AwardCategory, AwardNomination } from '../types';
import { getPlayerAwardCount } from '../services/awardsService';

interface Props {
  state: GameState;
}

const CATEGORY_ICONS: Record<AwardCategory, string> = {
  [AwardCategory.BestPicture]: '🏆',
  [AwardCategory.BestActor]: '🎭',
  [AwardCategory.BestActress]: '🎭',
  [AwardCategory.BestDirector]: '🎬',
  [AwardCategory.BestScreenplay]: '📝',
  [AwardCategory.BestCinematography]: '📷',
  [AwardCategory.BestScore]: '🎵',
};

const NominationCard: React.FC<{ nomination: AwardNomination; studioName: string }> = ({ nomination, studioName }) => {
  const isPlayer = nomination.studioId === 'player';
  const displayStudio = isPlayer ? studioName : 'Rival Studio';

  return (
    <div
      className={`p-1.5 rounded border ${
        nomination.isWinner
          ? 'bg-yellow-100 border-yellow-400'
          : isPlayer
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {nomination.actorName && (
            <div className="text-[10px] font-bold text-gray-800 truncate">
              {nomination.actorName}
            </div>
          )}
          <div className="text-[9px] text-gray-600 truncate" title={nomination.movieTitle}>
            "{nomination.movieTitle}"
          </div>
          <div className="text-[8px] text-gray-400 truncate">{displayStudio}</div>
        </div>
        <div className="shrink-0 ml-1">
          {nomination.isWinner && (
            <span className="text-yellow-500 text-[14px]">🏆</span>
          )}
          {isPlayer && !nomination.isWinner && (
            <span className="text-[8px] bg-blue-500 text-white px-1 rounded">YOU</span>
          )}
        </div>
      </div>
    </div>
  );
};

const CeremonyView: React.FC<{ ceremony: AwardsCeremony; studioName: string }> = ({ ceremony, studioName }) => {
  const [expandedCategory, setExpandedCategory] = useState<AwardCategory | null>(null);

  const categories = Object.values(AwardCategory);
  const playerWins = ceremony.nominations.filter(n => n.studioId === 'player' && n.isWinner).length;
  const playerNoms = ceremony.nominations.filter(n => n.studioId === 'player').length;

  return (
    <div className="bg-[#ece9d8] bevel-outset p-1 mb-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-white px-2 py-1.5 mb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[16px]">🏆</span>
            <span className="text-[11px] font-bold">{ceremony.name}</span>
          </div>
          <div className="text-[9px]">
            {ceremony.completed ? (
              <span className="bg-white/20 px-2 py-0.5 rounded">Ceremony Complete</span>
            ) : (
              <span className="bg-white/30 px-2 py-0.5 rounded animate-pulse">Nominations Announced</span>
            )}
          </div>
        </div>
        {ceremony.completed && (
          <div className="text-[9px] mt-1 opacity-80">
            {studioName}: {playerWins} win{playerWins !== 1 ? 's' : ''} from {playerNoms} nomination{playerNoms !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="bg-white bevel-inset p-2 space-y-2">
        {categories.map(category => {
          const nominees = ceremony.nominations.filter(n => n.category === category);
          const winner = nominees.find(n => n.isWinner);
          const isExpanded = expandedCategory === category;
          const playerNominated = nominees.some(n => n.studioId === 'player');
          const playerWon = winner?.studioId === 'player';

          if (nominees.length === 0) return null;

          return (
            <div key={category} className="border border-gray-200 rounded overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className={`w-full px-2 py-1.5 flex items-center justify-between text-left hover:bg-gray-50 ${
                  playerWon ? 'bg-yellow-50' : playerNominated ? 'bg-blue-50' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[12px]">{CATEGORY_ICONS[category]}</span>
                  <span className="text-[10px] font-bold text-gray-700">{category}</span>
                </div>
                <div className="flex items-center gap-2">
                  {ceremony.completed && winner && (
                    <span className="text-[9px] text-gray-600 truncate max-w-[120px]">
                      {winner.actorName || winner.movieTitle}
                    </span>
                  )}
                  {playerWon && <span className="text-[10px]">🏆</span>}
                  <span className="text-[10px] text-gray-400">{isExpanded ? '▼' : '▶'}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 p-2 bg-gray-50 space-y-1.5">
                  {nominees.map(nom => (
                    <NominationCard key={nom.id} nomination={nom} studioName={studioName} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Awards: React.FC<Props> = ({ state }) => {
  const { wins, nominations } = getPlayerAwardCount(state.awardsCeremonies || []);
  const ceremonies = [...(state.awardsCeremonies || [])].reverse();

  return (
    <div className="h-full flex flex-col bg-[#ece9d8] overflow-hidden p-2">
      <div className="flex flex-col h-full bg-[#ece9d8] bevel-outset overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-white px-2 py-1 text-[10px] font-bold uppercase shrink-0 flex items-center justify-between">
          <span>🏆 Academy Awards Archive</span>
          <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded">
            {wins} Wins / {nominations} Nominations
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2 bg-white">
          {ceremonies.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-[40px] mb-2 opacity-30">🏆</span>
              <p className="text-[10px] font-bold uppercase tracking-widest">
                No Awards Ceremonies Yet
              </p>
              <p className="text-[9px] mt-1 text-center max-w-[200px]">
                Nominations are announced in January for films released the previous year.
                The ceremony takes place in February.
              </p>
            </div>
          ) : (
            ceremonies.map(ceremony => (
              <CeremonyView
                key={ceremony.id}
                ceremony={ceremony}
                studioName={state.studioName}
              />
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="shrink-0 bg-gray-100 border-t border-gray-300 px-2 py-1 text-[8px] text-gray-500">
          <span className="font-bold">Schedule:</span> Nominations in January, Ceremony in February
        </div>
      </div>
    </div>
  );
};
