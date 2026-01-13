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

// Apply award effects to game state (reputation boost, actor skill boost, salary increase)
export const applyAwardEffects = async (
  state: GameState,
  ceremony: AwardsCeremony,
  supabase: any // Supabase client for persistence
): Promise<{ updatedState: GameState; events: GameEvent[] }> => {
  const events: GameEvent[] = [];
  let newState = { ...state };

  const winners = ceremony.nominations.filter(n => n.isWinner);

  // Generate GLOBAL events for major award winners (visible to all)
  const majorAwards = [AwardCategory.BestPicture, AwardCategory.BestActor, AwardCategory.BestActress];

  for (const winner of winners) {
    // Studio reputation boost (only for player)
    if (winner.studioId === 'player') {
      const reputationBoost = winner.category === AwardCategory.BestPicture ? 15 : 5;
      newState.reputation = Math.min(100, newState.reputation + reputationBoost);
    }

    // Generate global event for major awards (all studios see these)
    if (majorAwards.includes(winner.category as AwardCategory)) {
      const studioLabel = winner.studioId === 'player' ? state.studioName : 'A rival studio';
      events.push({
        id: uuid(),
        month: newState.month,
        type: 'GOOD',
        message: `AWARDS: "${winner.movieTitle}" (${studioLabel}) wins ${winner.category}! ${winner.actorName ? `Performance by ${winner.actorName}.` : ''}`,
        read: false,
        isGlobal: true, // Visible to all players
      });
    }

    // Actor skill & salary boost for acting awards
    if (winner.actorId && (winner.category === AwardCategory.BestActor || winner.category === AwardCategory.BestActress)) {
      const actorIdx = newState.actors.findIndex(a => a.id === winner.actorId);
      if (actorIdx !== -1) {
        const skillBoost = 5 + Math.floor(Math.random() * 5);
        const salaryMultiplier = 1.3 + (Math.random() * 0.2); // 30-50% increase

        newState.actors = [...newState.actors];
        const updatedActor = {
          ...newState.actors[actorIdx],
          skill: Math.min(100, newState.actors[actorIdx].skill + skillBoost),
          reputation: Math.min(100, newState.actors[actorIdx].reputation + 10),
          salary: Math.floor(newState.actors[actorIdx].salary * salaryMultiplier),
        };
        newState.actors[actorIdx] = updatedActor;

        // Add gossip about the win
        const gossip = updatedActor.gossip || [];
        gossip.push(`Won ${winner.category} for "${winner.movieTitle}" at the ${ceremony.year} Academy Awards`);
        updatedActor.gossip = gossip.slice(-5); // Keep last 5

        // Persist to database
        if (supabase) {
          await supabase
            .from('actors')
            .update({
              skill: updatedActor.skill,
              reputation: updatedActor.reputation,
              salary: updatedActor.salary,
              gossip: updatedActor.gossip,
            })
            .eq('id', winner.actorId);
        }

        const salaryIncreasePct = Math.round((salaryMultiplier - 1) * 100);
        events.push({
          id: uuid(),
          month: newState.month,
          type: 'INFO',
          message: `GOSSIP: ${winner.actorName}'s asking price surges ${salaryIncreasePct}% following ${winner.category} win!`,
          read: false,
          isGlobal: true, // All players see actor salary changes
        });
      }
    }
  }

  // Add ceremony summary event (GLOBAL)
  const bestPictureWinner = winners.find(w => w.category === AwardCategory.BestPicture);
  events.push({
    id: uuid(),
    month: newState.month,
    type: 'INFO',
    message: `AWARDS: ${ceremony.year} Academy Awards complete! Best Picture: "${bestPictureWinner?.movieTitle || 'N/A'}"`,
    read: false,
    isGlobal: true, // Visible to all players
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
