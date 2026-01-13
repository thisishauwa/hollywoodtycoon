import { MonthlyEvent } from './monthlyEventsService';
import { ProductionPhaseEvent } from './productionEventsService';
import { ActorLifecycleEvent } from './actorLifecycleEventsService';

export interface FormattedEvent {
  id: string;
  category: 'user_action' | 'market' | 'production' | 'actor';
  headline: string;
  description: string;
  month: number;
  year: number;
  type: 'good' | 'bad' | 'neutral' | 'info';
  priority: number; // 0 = normal, 1 = important, 2 = critical
}

// Format user action events
export function formatUserActionEvent(
  action: string,
  details: Record<string, any>,
  month: number,
  year: number
): FormattedEvent {
  const formatters: Record<string, (d: any) => { headline: string; description: string; type: FormattedEvent['type'] }> = {
    script_purchase: (d) => ({
      headline: `ACQUISITION: Your studio acquires rights to "${d.scriptTitle}".`,
      description: `Deal valued at $${(d.amount || 0).toLocaleString()}. Production expected to begin soon.`,
      type: 'info',
    }),
    actor_hired: (d) => ({
      headline: `SIGNING: ${d.actorName} joins your studio roster.`,
      description: `Contract worth $${(d.salary || 0).toLocaleString()} annually. Industry reacts to power move.`,
      type: 'info',
    }),
    film_greenlit: (d) => ({
      headline: `GREENLIGHT: "${d.filmTitle}" officially enters production.`,
      description: `Your studio commits $${(d.budget || 0).toLocaleString()} to ambitious new project.`,
      type: 'info',
    }),
    film_released: (d) => ({
      headline: `BOX OFFICE: "${d.filmTitle}" opens in theaters nationwide.`,
      description: `First weekend estimates show $${(d.revenue || 0).toLocaleString()} in ticket sales.`,
      type: d.performance === 'hit' ? 'good' : d.performance === 'flop' ? 'bad' : 'neutral',
    }),
    contract_renewed: (d) => ({
      headline: `RE-SIGNED: ${d.actorName} extends contract with your studio.`,
      description: `Multi-year deal keeps star in stable. Terms undisclosed.`,
      type: 'good',
    }),
  };

  const formatter = formatters[action];
  if (!formatter) {
    return {
      id: details.id || `event-${Date.now()}`,
      category: 'user_action',
      headline: `STUDIO NEWS: ${action.replace(/_/g, ' ').toUpperCase()}`,
      description: JSON.stringify(details),
      month,
      year,
      type: 'info',
      priority: 0,
    };
  }

  const { headline, description, type } = formatter(details);
  
  return {
    id: details.id || `event-${Date.now()}`,
    category: 'user_action',
    headline,
    description,
    month,
    year,
    type,
    priority: 1,
  };
}

// Format monthly market events
export function formatMonthlyEvent(event: MonthlyEvent, month: number, year: number): FormattedEvent {
  return {
    id: event.id,
    category: 'market',
    headline: event.varietyHeadline,
    description: event.description,
    month,
    year,
    type: event.type,
    priority: 1,
  };
}

// Format production phase events
export function formatProductionEvent(event: ProductionPhaseEvent, month: number, year: number): FormattedEvent {
  return {
    id: event.id,
    category: 'production',
    headline: event.varietyHeadline,
    description: event.description,
    month,
    year,
    type: event.type === 'positive' ? 'good' : event.type === 'negative' ? 'bad' : 'neutral',
    priority: event.impact.actorQuits || Math.abs(event.impact.qualityChange) > 10 ? 2 : 1,
  };
}

// Format actor lifecycle events
export function formatActorLifecycleEvent(event: ActorLifecycleEvent, month: number, year: number): FormattedEvent {
  const typeMapping: Record<string, FormattedEvent['type']> = {
    marriage: 'good',
    divorce: 'bad',
    scandal: 'bad',
    death: 'bad',
    retirement: 'neutral',
    comeback: 'good',
    award_win: 'good',
    career_slump: 'bad',
  };

  const priorityMapping: Record<string, number> = {
    death: 2,
    award_win: 2,
    scandal: 2,
    marriage: 1,
    divorce: 1,
    comeback: 1,
    career_slump: 1,
    retirement: 1,
  };

  return {
    id: event.id,
    category: 'actor',
    headline: event.varietyHeadline,
    description: event.description,
    month,
    year,
    type: typeMapping[event.type] || 'neutral',
    priority: priorityMapping[event.type] || 0,
  };
}

// Master function to convert all event types
export function formatEventForVariety(
  event: any,
  eventCategory: FormattedEvent['category'],
  month: number,
  year: number
): FormattedEvent {
  switch (eventCategory) {
    case 'market':
      return formatMonthlyEvent(event as MonthlyEvent, month, year);
    case 'production':
      return formatProductionEvent(event as ProductionPhaseEvent, month, year);
    case 'actor':
      return formatActorLifecycleEvent(event as ActorLifecycleEvent, month, year);
    case 'user_action':
      return formatUserActionEvent(event.action, event.details, month, year);
    default:
      return {
        id: event.id || `generic-${Date.now()}`,
        category: 'user_action',
        headline: 'INDUSTRY NEWS',
        description: 'Event details unavailable',
        month,
        year,
        type: 'info',
        priority: 0,
      };
  }
}
