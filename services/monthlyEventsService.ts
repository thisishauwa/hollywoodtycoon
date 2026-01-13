// Using native crypto.randomUUID() instead of uuid package

export interface MonthlyEvent {
  id: string;
  name: string;
  category: 'market';
  type: 'good' | 'bad';
  description: string;
  varietyHeadline: string;
  impact: {
    reputation?: number;
    money?: number;
    revenueMultiplier?: number; // Apply to all films this month
    productionCostMultiplier?: number;
    hiringCostMultiplier?: number;
  };
  cooldownMonths: number; // Min months before this event can happen again
}

const GOOD_EVENTS: Omit<MonthlyEvent, 'id'>[] = [
  {
    name: 'Box Office Boom',
    category: 'market',
    type: 'good',
    description: 'Theater attendance surges across the industry',
    varietyHeadline: 'BOX OFFICE SURGE: Moviegoers flock to theaters as industry sees unexpected uptick in attendance.',
    impact: {
      revenueMultiplier: 1.10, // +10% revenue for all active releases
    },
    cooldownMonths: 3,
  },
  {
    name: 'Streaming Deal',
    category: 'market',
    type: 'good',
    description: 'Major streaming platform offers lucrative licensing deal',
    varietyHeadline: 'STREAMING WARS: Your studio lands coveted licensing deal with major platform.',
    impact: {
      money: 800000,
      reputation: 5,
    },
    cooldownMonths: 6,
  },
  {
    name: 'Tax Incentive',
    category: 'market',
    type: 'good',
    description: 'Government announces production tax rebates',
    varietyHeadline: 'POLICY WIN: New tax incentives make production more affordable for studios.',
    impact: {
      productionCostMultiplier: 0.85, // -15% production costs this month
    },
    cooldownMonths: 4,
  },
  {
    name: 'Talent Surplus',
    category: 'market',
    type: 'good',
    description: 'Labor dispute resolved, actors more available',
    varietyHeadline: 'STRIKE AVERTED: Union negotiations conclude peacefully. Actors ready to work.',
    impact: {
      hiringCostMultiplier: 0.90, // -10% hiring costs this month
    },
    cooldownMonths: 6,
  },
  {
    name: 'Positive Press',
    category: 'market',
    type: 'good',
    description: 'Media praises your recent work',
    varietyHeadline: 'CRITICAL DARLING: Industry insiders heap praise on your studio\'s recent output.',
    impact: {
      reputation: 15,
    },
    cooldownMonths: 2,
  },
  {
    name: 'Investor Interest',
    category: 'market',
    type: 'good',
    description: 'Venture capital shows interest in your studio',
    varietyHeadline: 'FUNDING SECURED: Wall Street bets big on Hollywood. Your studio benefits.',
    impact: {
      money: 500000,
      reputation: 10,
    },
    cooldownMonths: 6,
  },
];

const BAD_EVENTS: Omit<MonthlyEvent, 'id'>[] = [
  {
    name: 'Market Crash',
    category: 'market',
    type: 'bad',
    description: 'Economic downturn hits box office hard',
    varietyHeadline: 'BOX OFFICE BLUES: Economic uncertainty keeps audiences home. Studios feel the pinch.',
    impact: {
      revenueMultiplier: 0.85, // -15% revenue
    },
    cooldownMonths: 4,
  },
  {
    name: 'Wage Inflation',
    category: 'market',
    type: 'bad',
    description: 'Union wins major wage increases',
    varietyHeadline: 'LABOR VICTORY: Actor unions secure historic pay increases. Production costs soar.',
    impact: {
      hiringCostMultiplier: 1.20, // +20% hiring costs
    },
    cooldownMonths: 6,
  },
  {
    name: 'Competitor Dominance',
    category: 'market',
    type: 'bad',
    description: 'Rival studio crushes box office',
    varietyHeadline: 'BLOCKBUSTER BLITZ: Competitor\'s mega-hit dominates theaters. Other studios suffer.',
    impact: {
      revenueMultiplier: 0.75, // -25% revenue due to competition
      reputation: -10,
    },
    cooldownMonths: 3,
  },
  {
    name: 'Industry Scandal',
    category: 'market',
    type: 'bad',
    description: 'Hollywood scandal damages all studios',
    varietyHeadline: 'SCANDAL ROCKS HOLLYWOOD: Industry-wide controversy damages public perception.',
    impact: {
      reputation: -10,
    },
    cooldownMonths: 5,
  },
  {
    name: 'Production Crisis',
    category: 'market',
    type: 'bad',
    description: 'Industry-wide production issues increase costs',
    varietyHeadline: 'PRODUCTION NIGHTMARE: Equipment shortages and delays plague Hollywood studios.',
    impact: {
      productionCostMultiplier: 1.15, // +15% costs
    },
    cooldownMonths: 4,
  },
  {
    name: 'Piracy Surge',
    category: 'market',
    type: 'bad',
    description: 'Illegal downloads spike dramatically',
    varietyHeadline: 'PIRACY EPIDEMIC: Studios grapple with unprecedented levels of illegal distribution.',
    impact: {
      revenueMultiplier: 0.90, // -10% revenue
    },
    cooldownMonths: 3,
  },
];

