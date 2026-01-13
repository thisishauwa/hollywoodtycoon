import { Actor, ActorTier } from '../types';
// Using native crypto.randomUUID() instead of uuid package

export interface ActorLifecycleEvent {
  id: string;
  actorId: string;
  actorName: string;
  type: ActorEventType;
  varietyHeadline: string;
  description: string;
  impact: {
    reputation?: number;
    skill?: number;
    salaryMultiplier?: number; // Multiply current salary
    status?: Actor['status'];
    tierChange?: -1 | 0 | 1; // -1 = downgrade, 0 = no change, 1 = upgrade
  };
  stateChanges?: {
    maritalStatus?: 'single' | 'married' | 'divorced';
    scandalCooldown?: number; // Months
    partnerId?: string; // For marriages/divorces
  };
}

export type ActorEventType =
  | 'marriage'
  | 'divorce'
  | 'scandal'
  | 'death'
  | 'retirement'
  | 'comeback'
  | 'award_win'
  | 'career_slump';

// Extended actor state for lifecycle tracking
export interface ActorState {
  maritalStatus: 'single' | 'married' | 'divorced';
  scandalCooldownRemaining: number;
  monthsSinceLastFilm: number;
  partnerId?: string;
}

// Global state tracker (in production, this would be in DB)
const actorStates = new Map<string, ActorState>();

function getActorState(actorId: string): ActorState {
  if (!actorStates.has(actorId)) {
    actorStates.set(actorId, {
      maritalStatus: 'single',
      scandalCooldownRemaining: 0,
      monthsSinceLastFilm: 0,
    });
  }
  return actorStates.get(actorId)!;
}

function updateActorState(actorId: string, updates: Partial<ActorState>) {
  const current = getActorState(actorId);
  actorStates.set(actorId, { ...current, ...updates });
}

// Check if marriage event can happen
function canMarry(actor: Actor): boolean {
  const state = getActorState(actor.id);
  return (
    state.maritalStatus === 'single' &&
    actor.status !== 'Deceased' &&
    actor.status !== 'Retired' &&
    actor.age >= 22 &&
    actor.age <= 65
  );
}

// Check if divorce can happen
function canDivorce(actor: Actor): boolean {
  const state = getActorState(actor.id);
  return state.maritalStatus === 'married' && actor.status !== 'Deceased';
}

// Check if scandal can happen
function canHaveScandal(actor: Actor): boolean {
  const state = getActorState(actor.id);
  return (
    state.scandalCooldownRemaining === 0 &&
    (actor.status === 'Available' || actor.status === 'In Production') &&
    actor.status !== 'Deceased'
  );
}

// Check if career slump can happen
function canHaveCareerSlump(actor: Actor): boolean {
  const state = getActorState(actor.id);
  return (
    state.monthsSinceLastFilm >= 18 &&
    actor.reputation > 40 &&
    actor.status !== 'Deceased' &&
    actor.status !== 'Retired'
  );
}

// Check if comeback can happen
function canMakeComeback(actor: Actor): boolean {
  return (
    (actor.reputation < 40 || actor.status === 'On Hiatus') &&
    actor.status !== 'Deceased'
  );
}

// Generate a marriage event
function generateMarriageEvent(actor: Actor, allActors: Actor[]): ActorLifecycleEvent | null {
  if (!canMarry(actor)) return null;

  // Find eligible partner
  const eligiblePartners = allActors.filter(a => {
    if (a.id === actor.id) return false;
    const partnerState = getActorState(a.id);
    return (
      partnerState.maritalStatus === 'single' &&
      a.status !== 'Deceased' &&
      a.status !== 'Retired' &&
      Math.abs(a.age - actor.age) < 20
    );
  });

  if (eligiblePartners.length === 0) return null;

  const partner = eligiblePartners[Math.floor(Math.random() * eligiblePartners.length)];

  return {
    id: crypto.randomUUID(),
    actorId: actor.id,
    actorName: actor.name,
    type: 'marriage',
    varietyHeadline: `WEDDING BELLS: ${actor.name} and ${partner.name} tie the knot in lavish ceremony.`,
    description: `Hollywood couple confirms marriage. Sources say they "couldn't be happier."`,
    impact: {
      reputation: 10,
      skill: 2,
      salaryMultiplier: 1.15,
    },
    stateChanges: {
      maritalStatus: 'married',
      partnerId: partner.id,
    },
  };
}

