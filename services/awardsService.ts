import { GameState, Movie, Actor, AwardCategory, AwardNomination, AwardsCeremony, ProjectStatus, GameEvent } from '../types';

const uuid = () => 'award-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);

// Minimum quality threshold for award consideration
const MIN_QUALITY_FOR_NOMINATION = 50;

// Number of nominees per category
const NOMINEES_PER_CATEGORY = 5;

// Get eligible movies for the award year
export const getEligibleMovies = (state: GameState, year: number): Movie[] => {
  return state.projects.filter(p =>
    p.status === ProjectStatus.Released &&
    p.releaseYear === year &&
    p.quality >= MIN_QUALITY_FOR_NOMINATION
  );
};

// Generate nominations for a category
const generateCategoryNominations = (
  category: AwardCategory,
  movies: Movie[],
  actors: Actor[],
  state: GameState
): AwardNomination[] => {
  const nominations: AwardNomination[] = [];

  // Sort movies by quality + some randomness for variety
  const scoredMovies = movies.map(m => ({
    movie: m,
    score: m.quality + (Math.random() * 20 - 10)
  })).sort((a, b) => b.score - a.score);

  switch (category) {
    case AwardCategory.BestPicture:
    case AwardCategory.BestDirector:
    case AwardCategory.BestScreenplay:
    case AwardCategory.BestCinematography:
    case AwardCategory.BestScore:
      // Movie-level nominations
      scoredMovies.slice(0, NOMINEES_PER_CATEGORY).forEach(({ movie }) => {
        nominations.push({
          id: uuid(),
          category,
          movieId: movie.id,
          movieTitle: movie.title,
          studioId: movie.studioId,
          isWinner: false,
        });
      });
      break;

    case AwardCategory.BestActor:
    case AwardCategory.BestActress:
      // Actor-level nominations
      const gender = category === AwardCategory.BestActor ? 'Male' : 'Female';
      const actorPerformances: { actor: Actor; movie: Movie; score: number }[] = [];

      movies.forEach(movie => {
        movie.cast.forEach(actorId => {
          const actor = actors.find(a => a.id === actorId && a.gender === gender);
          if (actor) {
            actorPerformances.push({
              actor,
              movie,
              score: movie.quality * 0.6 + actor.skill * 0.4 + (Math.random() * 15)
            });
          }
        });
      });

      // Sort by performance score and take top 5, but only one per actor
      const seenActors = new Set<string>();
      actorPerformances
        .sort((a, b) => b.score - a.score)
        .forEach(({ actor, movie }) => {
          if (nominations.length < NOMINEES_PER_CATEGORY && !seenActors.has(actor.id)) {
            seenActors.add(actor.id);
            nominations.push({
              id: uuid(),
              category,
              movieId: movie.id,
              movieTitle: movie.title,
              studioId: movie.studioId,
              actorId: actor.id,
              actorName: actor.name,
              isWinner: false,
            });
          }
        });
      break;
  }

  return nominations;
};

// Generate full awards ceremony with nominations
export const generateAwardsCeremony = (state: GameState, year: number): AwardsCeremony | null => {
  const eligibleMovies = getEligibleMovies(state, year);

  // Need at least 3 eligible movies to have a ceremony
  if (eligibleMovies.length < 3) {
    return null;
  }

  const allNominations: AwardNomination[] = [];

  // Generate nominations for each category
  Object.values(AwardCategory).forEach(category => {
    const categoryNominations = generateCategoryNominations(
      category as AwardCategory,
      eligibleMovies,
      state.actors,
      state
    );
    allNominations.push(...categoryNominations);
  });

  return {
    id: uuid(),
    year,
    name: `${year} Academy Awards`,
    nominations: allNominations,
    announced: true,
    completed: false,
  };
};

