import { Actor, ActorTier, Genre } from "../types";

export interface LifecycleEvent {
  id: string;
  actorId: string;
  actorName: string;
  type: LifecycleEventType;
  message: string;
  gossip?: string; // New gossip item to add to actor's gossip array
  impact: {
    reputation?: number;
    skill?: number;
    salary?: number;
    status?: Actor["status"];
    age?: number;
    relationships?: Record<string, number>;
  };
  month: number;
}

export type LifecycleEventType =
  | "death"
  | "retirement"
  | "marriage"
  | "divorce"
  | "scandal"
  | "comeback"
  | "award_nomination"
  | "award_win"
  | "personal_issues"
  | "rehab"
  | "career_slump"
  | "breakout_role"
  | "feud"
  | "reconciliation"
  | "aging";

// Probability tables (per month)
const EVENT_PROBABILITIES: Record<LifecycleEventType, (actor: Actor) => number> = {
  death: (actor) => {
    if (actor.status === "Deceased") return 0;
    if (actor.age < 40) return 0.0005;
    if (actor.age < 60) return 0.002;
    if (actor.age < 75) return 0.008;
    return 0.02;
  },
  retirement: (actor) => {
    if (actor.status === "Retired" || actor.status === "Deceased") return 0;
    if (actor.age < 50) return 0.001;
    if (actor.age < 65) return 0.01;
    if (actor.age < 75) return 0.03;
    return 0.06;
  },
  marriage: (actor) => {
    if (actor.status === "Deceased" || actor.status === "Retired") return 0;
    if (actor.age < 25) return 0.02;
    if (actor.age < 40) return 0.015;
    return 0.005;
  },
  divorce: (actor) => {
    // Check if they have any positive relationships (assumed married)
    const hasMarriage = Object.values(actor.relationships).some(v => v > 50);
    if (!hasMarriage || actor.status === "Deceased") return 0;
    return 0.008;
  },
  scandal: (actor) => {
    if (actor.status === "Deceased" || actor.status === "Retired") return 0;
    // Higher tier = more scrutiny
    const tierMultiplier = actor.tier === ActorTier.AList ? 2 : actor.tier === ActorTier.BList ? 1.5 : 1;
    return 0.005 * tierMultiplier;
  },
  comeback: (actor) => {
    if (actor.status === "Deceased" || actor.status === "Retired") return 0;
    if (actor.reputation > 60) return 0;
    return 0.02;
  },
  award_nomination: (actor) => {
    if (actor.status === "Deceased" || actor.status === "Retired") return 0;
    const skillFactor = actor.skill / 100;
    return 0.01 * skillFactor;
  },
  award_win: (actor) => {
    if (actor.status === "Deceased" || actor.status === "Retired") return 0;
    const skillFactor = actor.skill / 100;
    return 0.003 * skillFactor;
  },
  personal_issues: (actor) => {
    if (actor.status === "Deceased" || actor.status === "Retired" || actor.status === "On Hiatus") return 0;
    return 0.008;
  },
  rehab: (actor) => {
    if (actor.status !== "On Hiatus") return 0;
    return 0.1; // Higher chance to recover if already on hiatus
  },
  career_slump: (actor) => {
    if (actor.status === "Deceased" || actor.status === "Retired") return 0;
    if (actor.reputation < 40) return 0; // Already in slump
    return 0.008;
  },
  breakout_role: (actor) => {
    if (actor.status === "Deceased" || actor.status === "Retired") return 0;
    // More likely for newcomers
    const tierFactor = actor.tier === ActorTier.Newcomer ? 3 : actor.tier === ActorTier.CList ? 2 : 1;
    return 0.005 * tierFactor;
  },
  feud: (actor) => {
    if (actor.status === "Deceased" || actor.status === "Retired") return 0;
    return 0.01;
  },
  reconciliation: (actor) => {
    const hasFeud = Object.values(actor.relationships).some(v => v < -30);
    if (!hasFeud || actor.status === "Deceased") return 0;
    return 0.015;
  },
  aging: () => 1.0 / 12, // Age once per year on average (each month has 1/12 chance)
};