// Generate a divorce event
function generateDivorceEvent(actor: Actor, allActors: Actor[]): ActorLifecycleEvent | null {
  if (!canDivorce(actor)) return null;

  const state = getActorState(actor.id);
  const partner = allActors.find(a => a.id === state.partnerId);
  if (!partner) return null;

  return {
    id: crypto.randomUUID(),
    actorId: actor.id,
    actorName: actor.name,
    type: 'divorce',
    varietyHeadline: `SPLITSVILLE: ${actor.name} and ${partner.name} confirm divorce.`,
    description: `The split is reportedly messy. Tabloids are having a field day.`,
    impact: {
      reputation: -12,
      salaryMultiplier: 0.90,
    },
    stateChanges: {
      maritalStatus: 'divorced',
      partnerId: undefined,
    },
  };
}

// Generate a scandal event
function generateScandalEvent(actor: Actor): ActorLifecycleEvent | null {
  if (!canHaveScandal(actor)) return null;

  const scandalTypes = [
    'DUI arrest',
    'public altercation',
    'controversial comments',
    'backstage drama',
    'contract dispute',
  ];
  
  const scandal = scandalTypes[Math.floor(Math.random() * scandalTypes.length)];

  return {
    id: crypto.randomUUID(),
    actorId: actor.id,
    actorName: actor.name,
    type: 'scandal',
    varietyHeadline: `SCANDAL: ${actor.name} embroiled in ${scandal}. Career in jeopardy.`,
    description: `Industry insiders question whether ${actor.name} can recover from this PR nightmare.`,
    impact: {
      reputation: -25,
      salaryMultiplier: 0.70,
    },
    stateChanges: {
      scandalCooldown: 24, // 2 years before another scandal
    },
  };
}

// Generate death event
function generateDeathEvent(actor: Actor): ActorLifecycleEvent | null {
  if (actor.status === 'Deceased') return null;

  return {
    id: crypto.randomUUID(),
    actorId: actor.id,
    actorName: actor.name,
    type: 'death',
    varietyHeadline: `TRAGIC LOSS: ${actor.name} passes away at age ${actor.age}. Industry mourns.`,
    description: `Tributes pour in from colleagues and fans worldwide. A memorial service is being planned.`,
    impact: {
      status: 'Deceased',
    },
    stateChanges: {},
  };
}

// Generate career slump event
function generateCareerSlumpEvent(actor: Actor): ActorLifecycleEvent | null {
  if (!canHaveCareerSlump(actor)) return null;

  return {
    id: crypto.randomUUID(),
    actorId: actor.id,
    actorName: actor.name,
    type: 'career_slump',
    varietyHeadline: `CAREER CRISIS: ${actor.name} struggles to land roles. "Where are they now?"`,
    description: `Once a household name, ${actor.name} hasn't appeared in a film in over a year. Agents are concerned.`,
    impact: {
      reputation: -15,
      salaryMultiplier: 0.80,
      tierChange: -1,
    },
    stateChanges: {},
  };
}

// Generate comeback event
function generateComebackEvent(actor: Actor): ActorLifecycleEvent | null {
  if (!canMakeComeback(actor)) return null;

  return {
    id: crypto.randomUUID(),
    actorId: actor.id,
    actorName: actor.name,
    type: 'comeback',
    varietyHeadline: `COMEBACK KID: ${actor.name} returns to spotlight with powerful new role.`,
    description: `After time away, ${actor.name} reminds everyone why they're a star. Critics are impressed.`,
    impact: {
      reputation: 20,
      salaryMultiplier: 1.10,
      status: 'Available',
    },
    stateChanges: {},
  };
}

