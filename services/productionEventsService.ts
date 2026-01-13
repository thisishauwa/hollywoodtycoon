// Using native crypto.randomUUID() instead of uuid package
import { ProjectStatus } from '../types';

export interface ProductionPhaseEvent {
  id: string;
  projectId: string;
  phase: ProjectStatus;
  type: 'positive' | 'negative' | 'neutral';
  name: string;
  description: string;
  varietyHeadline: string;
  impact: {
    qualityChange: number; // +/- points to film quality
    budgetChange: number; // +/- dollars
    delayMonths: number; // 0 = no delay, 1+ = delay
    actorSkillBonus?: number; // If an actor's performance improves
    actorQuits?: boolean; // If an actor leaves
  };
}

interface PhaseEventTemplate {
  type: 'positive' | 'negative';
  name: string;
  description: string;
  varietyHeadline: (filmTitle: string) => string;
  impact: ProductionPhaseEvent['impact'];
}

const PRE_PRODUCTION_EVENTS: PhaseEventTemplate[] = [
  // Positive
  {
    type: 'positive',
    name: 'Dream Cast Secured',
    description: 'A-list actor agrees to reduced rate',
    varietyHeadline: (title) => `CASTING COUP: "${title}" lands dream cast at bargain prices.`,
    impact: { qualityChange: 5, budgetChange: -50000, delayMonths: 0 },
  },
  {
    type: 'positive',
    name: 'Perfect Location',
    description: 'Ideal shooting location secured under budget',
    varietyHeadline: (title) => `LOCATION SCOUTING WIN: "${title}" finds picture-perfect setting.`,
    impact: { qualityChange: 3, budgetChange: -75000, delayMonths: 0 },
  },
  {
    type: 'positive',
    name: 'Script Polish',
    description: 'Writer delivers exceptional rewrites',
    varietyHeadline: (title) => `SCRIPT MAGIC: Final rewrites elevate "${title}" to new heights.`,
    impact: { qualityChange: 8, budgetChange: 0, delayMonths: 0 },
  },
  // Negative
  {
    type: 'negative',
    name: 'Casting Nightmare',
    description: 'Lead actor drops out',
    varietyHeadline: (title) => `CASTING CRISIS: Star exits "${title}" at last minute. Producers scramble.`,
    impact: { qualityChange: -15, budgetChange: 0, delayMonths: 1 },
  },
  {
    type: 'negative',
    name: 'Budget Overrun',
    description: 'Pre-production costs spiral',
    varietyHeadline: (title) => `BUDGET WOES: "${title}" over budget before cameras even roll.`,
    impact: { qualityChange: 0, budgetChange: 100000, delayMonths: 0 },
  },
  {
    type: 'negative',
    name: 'Script Issues',
    description: 'Major rewrites needed',
    varietyHeadline: (title) => `SCRIPT TROUBLE: "${title}" undergoes emergency rewrites. Production paused.`,
    impact: { qualityChange: -5, budgetChange: 0, delayMonths: 1 },
  },
];

const FILMING_EVENTS: PhaseEventTemplate[] = [
  // Positive
  {
    type: 'positive',
    name: 'On-Set Chemistry',
    description: 'Cast has incredible chemistry',
    varietyHeadline: (title) => `MAGIC ON SET: Cast of "${title}" delivers career-best performances.`,
    impact: { qualityChange: 10, budgetChange: 0, delayMonths: 0, actorSkillBonus: 3 },
  },
  {
    type: 'positive',
    name: 'Ahead of Schedule',
    description: 'Efficient shoot finishes early',
    varietyHeadline: (title) => `PRODUCTION MIRACLE: "${title}" wraps filming ahead of schedule, under budget.`,
    impact: { qualityChange: 0, budgetChange: -150000, delayMonths: 0 },
  },
  {
    type: 'positive',
    name: 'Breakthrough Performance',
    description: 'Actor delivers career-defining work',
    varietyHeadline: (title) => `OSCAR BUZZ: Insiders say "${title}" star just delivered the performance of a lifetime.`,
    impact: { qualityChange: 12, budgetChange: 0, delayMonths: 0, actorSkillBonus: 15 },
  },
  // Negative
  {
    type: 'negative',
    name: 'Actor Tantrum',
    description: 'Star causes on-set problems',
    varietyHeadline: (title) => `DRAMA ON SET: Behind-the-scenes tensions plague "${title}" production.`,
    impact: { qualityChange: -10, budgetChange: 100000, delayMonths: 0 },
  },
  {
    type: 'negative',
    name: 'Equipment Failure',
    description: 'Camera/lighting issues halt production',
    varietyHeadline: (title) => `TECHNICAL DISASTER: Equipment failures delay "${title}" shoot.`,
    impact: { qualityChange: 0, budgetChange: 75000, delayMonths: 0 },
  },
  {
    type: 'negative',
    name: 'Weather Delays',
    description: 'Bad weather halts production',
    varietyHeadline: (title) => `MOTHER NATURE WINS: "${title}" production stalled by severe weather.`,
    impact: { qualityChange: 0, budgetChange: 200000, delayMonths: 1 },
  },
  {
    type: 'negative',
    name: 'Actor Quits',
    description: 'Co-star walks off set',
    varietyHeadline: (title) => `WALKOUT: Actor abandons "${title}" mid-shoot. Producers in crisis mode.`,
    impact: { qualityChange: -20, budgetChange: 0, delayMonths: 0, actorQuits: true },
  },
];

