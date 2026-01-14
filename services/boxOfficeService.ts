import { Movie, Actor, Genre } from "../types";

/**
 * Box Office Revenue Calculation Service
 *
 * Calculates realistic box office revenue based on:
 * - Movie quality (production value, script, direction)
 * - Marketing budget (awareness and reach)
 * - Cast star power (A-list actors draw audiences)
 * - Genre popularity and trends
 * - Studio reputation (brand trust)
 * - Competition (other releases in same month)
 * - Chemistry (cast synergy affects word-of-mouth)
 */

// Base revenue multipliers by genre (some genres naturally earn more)
const GENRE_BASE_MULTIPLIERS: Record<Genre, number> = {
  [Genre.Action]: 1.4, // Action films have wide appeal
  [Genre.SciFi]: 1.3, // Sci-fi has dedicated fanbase
  [Genre.Fantasy]: 1.3, // Fantasy epics perform well
  [Genre.Comedy]: 1.0, // Moderate earners
  [Genre.Drama]: 0.9, // Smaller but consistent
  [Genre.Romance]: 0.8, // Niche audience
  [Genre.Horror]: 1.1, // Low budget, high return potential
  [Genre.Thriller]: 1.0, // Steady performers
};

// Star power tiers - how much box office draw each tier has
const ACTOR_TIER_MULTIPLIERS = {
  "A-List": 1.5,
  "B-List": 1.2,
  "C-List": 1.0,
  "Indie Darling": 0.9,
  Newcomer: 0.8,
};

interface RevenueCalculationResult {
  totalRevenue: number;
  openingWeekend: number;
  breakdown: {
    baseRevenue: number;
    qualityBonus: number;
    marketingBonus: number;
    starPowerBonus: number;
    chemistryBonus: number;
    reputationBonus: number;
    genreMultiplier: number;
  };
  performance:
    | "Flop"
    | "Underperformer"
    | "Moderate"
    | "Hit"
    | "Blockbuster"
    | "Phenomenon";
}

/**
 * Calculate box office revenue for a released movie
 */
