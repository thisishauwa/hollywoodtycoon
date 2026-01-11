import { Movie, ProjectStatus, ProductionEvent, Genre, Actor } from "../types";

// Phase duration in months (base values)
export const PHASE_DURATIONS = {
  [ProjectStatus.PreProduction]: 1,
  [ProjectStatus.Filming]: 2,
  [ProjectStatus.PostProduction]: 2,
  [ProjectStatus.Marketing]: 1,
  [ProjectStatus.Released]: 0,
};

// Progress per month for each phase (to reach 100% in base duration)
export const PHASE_PROGRESS_PER_MONTH = {
  [ProjectStatus.PreProduction]: 100, // 1 month
  [ProjectStatus.Filming]: 50, // 2 months
  [ProjectStatus.PostProduction]: 50, // 2 months
  [ProjectStatus.Marketing]: 100, // 1 month
  [ProjectStatus.Released]: 0,
};

// Overall progress weight for each phase
export const PHASE_WEIGHTS = {
  [ProjectStatus.PreProduction]: 10, // 10% of total
  [ProjectStatus.Filming]: 50, // 50% of total
  [ProjectStatus.PostProduction]: 30, // 30% of total
  [ProjectStatus.Marketing]: 10, // 10% of total
  [ProjectStatus.Released]: 0,
};

// Get next phase
export const getNextPhase = (current: ProjectStatus): ProjectStatus => {
  const phases = [
    ProjectStatus.PreProduction,
    ProjectStatus.Filming,
    ProjectStatus.PostProduction,
    ProjectStatus.Marketing,
    ProjectStatus.Released,
  ];
  const idx = phases.indexOf(current);
  return phases[Math.min(idx + 1, phases.length - 1)];
};

// Calculate overall progress from phase and phase progress
export const calculateOverallProgress = (
  status: ProjectStatus,
  phaseProgress: number
): number => {
  const phases = [
    ProjectStatus.PreProduction,
    ProjectStatus.Filming,
    ProjectStatus.PostProduction,
    ProjectStatus.Marketing,
  ];
  const idx = phases.indexOf(status);
  if (idx === -1) return 100; // Released

  // Sum up completed phases
  let total = 0;
  for (let i = 0; i < idx; i++) {
    total += PHASE_WEIGHTS[phases[i]];
  }
  // Add current phase progress
  total += (phaseProgress / 100) * PHASE_WEIGHTS[status];
  return Math.min(100, Math.round(total));
};