const SCANDAL_TYPES = [
  "caught in a tax evasion scheme",
  "photographed in a compromising situation",
  "accused of being difficult on set",
  "linked to a controversial political figure",
  "spotted at an underground poker game",
  "rumored to have a secret family",
  "involved in a bar fight",
  "accused of plagiarizing a speech",
  "caught lying about their age",
  "leaked DMs reveal explosive feuds",
];

const AWARD_NAMES = [
  "Golden Globe",
  "SAG Award",
  "Critics' Choice",
  "People's Choice",
  "MTV Movie Award",
  "Independent Spirit Award",
];

const generateEventId = () => `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function processActorLifecycle(
  actors: Actor[],
  currentMonth: number
): { updatedActors: Actor[]; events: LifecycleEvent[] } {
  const events: LifecycleEvent[] = [];
  const updatedActors = actors.map(actor => ({ ...actor }));

  for (let i = 0; i < updatedActors.length; i++) {
    const actor = updatedActors[i];
    if (actor.status === "Deceased") continue;

    // Check each event type
    for (const [eventType, getProbability] of Object.entries(EVENT_PROBABILITIES)) {
      const probability = getProbability(actor);
      if (Math.random() < probability) {
        const event = generateEvent(actor, eventType as LifecycleEventType, currentMonth, updatedActors);
        if (event) {
          events.push(event);
          applyEventToActor(updatedActors[i], event);

          // Apply relationship changes to other actors
          if (event.impact.relationships) {
            for (const [otherId, change] of Object.entries(event.impact.relationships)) {
              const otherIndex = updatedActors.findIndex(a => a.id === otherId);
              if (otherIndex !== -1) {
                updatedActors[otherIndex].relationships[actor.id] =
                  (updatedActors[otherIndex].relationships[actor.id] || 0) + change;
              }
            }
          }
        }
      }
    }
  }

  return { updatedActors, events };
}

function generateEvent(
  actor: Actor,
  type: LifecycleEventType,
  month: number,
  allActors: Actor[]
): LifecycleEvent | null {
  const baseEvent = {
    id: generateEventId(),
    actorId: actor.id,
    actorName: actor.name,
    type,
    month,
    impact: {} as LifecycleEvent["impact"],
    message: "",
  };

  switch (type) {
    case "death":
      return {
        ...baseEvent,
        message: `Tragic news: ${actor.name} has passed away at age ${actor.age}. The industry mourns.`,
        gossip: `The industry still hasn't recovered from the loss. Tributes continue to pour in from colleagues and fans worldwide.`,
        impact: { status: "Deceased" },
      };

    case "retirement":
      return {
        ...baseEvent,
        message: `${actor.name} announces retirement from acting after a storied career.`,
        gossip: `Officially retired from the business. Sources say they're "at peace" with the decision, though insiders wonder if a comeback is inevitable.`,
        impact: { status: "Retired" },
      };

    case "marriage": {
      // Find a potential partner from other actors
      const eligiblePartners = allActors.filter(
        a => a.id !== actor.id &&
             a.status !== "Deceased" &&
             a.status !== "Retired" &&
             Math.abs(a.age - actor.age) < 20
      );
      if (eligiblePartners.length === 0) return null;

      const partner = eligiblePartners[Math.floor(Math.random() * eligiblePartners.length)];
      return {
        ...baseEvent,
        message: `Wedding bells! ${actor.name} and ${partner.name} tie the knot in a lavish ceremony.`,
        gossip: `Just married ${partner.name}! The ceremony was the talk of the town. Insiders say they're "blissfully happy" but Hollywood marriages... we'll see.`,
        impact: {
          reputation: 5,
          relationships: { [partner.id]: 60 }
        },
      };
    }

    case "divorce": {
      // Find who they're "married" to
      const marriages = Object.entries(actor.relationships).filter(([_, v]) => v > 50);
      if (marriages.length === 0) return null;

      const [partnerId] = marriages[Math.floor(Math.random() * marriages.length)];
      const partner = allActors.find(a => a.id === partnerId);
      if (!partner) return null;

      return {
        ...baseEvent,
        message: `Splitsville! ${actor.name} and ${partner.name} confirm divorce after irreconcilable differences.`,
        gossip: `The split from ${partner.name} is getting UGLY. Lawyers are involved, and friends are being forced to pick sides. One source called it "a bloodbath."`,
        impact: {
          reputation: -8,
          skill: -8, // Emotional turmoil affects performance
          relationships: { [partnerId]: -80 }
        },
      };
    }

    case "scandal": {
      const scandal = SCANDAL_TYPES[Math.floor(Math.random() * SCANDAL_TYPES.length)];
      return {
        ...baseEvent,
        message: `Scandal rocks Hollywood: ${actor.name} ${scandal}.`,
        gossip: `The scandal won't die down. Publicists are in crisis mode, and studio execs are reconsidering upcoming projects. Career damage assessment: ongoing.`,
        impact: { reputation: -15, skill: -10, salary: -actor.salary * 0.15 }, // Scandal tanks everything
      };
    }

    case "comeback":
      return {
        ...baseEvent,
        message: `${actor.name} makes stunning comeback with critically acclaimed indie role.`,
        gossip: `The comeback is REAL. Critics are calling it a "career resurrection." Suddenly everyone who doubted them is pretending they always believed.`,
        impact: { reputation: 20, skill: 5, salary: actor.salary * 0.20 }, // Comeback = demand goes up
      };

    case "award_nomination": {
      const award = AWARD_NAMES[Math.floor(Math.random() * AWARD_NAMES.length)];
      return {
        ...baseEvent,
        message: `${actor.name} earns ${award} nomination for outstanding performance.`,
        gossip: `${award} nominated! The campaign trail begins. Sources say they're "cautiously optimistic" but privately "already practicing their speech."`,
        impact: { reputation: 8, skill: 3, salary: actor.salary * 0.10 }, // Nomination = price bump
      };
    }

    case "award_win": {
      const award = AWARD_NAMES[Math.floor(Math.random() * AWARD_NAMES.length)];
      return {
        ...baseEvent,
        message: `${actor.name} wins ${award}! Emotional acceptance speech goes viral.`,
        gossip: `${award} WINNER! The after-party was legendary. Quote fees have tripled overnight. Their agent hasn't slept in three days.`,
        impact: { reputation: 15, skill: 5, salary: actor.salary * 0.30 }, // Award win = major price jump
      };
    }

    case "personal_issues":
      return {
        ...baseEvent,
        message: `${actor.name} takes leave from Hollywood to deal with personal matters.`,
        gossip: `Stepped away from the spotlight. Close friends say it was "a long time coming." No timeline for return. Industry peers sending support.`,
        impact: { status: "On Hiatus", skill: -5 }, // Personal struggles affect focus
      };

    case "rehab":
      return {
        ...baseEvent,
        message: `${actor.name} returns to work after time away. Sources say they're refreshed and ready.`,
        gossip: `Back in action and looking better than ever. The hiatus clearly did wonders. Scripts are already piling up on their agent's desk.`,
        impact: { status: "Available", reputation: 3, skill: 8 }, // Refreshed and recharged
      };

    case "career_slump":
      return {
        ...baseEvent,
        message: `Rough patch for ${actor.name} as recent projects underperform. Industry insiders worried.`,
        gossip: `Career hitting a rough patch. Recent projects tanked, and insiders whisper about "box office poison." Needs a hit, and fast.`,
        impact: { reputation: -10, skill: -6, salary: -actor.salary * 0.15 }, // Confidence shaken
      };

    case "breakout_role":
      return {
        ...baseEvent,
        message: `${actor.name} delivers breakout performance! Agents' phones ringing off the hook.`,
        gossip: `BREAKOUT STAR! Everyone's scrambling to work with them. The performance is all anyone's talking about. A star is officially born.`,
        impact: { reputation: 12, skill: 8, salary: actor.salary * 0.25 },
      };

    case "feud": {
      // Pick a random other actor to feud with
      const feudTargets = allActors.filter(
        a => a.id !== actor.id &&
             a.status !== "Deceased" &&
             (actor.relationships[a.id] || 0) > -50
      );
      if (feudTargets.length === 0) return null;

      const target = feudTargets[Math.floor(Math.random() * feudTargets.length)];
      return {
        ...baseEvent,
        message: `Drama alert! ${actor.name} and ${target.name} have very public falling out.`,
        gossip: `Major feud with ${target.name}! Insiders say they can't be in the same room. Studios are already being warned not to cast them together.`,
        impact: {
          reputation: -5,
          skill: -4, // Drama is distracting
          relationships: { [target.id]: -40 }
        },
      };
    }

    case "reconciliation": {
      const feuds = Object.entries(actor.relationships).filter(([_, v]) => v < -30);
      if (feuds.length === 0) return null;

      const [formerFoeId] = feuds[Math.floor(Math.random() * feuds.length)];
      const formerFoe = allActors.find(a => a.id === formerFoeId);
      if (!formerFoe) return null;

      return {
        ...baseEvent,
        message: `Feud over! ${actor.name} and ${formerFoe.name} spotted hugging at industry event.`,
        gossip: `Made peace with ${formerFoe.name}! They were seen having a long talk at an industry event. Sources say "the hatchet is buried." For now.`,
        impact: {
          reputation: 3,
          skill: 3, // Peace of mind helps focus
          relationships: { [formerFoeId]: 50 }
        },
      };
    }

    case "aging":
      // Don't generate a news event for normal aging
      return {
        ...baseEvent,
        message: "", // Silent event
        impact: { age: 1 },
      };

    default:
      return null;
  }
}