export const calculateBoxOfficeRevenue = (
  movie: Movie,
  cast: Actor[],
  studioReputation: number,
  competitionCount: number = 0 // Number of other films released same month
): RevenueCalculationResult => {
  // 1. BASE REVENUE - Starts with production budget as baseline
  // Industry rule: A film needs to make ~2x its budget to break even (marketing, distribution, etc.)
  // NERFED: Reduced from 2.5 to 1.8 to make profitability harder
  const baseRevenue = movie.productionBudget * 1.8;

  // 2. QUALITY MULTIPLIER (0.5x to 2.0x)
  // Quality score (0-100) determines how well the film is received
  const qualityMultiplier = 0.5 + (movie.quality / 100) * 1.5;
  const qualityBonus = baseRevenue * (qualityMultiplier - 1);

  // 3. MARKETING MULTIPLIER
  // More marketing = more awareness = more tickets
  // Diminishing returns: First million is most effective
  // NERFED: Max multiplier reduced from 1.8 to 1.5
  const marketingRatio = movie.marketingBudget / movie.productionBudget;
  const marketingMultiplier = Math.min(1.5, 1 + marketingRatio * 0.8);
  const marketingBonus = baseRevenue * (marketingMultiplier - 1);

  // 4. STAR POWER MULTIPLIER
  // Calculate average star power of cast
  const castStarPower =
    cast.reduce((total, actor) => {
      const tierMultiplier =
        ACTOR_TIER_MULTIPLIERS[
          actor.tier as keyof typeof ACTOR_TIER_MULTIPLIERS
        ] || 1.0;
      const reputationFactor = actor.reputation / 100; // 0-1
      return total + tierMultiplier * reputationFactor;
    }, 0) / Math.max(cast.length, 1);

  // NERFED: scaling reduced from 0.6 to 0.5
  const starPowerMultiplier = 0.8 + castStarPower * 0.5; // 0.8x to 1.3x
  const starPowerBonus = baseRevenue * (starPowerMultiplier - 1);

  // 5. CHEMISTRY MULTIPLIER
  // Good chemistry = better reviews and word-of-mouth
  const chemistryMultiplier = 0.9 + (movie.chemistry / 100) * 0.4; // 0.9x to 1.3x
  const chemistryBonus = baseRevenue * (chemistryMultiplier - 1);

  // 6. STUDIO REPUTATION MULTIPLIER
  // Established studios have brand recognition
  const reputationMultiplier = 0.9 + (studioReputation / 100) * 0.3; // 0.9x to 1.2x
  const reputationBonus = baseRevenue * (reputationMultiplier - 1);

  // 7. GENRE MULTIPLIER
  const genreMultiplier = GENRE_BASE_MULTIPLIERS[movie.genre] || 1.0;
  const genreBonus = baseRevenue * (genreMultiplier - 1);

  // 8. COMPETITION PENALTY
  // More films released same month = split audience
  const competitionPenalty = Math.max(0.7, 1 - competitionCount * 0.1); // Max 30% penalty

  // 9. RANDOM VARIANCE (±15%)
  // Movies can overperform or underperform expectations
  const variance = 0.85 + Math.random() * 0.3; // 0.85 to 1.15

  // CALCULATE TOTAL REVENUE
  const totalBeforeModifiers =
    baseRevenue +
    qualityBonus +
    marketingBonus +
    starPowerBonus +
    chemistryBonus +
    reputationBonus +
    genreBonus;

  const totalRevenue = Math.round(
    totalBeforeModifiers * competitionPenalty * variance
  );

  // Opening weekend is typically 25-35% of total domestic gross
  const openingWeekend = Math.round(
    totalRevenue * (0.25 + Math.random() * 0.1)
  );

  // Determine performance category
  const roi =
    (totalRevenue - (movie.productionBudget + movie.marketingBudget)) /
    (movie.productionBudget + movie.marketingBudget);

  let performance: RevenueCalculationResult["performance"];
  if (roi < -0.5) performance = "Flop";
  else if (roi < 0) performance = "Underperformer";
  else if (roi < 0.5) performance = "Moderate";
  else if (roi < 1.5) performance = "Hit";
  else if (roi < 3.0) performance = "Blockbuster";
  else performance = "Phenomenon";

  return {
    totalRevenue,
    openingWeekend,
    breakdown: {
      baseRevenue,
      qualityBonus: Math.round(qualityBonus),
      marketingBonus: Math.round(marketingBonus),
      starPowerBonus: Math.round(starPowerBonus),
      chemistryBonus: Math.round(chemistryBonus),
      reputationBonus: Math.round(reputationBonus),
      genreMultiplier,
    },
    performance,
  };
};

/**
 * Generate box office performance review text
 */