const POST_PRODUCTION_EVENTS: PhaseEventTemplate[] = [
  // Positive
  {
    type: 'positive',
    name: 'Editor\'s Vision',
    description: 'Brilliant editing elevates material',
    varietyHeadline: (title) => `POST MAGIC: Editor transforms "${title}" into masterpiece.`,
    impact: { qualityChange: 15, budgetChange: 0, delayMonths: 0 },
  },
  {
    type: 'positive',
    name: 'VFX Excellence',
    description: 'Effects exceed expectations',
    varietyHeadline: (title) => `VISUAL FEAST: "${title}" effects wow industry insiders.`,
    impact: { qualityChange: 10, budgetChange: 0, delayMonths: 0 },
  },
  {
    type: 'positive',
    name: 'Perfect Score',
    description: 'Composer delivers masterpiece',
    varietyHeadline: (title) => `SCORE TRIUMPH: "${title}" soundtrack hailed as instant classic.`,
    impact: { qualityChange: 8, budgetChange: 0, delayMonths: 0 },
  },
  // Negative
  {
    type: 'negative',
    name: 'VFX Nightmare',
    description: 'Effects need complete redo',
    varietyHeadline: (title) => `VFX DISASTER: "${title}" forced to redo visual effects. Release delayed.`,
    impact: { qualityChange: 0, budgetChange: 300000, delayMonths: 2 },
  },
  {
    type: 'negative',
    name: 'Editing Disaster',
    description: 'Footage doesn\'t cut together',
    varietyHeadline: (title) => `EDITING HELL: "${title}" test screenings reveal major structural issues.`,
    impact: { qualityChange: -15, budgetChange: 0, delayMonths: 1 },
  },
  {
    type: 'negative',
    name: 'Test Screening Bomb',
    description: 'Audience hates early cut',
    varietyHeadline: (title) => `TEST AUDIENCE REVOLT: "${title}" scores lowest numbers of the year.`,
    impact: { qualityChange: -10, budgetChange: 0, delayMonths: 0 },
  },
];

const MARKETING_EVENTS: PhaseEventTemplate[] = [
  // Positive
  {
    type: 'positive',
    name: 'Viral Trailer',
    description: 'Marketing goes viral organically',
    varietyHeadline: (title) => `VIRAL HIT: "${title}" trailer breaks internet. Buzz through the roof.`,
    impact: { qualityChange: 0, budgetChange: 0, delayMonths: 0 }, // Buzz represented elsewhere
  },
  {
    type: 'positive',
    name: 'Festival Acceptance',
    description: 'Major festival selection',
    varietyHeadline: (title) => `FESTIVAL CROWN: "${title}" selected for prestigious film festival.`,
    impact: { qualityChange: 0, budgetChange: 0, delayMonths: 0 }, // Reputation boost
  },
  // Negative
  {
    type: 'negative',
    name: 'Marketing Flop',
    description: 'Campaign falls flat',
    varietyHeadline: (title) => `MARKETING MISFIRE: "${title}" campaign fails to connect with audiences.`,
    impact: { qualityChange: -5, budgetChange: 0, delayMonths: 0 },
  },
  {
    type: 'negative',
    name: 'Leaked Footage',
    description: 'Crucial scenes leak online',
    varietyHeadline: (title) => `LEAK NIGHTMARE: Key scenes from "${title}" surface online weeks before release.`,
    impact: { qualityChange: 0, budgetChange: 0, delayMonths: 0 }, // Revenue penalty
  },
];

const PHASE_EVENT_POOLS: Record<ProjectStatus, PhaseEventTemplate[]> = {
  [ProjectStatus.PreProduction]: PRE_PRODUCTION_EVENTS,
  [ProjectStatus.Filming]: FILMING_EVENTS,
  [ProjectStatus.PostProduction]: POST_PRODUCTION_EVENTS,
  [ProjectStatus.Marketing]: MARKETING_EVENTS,
  [ProjectStatus.Released]: [], // No events for released films
};

export function rollProductionEvent(
  projectId: string,
  filmTitle: string,
  phase: ProjectStatus
): ProductionPhaseEvent | null {
  const roll = Math.random();
  
  // 30% positive, 30% negative, 40% neutral (no event)
  if (roll > 0.6) return null; // No event
  
  const pool = PHASE_EVENT_POOLS[phase];
  if (!pool || pool.length === 0) return null;
  
  const isPositive = roll <= 0.3; // 0-0.3 = positive, 0.3-0.6 = negative
  const filtered = pool.filter(e => e.type === (isPositive ? 'positive' : 'negative'));
  
  if (filtered.length === 0) return null;
  
  const template = filtered[Math.floor(Math.random() * filtered.length)];
  
  return {
    id: crypto.randomUUID(),
    projectId,
    phase,
    type: template.type,
    name: template.name,
    description: template.description,
    varietyHeadline: template.varietyHeadline(filmTitle),
    impact: { ...template.impact },
  };
}