// Determine winners for each category
export const determineWinners = (ceremony: AwardsCeremony): AwardsCeremony => {
  const updatedNominations = [...ceremony.nominations];
  const categories = [...new Set(updatedNominations.map(n => n.category))];

  categories.forEach(category => {
    const categoryNominees = updatedNominations.filter(n => n.category === category);
    if (categoryNominees.length > 0) {
      // Weight towards first nominees (higher quality) but with some randomness
      const weights = categoryNominees.map((_, idx) => Math.pow(0.7, idx) * (0.5 + Math.random()));
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const random = Math.random() * totalWeight;

      let cumulative = 0;
      for (let i = 0; i < categoryNominees.length; i++) {
        cumulative += weights[i];
        if (random <= cumulative) {
          // Find and update the winner
          const winnerIdx = updatedNominations.findIndex(n => n.id === categoryNominees[i].id);
          if (winnerIdx !== -1) {
            updatedNominations[winnerIdx] = { ...updatedNominations[winnerIdx], isWinner: true };
          }
          break;
        }
      }
    }
  });

  return {
    ...ceremony,
    nominations: updatedNominations,
    completed: true,
  };
};

// Apply award effects to game state (reputation boost, actor skill boost)
export const applyAwardEffects = (
  state: GameState,
  ceremony: AwardsCeremony
): { updatedState: GameState; events: GameEvent[] } => {
  const events: GameEvent[] = [];
  let newState = { ...state };

  const winners = ceremony.nominations.filter(n => n.isWinner);

  winners.forEach(winner => {
    // Studio reputation boost
    if (winner.studioId === 'player') {
      const reputationBoost = winner.category === AwardCategory.BestPicture ? 15 : 5;
      newState.reputation = Math.min(100, newState.reputation + reputationBoost);

      events.push({
        id: uuid(),
        month: newState.month,
        type: 'GOOD',
        message: `AWARDS: "${winner.movieTitle}" wins ${winner.category}! ${winner.actorName ? `(${winner.actorName})` : ''} +${reputationBoost} reputation`,
        read: false,
      });
    }

    // Actor skill boost for acting awards
    if (winner.actorId && (winner.category === AwardCategory.BestActor || winner.category === AwardCategory.BestActress)) {
      const actorIdx = newState.actors.findIndex(a => a.id === winner.actorId);
      if (actorIdx !== -1) {
        const skillBoost = 5 + Math.floor(Math.random() * 5);
        newState.actors = [...newState.actors];
        newState.actors[actorIdx] = {
          ...newState.actors[actorIdx],
          skill: Math.min(100, newState.actors[actorIdx].skill + skillBoost),
          reputation: Math.min(100, newState.actors[actorIdx].reputation + 10),
        };

        // Add gossip about the win
        const gossip = newState.actors[actorIdx].gossip || [];
        gossip.push(`Won ${winner.category} for "${winner.movieTitle}" at the ${ceremony.year} Academy Awards`);
        newState.actors[actorIdx].gossip = gossip.slice(-5); // Keep last 5
      }
    }
  });

  // Add ceremony summary event
  const playerWins = winners.filter(w => w.studioId === 'player').length;
  const playerNominations = ceremony.nominations.filter(n => n.studioId === 'player').length;

  events.push({
    id: uuid(),
    month: newState.month,
    type: playerWins > 0 ? 'GOOD' : 'INFO',
    message: `AWARDS: ${ceremony.year} Academy Awards complete! ${state.studioName}: ${playerWins} wins from ${playerNominations} nominations.`,
    read: false,
  });

  return { updatedState: newState, events };
};

// Check if it's time for awards (nominations in January, ceremony in February)
export const shouldAnnounceNominations = (month: number): boolean => month === 1;
export const shouldHoldCeremony = (month: number): boolean => month === 2;

// Get player's total award count
export const getPlayerAwardCount = (ceremonies: AwardsCeremony[]): { wins: number; nominations: number } => {
  let wins = 0;
  let nominations = 0;

  ceremonies.forEach(ceremony => {
    ceremony.nominations.forEach(nom => {
      if (nom.studioId === 'player') {
        nominations++;
        if (nom.isWinner) wins++;
      }
    });
  });

  return { wins, nominations };
};