function applyEventToActor(actor: Actor, event: LifecycleEvent) {
  const { impact } = event;

  if (impact.status) {
    actor.status = impact.status;
  }

  if (impact.reputation) {
    actor.reputation = Math.max(0, Math.min(100, actor.reputation + impact.reputation));
  }

  if (impact.skill) {
    actor.skill = Math.max(0, Math.min(100, actor.skill + impact.skill));
  }

  if (impact.salary) {
    actor.salary = Math.max(10000, Math.round(actor.salary + impact.salary));
  }

  if (impact.age) {
    actor.age += impact.age;
  }

  if (impact.relationships) {
    for (const [otherId, change] of Object.entries(impact.relationships)) {
      actor.relationships[otherId] = Math.max(-100, Math.min(100,
        (actor.relationships[otherId] || 0) + change
      ));
    }
  }

  // Add new gossip to the actor's gossip array (keep most recent 6)
  if (event.gossip && event.gossip.trim()) {
    if (!actor.gossip) {
      actor.gossip = [];
    }
    actor.gossip = [event.gossip, ...actor.gossip].slice(0, 6);
  }
}

// Utility to get tier changes based on reputation
export function updateActorTiers(actors: Actor[]): Actor[] {
  return actors.map(actor => {
    if (actor.status === "Deceased" || actor.status === "Retired") return actor;

    let newTier = actor.tier;

    // Tier promotion/demotion based on reputation
    if (actor.reputation >= 90 && actor.tier !== ActorTier.AList) {
      newTier = ActorTier.AList;
    } else if (actor.reputation >= 75 && actor.reputation < 90 && actor.tier === ActorTier.CList) {
      newTier = ActorTier.BList;
    } else if (actor.reputation >= 75 && actor.reputation < 90 && actor.tier === ActorTier.Newcomer) {
      newTier = ActorTier.CList;
    } else if (actor.reputation < 40 && actor.tier === ActorTier.AList) {
      newTier = ActorTier.BList;
    } else if (actor.reputation < 30 && actor.tier === ActorTier.BList) {
      newTier = ActorTier.CList;
    }

    if (newTier !== actor.tier) {
      // Adjust salary based on tier
      const salaryMultipliers: Record<ActorTier, number> = {
        [ActorTier.AList]: 2.5,
        [ActorTier.BList]: 1.5,
        [ActorTier.CList]: 1.0,
        [ActorTier.IndieDarling]: 0.8,
        [ActorTier.Newcomer]: 0.5,
      };

      const oldMultiplier = salaryMultipliers[actor.tier];
      const newMultiplier = salaryMultipliers[newTier];

      return {
        ...actor,
        tier: newTier,
        salary: Math.round(actor.salary * (newMultiplier / oldMultiplier)),
      };
    }

    return actor;
  });
}