export const generateBoxOfficeReview = (
  movie: Movie,
  result: RevenueCalculationResult
): string => {
  const totalCost = movie.productionBudget + movie.marketingBudget;
  const profit = result.totalRevenue - totalCost;

  const reviews = {
    Phenomenon: [
      `"${movie.title}" SHATTERS BOX OFFICE RECORDS! Opening weekend of $${(
        result.openingWeekend / 1000000
      ).toFixed(
        1
      )}M breaks all expectations. Industry insiders calling it "the film of the decade."`,
      `PHENOMENON ALERT: "${
        movie.title
      }" dominates theaters with unprecedented $${(
        result.totalRevenue / 1000000
      ).toFixed(
        1
      )}M gross. Audiences can't get enough. Already greenlit for sequel.`,
      `"${movie.title}" becomes instant cultural phenomenon. $${(
        result.openingWeekend / 1000000
      ).toFixed(
        1
      )}M opening weekend sets new benchmark. Social media explodes with fan theories.`,
    ],
    Blockbuster: [
      `"${movie.title}" CRUSHES IT at box office! $${(
        result.totalRevenue / 1000000
      ).toFixed(
        1
      )}M total gross makes it one of the year's biggest hits. Studio executives celebrating.`,
      `BLOCKBUSTER SUCCESS: "${movie.title}" exceeds all projections with $${(
        result.openingWeekend / 1000000
      ).toFixed(1)}M opening. Word-of-mouth driving repeat viewings.`,
      `"${movie.title}" proves to be box office gold, raking in $${(
        result.totalRevenue / 1000000
      ).toFixed(1)}M. Critics and audiences agree: this one's a winner.`,
    ],
    Hit: [
      `"${movie.title}" performs well at box office with solid $${(
        result.totalRevenue / 1000000
      ).toFixed(1)}M gross. Strong reviews driving steady ticket sales.`,
      `BOX OFFICE HIT: "${movie.title}" finds its audience with $${(
        result.openingWeekend / 1000000
      ).toFixed(
        1
      )}M opening weekend. Legs looking good for long theatrical run.`,
      `"${movie.title}" delivers at the box office. $${(
        result.totalRevenue / 1000000
      ).toFixed(1)}M total makes it a profitable venture for the studio.`,
    ],
    Moderate: [
      `"${movie.title}" opens to moderate $${(
        result.openingWeekend / 1000000
      ).toFixed(1)}M. Final gross of $${(result.totalRevenue / 1000000).toFixed(
        1
      )}M covers costs but won't break records.`,
      `Mixed results for "${movie.title}" - $${(
        result.totalRevenue / 1000000
      ).toFixed(
        1
      )}M gross is respectable but not spectacular. Studio breaks even.`,
      `"${movie.title}" finds modest audience. $${(
        result.totalRevenue / 1000000
      ).toFixed(
        1
      )}M total is enough to recoup investment. Not a loss, not a win.`,
    ],
    Underperformer: [
      `"${movie.title}" disappoints at box office. $${(
        result.totalRevenue / 1000000
      ).toFixed(1)}M gross falls short of $${(totalCost / 1000000).toFixed(
        1
      )}M budget. Studio taking losses.`,
      `UNDERPERFORMS: "${movie.title}" struggles to find audience. $${(
        result.openingWeekend / 1000000
      ).toFixed(1)}M opening signals trouble. Final tally disappoints.`,
      `"${movie.title}" fails to connect with moviegoers. $${(
        result.totalRevenue / 1000000
      ).toFixed(1)}M total leaves studio in the red by $${(
        Math.abs(profit) / 1000000
      ).toFixed(1)}M.`,
    ],
    Flop: [
      `MAJOR FLOP: "${
        movie.title
      }" crashes and burns at box office. Disastrous $${(
        result.openingWeekend / 1000000
      ).toFixed(1)}M opening. Studio loses $${(
        Math.abs(profit) / 1000000
      ).toFixed(1)}M.`,
      `"${movie.title}" bombs spectacularly. $${(
        result.totalRevenue / 1000000
      ).toFixed(1)}M gross is catastrophic against $${(
        totalCost / 1000000
      ).toFixed(1)}M budget. Heads will roll.`,
      `BOX OFFICE DISASTER: "${
        movie.title
      }" is one of the year's biggest bombs. Empty theaters, brutal reviews. Studio takes massive $${(
        Math.abs(profit) / 1000000
      ).toFixed(1)}M loss.`,
    ],
  };

  const options = reviews[result.performance];
  return options[Math.floor(Math.random() * options.length)];
};

/**
 * Calculate reputation change based on box office performance
 */
export const calculateReputationChange = (
  result: RevenueCalculationResult,
  movie: Movie
): number => {
  const totalCost = movie.productionBudget + movie.marketingBudget;
  const roi = (result.totalRevenue - totalCost) / totalCost;

  // Reputation changes based on ROI
  // NERFED: Drastically reduced gains to make progression slower
  if (roi >= 3.0) return 5; // Phenomenon: +5 (was +15)
  if (roi >= 1.5) return 3; // Blockbuster: +3 (was +10)
  if (roi >= 0.5) return 1; // Hit: +1 (was +5)
  if (roi >= 0) return 0; // Moderate: 0 (was +2)
  if (roi >= -0.5) return -2; // Underperformer: -2 (was -5)
  return -5; // Flop: -5 (was -10) - slightly less punishment to balance harder profits
};

/**
 * Get performance emoji for UI display
 */
export const getPerformanceEmoji = (
  performance: RevenueCalculationResult["performance"]
): string => {
  const emojis = {
    Phenomenon: "🔥",
    Blockbuster: "💰",
    Hit: "✨",
    Moderate: "👍",
    Underperformer: "😐",
    Flop: "💀",
  };
  return emojis[performance];
};