interface EventHistory {
  lastOccurred: Map<string, number>; // event name -> month index (year * 12 + month)
  recentTypes: string[]; // Last 3 event types to ensure variety
}

const eventHistory: EventHistory = {
  lastOccurred: new Map(),
  recentTypes: [],
};

function getMonthIndex(month: number, year: number): number {
  return year * 12 + month;
}

function canEventOccur(event: Omit<MonthlyEvent, 'id'>, currentMonth: number, currentYear: number): boolean {
  const currentIndex = getMonthIndex(currentMonth, currentYear);
  const lastIndex = eventHistory.lastOccurred.get(event.name);
  
  if (!lastIndex) return true; // Never occurred
  
  const monthsSince = currentIndex - lastIndex;
  return monthsSince >= event.cooldownMonths;
}

export function generateMonthlyEvents(month: number, year: number): {
  good: MonthlyEvent[];
  bad: MonthlyEvent[];
} {
  const currentIndex = getMonthIndex(month, year);
  
  // Filter available events
  const availableGood = GOOD_EVENTS.filter(e => canEventOccur(e, month, year));
  const availableBad = BAD_EVENTS.filter(e => canEventOccur(e, month, year));
  
  // Coin flip: generate either 1 good OR 1 bad event (not both)
  const isGoodEvent = Math.random() > 0.5;
  const selectedGood: MonthlyEvent[] = [];
  const selectedBad: MonthlyEvent[] = [];
  
  if (isGoodEvent && availableGood.length > 0) {
    // Pick 1 good event
    const shuffled = [...availableGood].sort(() => Math.random() - 0.5);
    const event = {
      ...shuffled[0],
      id: crypto.randomUUID(),
    };
    selectedGood.push(event);
    eventHistory.lastOccurred.set(event.name, currentIndex);
  } else if (availableBad.length > 0) {
    // Pick 1 bad event
    const shuffled = [...availableBad].sort(() => Math.random() - 0.5);
    const event = {
      ...shuffled[0],
      id: crypto.randomUUID(),
    };
    selectedBad.push(event);
    eventHistory.lastOccurred.set(event.name, currentIndex);
  }
  
  return { good: selectedGood, bad: selectedBad };
}

export function applyMonthlyEventImpacts(
  events: MonthlyEvent[],
  currentBalance: number,
  currentReputation: number
): {
  newBalance: number;
  newReputation: number;
  revenueMultiplier: number;
  productionCostMultiplier: number;
  hiringCostMultiplier: number;
} {
  let newBalance = currentBalance;
  let newReputation = currentReputation;
  let revenueMultiplier = 1.0;
  let productionCostMultiplier = 1.0;
  let hiringCostMultiplier = 1.0;
  
  for (const event of events) {
    if (event.impact.money) {
      newBalance += event.impact.money;
    }
    if (event.impact.reputation) {
      newReputation += event.impact.reputation;
    }
    if (event.impact.revenueMultiplier) {
      revenueMultiplier *= event.impact.revenueMultiplier;
    }
    if (event.impact.productionCostMultiplier) {
      productionCostMultiplier *= event.impact.productionCostMultiplier;
    }
    if (event.impact.hiringCostMultiplier) {
      hiringCostMultiplier *= event.impact.hiringCostMultiplier;
    }
  }
  
  // Clamp reputation
  newReputation = Math.max(0, Math.min(100, newReputation));
  
  return {
    newBalance,
    newReputation,
    revenueMultiplier,
    productionCostMultiplier,
    hiringCostMultiplier,
  };
}