// Production events by phase
const PRODUCTION_EVENTS: Record<ProjectStatus, Array<Omit<ProductionEvent, "id" | "month" | "phase">>> = {
  [ProjectStatus.PreProduction]: [
    {
      type: "positive",
      title: "Script Polish",
      description: "Last-minute script revisions improved dialogue significantly.",
      qualityImpact: 5,
      budgetImpact: 0,
      delayMonths: 0,
    },
    {
      type: "positive",
      title: "Location Secured",
      description: "Secured perfect filming location under budget.",
      qualityImpact: 3,
      budgetImpact: -50000,
      delayMonths: 0,
    },
    {
      type: "negative",
      title: "Set Construction Delays",
      description: "Custom sets taking longer than expected to build.",
      qualityImpact: 0,
      budgetImpact: 100000,
      delayMonths: 0,
    },
    {
      type: "negative",
      title: "Casting Concerns",
      description: "Studio executives worried about lead casting choice.",
      qualityImpact: -3,
      budgetImpact: 0,
      delayMonths: 0,
    },
    {
      type: "neutral",
      title: "Table Read Success",
      description: "Cast chemistry evident during first table read.",
      qualityImpact: 2,
      budgetImpact: 0,
      delayMonths: 0,
    },
  ],
  [ProjectStatus.Filming]: [
    {
      type: "positive",
      title: "On-Set Magic",
      description: "Cast delivers inspired performances during key scenes.",
      qualityImpact: 8,
      budgetImpact: 0,
      delayMonths: 0,
    },
    {
      type: "positive",
      title: "Ahead of Schedule",
      description: "Director wrapping scenes faster than planned.",
      qualityImpact: 2,
      budgetImpact: -150000,
      delayMonths: 0,
    },
    {
      type: "negative",
      title: "Weather Delays",
      description: "Outdoor shoots delayed due to unexpected weather.",
      qualityImpact: 0,
      budgetImpact: 200000,
      delayMonths: 1,
    },
    {
      type: "negative",
      title: "Actor Injury",
      description: "Lead actor suffered minor injury during stunt work.",
      qualityImpact: -2,
      budgetImpact: 300000,
      delayMonths: 1,
    },
    {
      type: "negative",
      title: "Creative Differences",
      description: "Director and producer clash over creative direction.",
      qualityImpact: -5,
      budgetImpact: 0,
      delayMonths: 0,
    },
    {
      type: "positive",
      title: "Improvised Scene",
      description: "Actor improvised a scene that tested through the roof.",
      qualityImpact: 6,
      budgetImpact: 0,
      delayMonths: 0,
    },
    {
      type: "negative",
      title: "Equipment Failure",
      description: "Camera equipment malfunction causes reshoot.",
      qualityImpact: -1,
      budgetImpact: 100000,
      delayMonths: 0,
    },
    {
      type: "neutral",
      title: "Set Visit",
      description: "Press set visit generates early buzz.",
      qualityImpact: 0,
      budgetImpact: 0,
      delayMonths: 0,
    },
  ],
  [ProjectStatus.PostProduction]: [
    {
      type: "positive",
      title: "Editor's Cut Shines",
      description: "First assembly cut exceeds expectations.",
      qualityImpact: 5,
      budgetImpact: 0,
      delayMonths: 0,
    },
    {
      type: "positive",
      title: "Score Elevates",
      description: "Composer delivers exceptional soundtrack.",
      qualityImpact: 7,
      budgetImpact: 0,
      delayMonths: 0,
    },
    {
      type: "negative",
      title: "VFX Overruns",
      description: "Visual effects requiring more work than budgeted.",
      qualityImpact: 0,
      budgetImpact: 500000,
      delayMonths: 1,
    },
    {
      type: "negative",
      title: "Test Screening Concerns",
      description: "Focus group responses suggest third act needs work.",
      qualityImpact: -4,
      budgetImpact: 200000,
      delayMonths: 1,
    },
    {
      type: "positive",
      title: "Sound Design Breakthrough",
      description: "Sound team creates immersive audio experience.",
      qualityImpact: 4,
      budgetImpact: 0,
      delayMonths: 0,
    },
    {
      type: "negative",
      title: "Reshoots Required",
      description: "Test audiences confused by plot point - reshoots needed.",
      qualityImpact: 2, // Reshoots can improve quality
      budgetImpact: 800000,
      delayMonths: 1,
    },
  ],
  [ProjectStatus.Marketing]: [
    {
      type: "positive",
      title: "Trailer Goes Viral",
      description: "Marketing team creates trailer that captures attention online.",
      qualityImpact: 0,
      budgetImpact: -100000, // Saved on additional marketing
      delayMonths: 0,
    },
    {
      type: "positive",
      title: "Festival Buzz",
      description: "Early festival screenings generate awards talk.",
      qualityImpact: 5,
      budgetImpact: 0,
      delayMonths: 0,
    },
    {
      type: "negative",
      title: "Leaked Footage",
      description: "Key scene leaked online dampens trailer impact.",
      qualityImpact: 0,
      budgetImpact: 150000,
      delayMonths: 0,
    },
    {
      type: "positive",
      title: "Star Power",
      description: "Lead actor's talk show appearances boost awareness.",
      qualityImpact: 0,
      budgetImpact: -50000,
      delayMonths: 0,
    },
    {
      type: "negative",
      title: "Crowded Release",
      description: "Major competitor announced same release date.",
      qualityImpact: 0,
      budgetImpact: 200000, // Need more marketing to compete
      delayMonths: 0,
    },
  ],
  [ProjectStatus.Released]: [],
};