// Generate award win event
function generateAwardWinEvent(actor: Actor): ActorLifecycleEvent | null {
  if (actor.status === 'Deceased' || actor.status === 'Retired') return null;
  if (actor.skill < 60) return null; // Only skilled actors

  return {
    id: crypto.randomUUID(),
    actorId: actor.id,
    actorName: actor.name,
    type: 'award_win',
    varietyHeadline: `AWARD GLORY: ${actor.name} wins prestigious acting award. Career-defining moment.`,
    description: `The win cements ${actor.name}'s status as one of Hollywood's elite. Offers pouring in.`,
    impact: {
      reputation: 30,
      skill: 15,
      salaryMultiplier: 1.50,
      tierChange: 1,
    },
    stateChanges: {},
  };
}

// Main function to generate lifecycle events
export function generateActorLifecycleEvents(
  actors: Actor[],
  eventsToGenerate: number = 2 // Reduced from 3 to 2
): ActorLifecycleEvent[] {
  const events: ActorLifecycleEvent[] = [];
  
  // Prioritize high-tier actors and those with active contracts
  const sortedActors = [...actors].sort((a, b) => {
    const tierWeight = { [ActorTier.AList]: 3, [ActorTier.BList]: 2, [ActorTier.CList]: 1 };
    return (tierWeight[b.tier] || 0) - (tierWeight[a.tier] || 0);
  });

  // Try to generate events
  for (const actor of sortedActors) {
    if (events.length >= eventsToGenerate) break;
    if (actor.status === 'Deceased') continue;

    // Death has age-based probability
    if (actor.age > 60 && Math.random() < 0.05) {
      const event = generateDeathEvent(actor);
      if (event) events.push(event);
      continue;
    }

    // Try different event types with weighted probabilities
    const roll = Math.random();
    
    if (roll < 0.15 && canMarry(actor)) {
      const event = generateMarriageEvent(actor, actors);
      if (event) events.push(event);
    } else if (roll < 0.25 && canDivorce(actor)) {
      const event = generateDivorceEvent(actor, actors);
      if (event) events.push(event);
    } else if (roll < 0.35 && canHaveScandal(actor)) {
      const event = generateScandalEvent(actor);
      if (event) events.push(event);
    } else if (roll < 0.50 && canHaveCareerSlump(actor)) {
      const event = generateCareerSlumpEvent(actor);
      if (event) events.push(event);
    } else if (roll < 0.65 && canMakeComeback(actor)) {
      const event = generateComebackEvent(actor);
      if (event) events.push(event);
    } else if (roll < 0.75 && actor.skill > 70) {
      const event = generateAwardWinEvent(actor);
      if (event) events.push(event);
    }
  }

  return events;
}

// Apply event impacts to an actor
export function applyActorLifecycleEvent(actor: Actor, event: ActorLifecycleEvent): Actor {
  const updated = { ...actor };

  // Apply impacts
  if (event.impact.reputation !== undefined) {
    updated.reputation = Math.max(0, Math.min(100, actor.reputation + event.impact.reputation));
  }
  
  if (event.impact.skill !== undefined) {
    updated.skill = Math.max(0, Math.min(100, actor.skill + event.impact.skill));
  }
  
  if (event.impact.salaryMultiplier !== undefined) {
    updated.salary = Math.round(actor.salary * event.impact.salaryMultiplier);
  }
  
  if (event.impact.status !== undefined) {
    updated.status = event.impact.status;
  }

  if (event.impact.tierChange) {
    const tiers = [ActorTier.CList, ActorTier.BList, ActorTier.AList];
    const currentIndex = tiers.indexOf(actor.tier);
    const newIndex = Math.max(0, Math.min(2, currentIndex + event.impact.tierChange));
    updated.tier = tiers[newIndex];
  }

  // Apply state changes
  if (event.stateChanges) {
    updateActorState(actor.id, event.stateChanges);
  }

  return updated;
}

// Tick cooldowns each month
export function tickActorCooldowns(actorIds: string[]) {
  for (const id of actorIds) {
    const state = getActorState(id);
    if (state.scandalCooldownRemaining > 0) {
      updateActorState(id, {
        scandalCooldownRemaining: state.scandalCooldownRemaining - 1,
      });
    }
    updateActorState(id, {
      monthsSinceLastFilm: state.monthsSinceLastFilm + 1,
    });
  }
}

// Reset film counter when actor appears in a film
export function actorAppearedInFilm(actorId: string) {
  updateActorState(actorId, { monthsSinceLastFilm: 0 });
}