// Generate a random production event for current phase
export const generateProductionEvent = (
  movie: Movie,
  currentMonth: number
): ProductionEvent | null => {
  // 30% chance of an event each month
  if (Math.random() > 0.30) return null;

  const phaseEvents = PRODUCTION_EVENTS[movie.status];
  if (!phaseEvents || phaseEvents.length === 0) return null;

  const event = phaseEvents[Math.floor(Math.random() * phaseEvents.length)];

  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    month: currentMonth,
    phase: movie.status,
    ...event,
  };
};

// Get phase display info
export const getPhaseInfo = (status: ProjectStatus) => {
  const info: Record<ProjectStatus, { icon: string; color: string; description: string }> = {
    [ProjectStatus.PreProduction]: {
      icon: "📋",
      color: "#8b5cf6", // purple
      description: "Script finalization, casting confirmation, set design",
    },
    [ProjectStatus.Filming]: {
      icon: "🎬",
      color: "#ef4444", // red
      description: "Principal photography in progress",
    },
    [ProjectStatus.PostProduction]: {
      icon: "🎞️",
      color: "#f59e0b", // amber
      description: "Editing, VFX, sound design, scoring",
    },
    [ProjectStatus.Marketing]: {
      icon: "📺",
      color: "#3b82f6", // blue
      description: "Trailer release, press tour, premiere events",
    },
    [ProjectStatus.Released]: {
      icon: "🎉",
      color: "#22c55e", // green
      description: "Now playing in theaters",
    },
  };
  return info[status];
};

// Process production advancement for a movie
export const advanceProduction = (
  movie: Movie,
  currentMonth: number
): { movie: Movie; event: ProductionEvent | null; phaseChanged: boolean; released: boolean } => {
  if (movie.status === ProjectStatus.Released) {
    return { movie, event: null, phaseChanged: false, released: false };
  }

  const updatedMovie = { ...movie };
  let phaseChanged = false;
  let released = false;

  // Generate potential event
  const event = generateProductionEvent(movie, currentMonth);

  // Apply event effects
  if (event) {
    updatedMovie.productionEvents = [...(updatedMovie.productionEvents || []), event];
    updatedMovie.quality = Math.max(0, Math.min(100, updatedMovie.quality + event.qualityImpact));
    updatedMovie.currentBudgetSpent = (updatedMovie.currentBudgetSpent || 0) + event.budgetImpact;

    // Handle delays
    if (event.delayMonths > 0) {
      if (updatedMovie.estimatedReleaseMonth) {
        updatedMovie.estimatedReleaseMonth += event.delayMonths;
        if (updatedMovie.estimatedReleaseMonth > 12) {
          updatedMovie.estimatedReleaseMonth -= 12;
          updatedMovie.estimatedReleaseYear = (updatedMovie.estimatedReleaseYear || 0) + 1;
        }
      }
    }
  }

  // Advance phase progress
  const progressGain = PHASE_PROGRESS_PER_MONTH[movie.status] + Math.random() * 10 - 5;
  updatedMovie.phaseProgress = Math.min(100, (updatedMovie.phaseProgress || 0) + progressGain);

  // Check for phase completion
  if (updatedMovie.phaseProgress >= 100) {
    updatedMovie.phaseProgress = 0;
    const nextPhase = getNextPhase(movie.status);
    updatedMovie.status = nextPhase;
    phaseChanged = true;

    if (nextPhase === ProjectStatus.Released) {
      released = true;
      updatedMovie.releaseMonth = currentMonth;
    }
  }

  // Update overall progress
  updatedMovie.progress = calculateOverallProgress(updatedMovie.status, updatedMovie.phaseProgress);

  return { movie: updatedMovie, event, phaseChanged, released };
};

// Calculate estimated release date
export const calculateEstimatedRelease = (
  startMonth: number,
  startYear: number
): { month: number; year: number } => {
  // Total duration: ~6 months (1 + 2 + 2 + 1)
  const totalMonths = Object.values(PHASE_DURATIONS).reduce((a, b) => a + b, 0);
  let releaseMonth = startMonth + totalMonths;
  let releaseYear = startYear;

  while (releaseMonth > 12) {
    releaseMonth -= 12;
    releaseYear++;
  }

  return { month: releaseMonth, year: releaseYear };
};
