import React, { useState, useMemo, useEffect, useRef } from "react";
import { GameState, ProjectStatus, StudioMessage, GameEvent } from "./types";
import {
  SEED_SCRIPTS,
  INITIAL_BALANCE,
  START_MONTH,
  START_YEAR,
  RIVAL_STUDIOS,
  applyReputationChange,
} from "./constants";
import { useActors } from "./hooks/useActors";
import { calculateEstimatedRelease } from "./services/productionService";
import {
  WindowFrame,
  RetroTab,
  StatusBar,
  RetroButton,
  DesktopIcon,
  ExplorerToolbar,
} from "./components/RetroUI";
import { Dashboard } from "./components/Dashboard";
import { ScriptMarket } from "./components/ScriptMarket";
import { ActorDb } from "./components/ActorDb";
import { ProductionWizard } from "./components/Production";
import { ReleasedFilms } from "./components/Releases";
import { Awards } from "./components/Awards";
import { MagazineWindow } from "./components/MagazineWindow";
import { StudioNetwork } from "./components/StudioNetwork";
import { MonthTimeline } from "./components/MonthTimeline";
import { GameTermTooltip } from "./components/Tooltip";
import { useGlobalOwnedScripts } from "./hooks/useGlobalOwnedScripts";
import { useScripts } from "./hooks/useScripts";
// ActorChat removed - studio chat is in Messenger
import { StartMenu } from "./components/StartMenu";
import { AuthScreen } from "./components/AuthScreen";
// WindowsXPLoader removed - no longer blocking app with loading screen
import { ScriptMarketMultiplayer } from "./components/ScriptMarketMultiplayer";
import { useAuth } from "./contexts/AuthContext";
import { useStudios } from "./hooks/useStudios";
import { useGameState } from "./hooks/useGameState";
import { useOwnedScripts } from "./hooks/useOwnedScripts";
import { useEvents } from "./hooks/useEvents";
import { useGlobalClockContext } from "./contexts/GlobalClockContext";
import { useProjects } from "./hooks/useProjects";
import { useAwards } from "./hooks/useAwards";
import { supabase } from "./lib/supabase";
import { ToastContainer } from "./contexts/ToastContext";
import { useGameNotifications } from "./hooks/useGameNotifications";
import { useSound } from "./contexts/SoundContext";


const uuid = () =>
  "id-" +
  Math.random().toString(36).substring(2, 9) +
  "-" +
  Date.now().toString(36);

interface WindowState {
  id: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
}

// Mobile detection component - separate to avoid hook issues
const MobileBlocker: React.FC = () => (
  <div className="fixed inset-0 bg-[#245edb] z-[9999] flex flex-col items-center justify-center p-8 text-center font-sans select-none">
    <img
      src="/images/My computer.ico"
      alt="My Computer"
      className="w-24 h-24 mb-6 drop-shadow-md"
    />
    <h1 className="text-white text-2xl font-bold mb-3 drop-shadow-sm" style={{ fontFamily: 'Tahoma, sans-serif' }}>
      Desktop Experience Only
    </h1>
    <p className="text-white text-sm max-w-xs leading-relaxed opacity-90" style={{ fontFamily: 'Tahoma, sans-serif' }}>
      Hollywood Tycoon XP uses a sophisticated window management system designed for desktop computers.
    </p>
    <div className="mt-8 bg-white/10 rounded px-4 py-2 border border-white/20">
      <p className="text-white/80 text-xs">Please return on a PC or Mac.</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const { user, profile, loading, signIn, signUp, signOut } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Mobile detection - check immediately on mount (before useState default)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Multiplayer hooks
  const { gameState: multiplayerGameState, loading: gameStateLoading, updateBalance } =
    useGameState();
  const { ownedScripts: multiplayerOwnedScripts, loading: ownedScriptsLoading } = useOwnedScripts();
  const { events: multiplayerEvents } = useEvents();
  const { clock, getMonthName } = useGlobalClockContext();
  const { studios: realStudios, loading: studiosLoading } = useStudios(
    user?.id,
    clock?.year
  );
  const { projects: dbProjects, updateProject, createProject } = useProjects();
  const { actors: dbActors, loading: actorsLoading } = useActors();
  const { ceremonies: dbCeremonies, createCeremony, updateCeremony } = useAwards();
  
  // Game notifications
  const notifications = useGameNotifications();
  const { playNotificationSound } = useSound();
  // Track last processed month/year to prevent duplicate events
  const lastProcessedTime = useRef<{ month: number; year: number } | null>(
    null
  );
  // Separate ref for production advancement
  const lastProductionProcessedTime = useRef<{ month: number; year: number } | null>(
    null
  );
  // Refs for tracking script acquisitions
  const prevOwnedScriptIds = useRef<Set<string>>(new Set());
  const scriptsInitialized = useRef(false);

  const [gameState, setGameState] = useState<GameState>({
    month: START_MONTH,
    year: START_YEAR,
    balance: INITIAL_BALANCE,
    reputation: profile?.industry_clout || 30,
    actors: [], // Will be populated from database
    marketScripts: SEED_SCRIPTS,
    ownedScripts: [],
    projects: [],
    rivals: [], // Will be populated from realStudios
    events: [],
    playerName: profile?.username || "Studio",
    studioName: profile?.username || "Studio",
    messages: [],
    awardsCeremonies: [],
  });

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "scripts" | "actors" | "releases" | "awards"
  >("dashboard");
  const [showProductionWizard, setShowProductionWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showStartMenu, setShowStartMenu] = useState(false);

  // Window Management State - MUST be before any conditional returns
  const [windows, setWindows] = useState<Record<string, WindowState>>({
    manager: { id: "manager", isOpen: true, isMinimized: false, zIndex: 10 },
    news: { id: "news", isOpen: false, isMinimized: false, zIndex: 11 },
    messenger: {
      id: "messenger",
      isOpen: false,
      isMinimized: false,
      zIndex: 12,
    },
  });
  const [activeWindowId, setActiveWindowId] = useState<string>("manager");
  const [topZ, setTopZ] = useState(20);

  // Taskbar items - MUST be before conditional returns
  const taskbarItems = useMemo(() => {
    return Object.values(windows)
      .filter((w: WindowState) => w.isOpen)
      .map((w: WindowState) => ({
        id: w.id,
        title:
          w.id === "manager"
            ? "Studio Manager"
            : w.id === "news"
            ? "Variety News"
            : "Messenger",
        icon:
          w.id === "manager"
            ? "/images/My computer.ico"
            : w.id === "news"
            ? "/images/internetexplorer.svg"
            : "/images/mail:message.svg",
        isMinimized: w.isMinimized,
        isActive: activeWindowId === w.id,
      }));
  }, [windows, activeWindowId]);

  // Update rivals when real studios are loaded
  useEffect(() => {
    if (realStudios.length > 0) {
      setGameState((prev) => ({
        ...prev,
        rivals: realStudios,
      }));
    }
  }, [realStudios]);

  // Sync projects from DB to game state
  useEffect(() => {
    if (dbProjects) {
      setGameState((prev) => ({
        ...prev,
        projects: dbProjects,
      }));
    }
  }, [dbProjects]);

  // Update reputation when profile changes
  useEffect(() => {
    if (profile) {
      setGameState((prev) => ({
        ...prev,
        reputation: profile.industry_clout,
        playerName: profile.username,
        studioName: profile.username,
      }));
    }
  }, [profile]);

  // Sync owned scripts from Supabase to gameState
  useEffect(() => {
    if (multiplayerOwnedScripts.length > 0) {
      const mappedScripts = multiplayerOwnedScripts.map((s) => ({
        id: s.script_id,
        title: s.title,
        genre: s.genre as any,
        tagline: s.tagline,
        quality: s.quality,
        complexity: s.complexity,
        baseCost: s.purchase_price,
        currentBid: s.purchase_price,
        highBidderId: "player",
        description: s.description,
        requiredCast: s.required_cast,
        tone: s.tone,
      }));
      setGameState((prev) => ({
        ...prev,
        ownedScripts: mappedScripts,
      }));
    }
  }, [multiplayerOwnedScripts]);

  // Sync projects from Supabase to gameState
  useEffect(() => {
    if (dbProjects.length > 0) {
      setGameState((prev) => ({
        ...prev,
        projects: dbProjects,
      }));
    }
  }, [dbProjects]);

  const { scripts: allScripts, loading: scriptsLoading } = useScripts();
  const { globalOwnedScriptIds, loading: globalScriptsLoading } = useGlobalOwnedScripts();
  
  // Filter out ANY script that is in the global owned set
  const marketScripts = allScripts.filter(
    (s) => !globalOwnedScriptIds.has(s.id)
  );

  // Sync actors from Supabase to gameState - only on initial load
  const actorsInitialized = useRef(false);
  useEffect(() => {
    if (dbActors.length > 0 && !actorsInitialized.current) {
      actorsInitialized.current = true;
      setGameState((prev) => ({
        ...prev,
        actors: dbActors,
      }));
    }
  }, [dbActors]);

  // Sync events from Supabase to gameState
  useEffect(() => {
    if (multiplayerEvents.length > 0) {
      setGameState((prev) => ({
        ...prev,
        events: multiplayerEvents,
      }));
    }
  }, [multiplayerEvents]);

  // Sync multiplayerGameState (with merged clock) to local gameState
  // Only update when actual values change to avoid infinite loop
  useEffect(() => {
    if (multiplayerGameState) {
      setGameState((prev) => {
        // Only update if values actually changed
        if (
          prev.balance !== multiplayerGameState.balance ||
          prev.reputation !== multiplayerGameState.reputation ||
          prev.month !== multiplayerGameState.month ||
          prev.year !== multiplayerGameState.year
        ) {
          return {
            ...prev,
            balance: multiplayerGameState.balance,
            reputation: multiplayerGameState.reputation,
            month: multiplayerGameState.month,
            year: multiplayerGameState.year,
          };
        }
        return prev;
      });
    }
  }, [
    multiplayerGameState?.balance,
    multiplayerGameState?.reputation,
    multiplayerGameState?.month,
    multiplayerGameState?.year,
  ]);

  // Sync global clock to gameState.month/year
  useEffect(() => {
    if (clock) {
      setGameState((prev) => {
        // Only update if actually changed to prevent unnecessary re-renders
        if (prev.month !== clock.month || prev.year !== clock.year) {
          console.log(`[Clock Sync] Updating gameState: ${prev.month}/${prev.year} -> ${clock.month}/${clock.year}`);
          return {
            ...prev,
            month: clock.month,
            year: clock.year,
          };
        }
        return prev;
      });
    }
  }, [clock]); // Depend on clock object itself, not just properties

  // Auto-close expired auctions every 30 seconds
  useEffect(() => {
    if (!user) return;

    const closeExpiredAuctions = async () => {
      const { error } = await supabase.rpc("close_expired_auctions");
      if (error) {
        console.error("Error closing auctions:", error);
      }
    };

    // Run immediately on mount
    closeExpiredAuctions();

    // Then every 30 seconds
    const interval = setInterval(closeExpiredAuctions, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Auto-advance global game clock (checks every 5 minutes)
  useEffect(() => {
    if (!user) return;

    const checkAndAdvanceClock = async () => {
      try {
        const { data, error } = await supabase.rpc("advance_global_clock");
        if (error) {
          // Function might not exist yet - that's okay
          if (!error.message.includes("does not exist")) {
            console.error("Error advancing clock:", error);
          }
          return;
        }

        const result = data?.[0];
        if (result?.advanced) {
          console.log(
            `Game clock advanced to ${result.new_month}/${result.new_year}`
          );
        }
      } catch (err) {
        console.error("Clock check failed:", err);
      }
    };

    // Auto-advance is now handled server-side to prevent client-sync issues
    // const interval = setInterval(checkAndAdvanceClock, 30 * 1000);
    // return () => clearInterval(interval);
  }, [user]);

  // Track if this is the initial load (to skip event generation on refresh)
  const isInitialClockLoad = useRef(true);

  // Process actor lifecycle events when global clock changes
  useEffect(() => {
    if (!clock || !user) return;

    // On initial page load, just record the current time without generating events
    // This prevents duplicate/confusing events on refresh
    if (isInitialClockLoad.current) {
      console.log(`[WorldEvents] Initial load - recording clock at ${clock.month}/${clock.year}, skipping event generation`);
      lastProcessedTime.current = {
        month: clock.month,
        year: clock.year,
      };
      isInitialClockLoad.current = false;
      return;
    }

    // Skip if this month/year was already processed
    if (
      lastProcessedTime.current &&
      lastProcessedTime.current.month === clock.month &&
      lastProcessedTime.current.year === clock.year
    ) {
      return;
    }

    console.log(`[WorldEvents] Clock advanced from ${lastProcessedTime.current?.month}/${lastProcessedTime.current?.year} to ${clock.month}/${clock.year} - generating events`);

    console.log(`[WorldEvents] Clock advanced from ${lastProcessedTime.current?.month}/${lastProcessedTime.current?.year} to ${clock.month}/${clock.year} - generating events`);

    const processWorldEventsForMonth = async (targetMonth: number, targetYear: number) => {
      try {
        console.log(`[WorldEvents] Processing events for ${targetMonth}/${targetYear}`);
        
        // Import NEW event services
        const { generateMonthlyEvents, applyMonthlyEventImpacts } = await import(
          "./services/monthlyEventsService"
        );
        const { generateActorLifecycleEvents, applyActorLifecycleEvent, tickActorCooldowns } = await import(
          "./services/actorLifecycleEventsService"
        );
        const { formatEventForVariety } = await import(
          "./services/eventFormattingService"
        );
        const { 
           shouldAnnounceNominations, 
           generateAwardsCeremony, 
           shouldHoldCeremony, 
           determineWinners, 
           applyAwardEffects 
        } = await import("./services/awardsService");

        let newEvents: any[] = [];
        let balanceChange = 0;
        let reputationChange = 0;

        // 1. Check if global events already exist for this month (Leader Election / Deduplication)
        const { count: existingGlobalEventsCount } = await supabase
           .from("game_events")
           .select("*", { count: 'exact', head: true })
           .eq("month", targetMonth)
           .eq("year", targetYear)
           .eq("is_global", true);

        let allMarketEvents: any[] = [];
        let shouldInsertGlobalEvents = false;

        if (existingGlobalEventsCount && existingGlobalEventsCount > 0) {
            console.log(`[WorldEvents] Global events already exist for ${targetMonth}/${targetYear}. Skipping generation.`);
            // Global events already exist - don't generate or insert new ones
            shouldInsertGlobalEvents = false;
        } else {
             // We are the "Leader" - first client to reach this month generates global events
            shouldInsertGlobalEvents = true;
            const { good: goodMarketEvents, bad: badMarketEvents } = generateMonthlyEvents(targetMonth, targetYear);
            allMarketEvents = [...goodMarketEvents, ...badMarketEvents];
        }
        
        // Apply market event impacts
        const marketImpacts = applyMonthlyEventImpacts(
          allMarketEvents,
          gameState.balance,
          gameState.reputation
        );
        
        balanceChange += (marketImpacts.newBalance - gameState.balance);
        reputationChange += (marketImpacts.newReputation - gameState.reputation);
        
        // Store multipliers for this month (would be used in production/release calculations)
        // TODO: Apply these to ongoing productions and releases
        console.log('[Market Multipliers]', {
          revenue: marketImpacts.revenueMultiplier,
          production: marketImpacts.productionCostMultiplier,
          hiring: marketImpacts.hiringCostMultiplier,
        });
        
        // Format market events for display
        for (const event of allMarketEvents) {
          const formatted = formatEventForVariety(event, 'market', targetMonth, targetYear);
          newEvents.push({
            id: formatted.id,
            month: targetMonth,
            type: formatted.type.toUpperCase(),
            message: formatted.headline,
            read: false,
            isGlobal: true, // Mark as global for DB insert
          });
        }

        // 2. ACTOR LIFECYCLE EVENTS - only generate if we're the leader (shouldInsertGlobalEvents)
        // Limit: 3 events total per month (market + lifecycle combined)
        const remainingSlots = Math.max(0, 3 - newEvents.length);
        const lifecycleEvents = shouldInsertGlobalEvents
          ? generateActorLifecycleEvents(gameState.actors, remainingSlots)
          : [];
        let updatedActors = [...gameState.actors];
        
        for (const event of lifecycleEvents) {
          // Find and update the actor
          const actorIndex = updatedActors.findIndex(a => a.id === event.actorId);
          if (actorIndex !== -1) {
            updatedActors[actorIndex] = applyActorLifecycleEvent(updatedActors[actorIndex], event);
            
            // CRITICAL: Persist actor changes to DB (Death, Marriage, etc.)
            // Only the 'Leader' (who generates the events) performs this write
            if (shouldInsertGlobalEvents) {
                const updated = updatedActors[actorIndex];
                // We don't await this inside the loop to avoid blocking, but we catch errors
                supabase.from('actors').update({
                    status: updated.status,
                    reputation: updated.reputation,
                    skill: updated.skill,
                    salary: updated.salary,
                    tier: updated.tier,
                    // Note: If you add more tracked fields like 'gossip' or 'partnerId', add them here
                    // stored in the 'metadata' or specific columns if they exist
                }).eq('id', updated.id).then(({ error }) => {
                    if (error) console.error(`[WorldEvents] Failed to persist actor update for ${updated.name}:`, error);
                });
            }

            // Format for Variety
            const formatted = formatEventForVariety(event, 'actor', targetMonth, targetYear);
            newEvents.push({
              id: formatted.id,
              month: targetMonth,
              type: formatted.type.toUpperCase(),
              message: formatted.headline,
              read: false,
              isGlobal: true, // Mark as global for DB insert
            });
          }
        }
        
        // Tick actor cooldowns for next month
        tickActorCooldowns(updatedActors.map(a => a.id));

        // 3. AWARDS SEASON
        // Jan: Nominations
        if (shouldAnnounceNominations(targetMonth)) {
           const prevYear = targetYear - 1;
           // Only run if the previous year was actually playable/valid (>= START_YEAR)
           if (prevYear >= START_YEAR && !dbCeremonies.find(c => c.year === prevYear)) {
               const ceremony = generateAwardsCeremony(gameState, prevYear);
               if (ceremony) {
                   // Save to database
                   await createCeremony(ceremony);
                   // Get Best Picture nominees for the headline
                   const bestPicNoms = ceremony.nominations
                       .filter(n => n.category === 'Best Picture')
                       .map(n => `"${n.movieTitle}"`)
                       .slice(0, 3)
                       .join(', ');
                   newEvents.push({
                       id: uuid(),
                       month: targetMonth,
                       type: 'INFO',
                       message: `AWARDS: ${prevYear} Academy Award nominations announced! Best Picture nominees include: ${bestPicNoms}...`,
                       read: false,
                       isGlobal: true, // Visible to all players
                   });
               }
           }
        }

        // Feb: Ceremony
        if (shouldHoldCeremony(targetMonth)) {
            const prevYear = targetYear - 1;
            const ceremony = dbCeremonies.find(c => c.year === prevYear && !c.completed);
            if (ceremony) {
                const completed = determineWinners(ceremony);
                
                // Update database with winners
                await updateCeremony(completed.id, { 
                    completed: true, 
                    nominations: completed.nominations 
                });
                
                // Apply effects (async now to persist actor changes)
                const { events: awardEvents, updatedState: effectState } = await applyAwardEffects(gameState, completed, supabase);
                newEvents.push(...awardEvents);
                if (effectState.reputation) {
                    reputationChange += (effectState.reputation - gameState.reputation);
                }
            }
        }


        // 4. NO MORE RIVAL ACTIVITY OR RANDOM AI GOSSIP
        // Pure, trackable events only!


        // Separate global events (market, lifecycle) from player-specific events (awards)
        const globalEvents = newEvents.filter(e => e.isGlobal);
        const playerEvents = newEvents.filter(e => !e.isGlobal);

        // INSERT GLOBAL events into Supabase (only if we're the leader)
        if (shouldInsertGlobalEvents && globalEvents.length > 0) {
            // Limit to max 3 global events per month
            const limitedGlobalEvents = globalEvents.slice(0, 3);
            const dbGlobalEvents = limitedGlobalEvents.map(e => ({
                user_id: user.id, // Still need user_id for RLS, but marked as global
                event_type: e.type.toLowerCase() === 'gossip' ? 'gossip' : e.type,
                title: e.type,
                description: e.message,
                month: targetMonth,
                year: targetYear,
                is_read: false,
                is_global: true // CRITICAL: Mark as global for multiplayer visibility
            }));
            await supabase.from("game_events").insert(dbGlobalEvents);
            console.log(`[WorldEvents] Inserted ${dbGlobalEvents.length} global events for ${targetMonth}/${targetYear}`);
        }

        // INSERT player-specific events (awards, etc.) - these are per-user
        if (playerEvents.length > 0) {
            const dbPlayerEvents = playerEvents.map(e => ({
                user_id: user.id,
                event_type: e.type.toLowerCase() === 'gossip' ? 'gossip' : e.type,
                title: e.type,
                description: e.message,
                month: targetMonth,
                year: targetYear,
                is_read: false,
                is_global: false
            }));
            await supabase.from("game_events").insert(dbPlayerEvents);
        }

        // UPDATE Local State - Now with balance and reputation changes!
        setGameState(prev => ({
            ...prev,
            actors: updatedActors,
            balance: prev.balance + balanceChange,
            reputation: applyReputationChange(prev.reputation, reputationChange),
            events: [...prev.events, ...newEvents.map(e => ({...e, read: false}))]
        }));
        
        // Sync Actors to DB (Critical for persistence)
         const changedActors = updatedActors.filter(newActor => {
            const oldActor = gameState.actors.find(a => a.id === newActor.id);
            if (!oldActor) return false;
            return (
                oldActor.reputation !== newActor.reputation || 
                oldActor.status !== newActor.status ||
                oldActor.tier !== newActor.tier ||
                oldActor.skill !== newActor.skill ||
                oldActor.salary !== newActor.salary ||
                oldActor.age !== newActor.age ||
                JSON.stringify(oldActor.gossip) !== JSON.stringify(newActor.gossip)
            );
        });
        
        if (changedActors.length > 0) {
            for (const actor of changedActors) {
                await supabase.from("actors").update({
                    reputation: actor.reputation,
                    status: actor.status,
                    tier: actor.tier,
                    skill: actor.skill,
                    salary: actor.salary,
                    age: actor.age,
                    gossip: actor.gossip
                }).eq("id", actor.id);
            }
        }

        // CRITICAL: Persist balance and reputation changes to Supabase
        if (balanceChange !== 0 || reputationChange !== 0) {
            // Fetch current values from DB to avoid stale closure issues
            const { data: currentState } = await supabase
                .from("game_state")
                .select("balance, reputation")
                .eq("user_id", user.id)
                .single();

            if (currentState) {
                const newBalance = currentState.balance + balanceChange;
                const newReputation = applyReputationChange(currentState.reputation, reputationChange);

                console.log(`[WorldEvents] Persisting: balance ${currentState.balance} + ${balanceChange} = ${newBalance}, reputation ${currentState.reputation} + ${reputationChange} = ${newReputation} (tier-protected)`);

                const { error } = await supabase
                    .from("game_state")
                    .update({
                        balance: newBalance,
                        reputation: newReputation,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("user_id", user.id);

                if (error) {
                    console.error("[WorldEvents] Error persisting balance/reputation:", error);
                }
            }
        }

      } catch (err) {
        console.error("Error processing world events:", err);
      }
    };

    const processMissingMonths = async () => {
      if (!lastProcessedTime.current) return;

      let currentMonth = lastProcessedTime.current.month;
      let currentYear = lastProcessedTime.current.year;
      let monthsProcessed = 0;

      // Loop until we catch up to the current clock
      // Safety limit of 12 months to prevent infinite loops/hangs if client is very far behind
      while (
        (currentYear < clock.year || (currentYear === clock.year && currentMonth < clock.month)) && 
        monthsProcessed < 12
      ) {
        // Increment month logic
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
        
        await processWorldEventsForMonth(currentMonth, currentYear);
        
        // Update tracker immediately after processing
        lastProcessedTime.current = {
            month: currentMonth,
            year: currentYear
        };
        monthsProcessed++;
      }
    };

    processMissingMonths();
  }, [clock, user, gameState.actors]); // Trigger when clock changes

  // Track if this is the initial load for production (to skip processing on refresh)
  const isInitialProductionLoad = useRef(true);
  const isProcessingProduction = useRef(false);

  // Process production advancement when global clock changes
  useEffect(() => {
    if (!clock || !user) return;

    // On initial page load, just record the time without processing
    if (isInitialProductionLoad.current) {
      console.log(`[Production] Initial load - recording clock at ${clock.month}/${clock.year}`);
      lastProductionProcessedTime.current = {
        month: clock.month,
        year: clock.year,
      };
      isInitialProductionLoad.current = false;
      return;
    }

    // Skip if this month/year was already processed for production
    if (
      lastProductionProcessedTime.current &&
      lastProductionProcessedTime.current.month === clock.month &&
      lastProductionProcessedTime.current.year === clock.year
    ) {
      return;
    }

    console.log(`[Production] Clock advanced to ${clock.month}/${clock.year} - processing production`);

    const processProductionAdvancement = async () => {
      try {
        // Import production service
        const { advanceProduction, processMovieRelease } = await import(
          "./services/productionService"
        );

        // Get active projects (not released)
        const activeProjects = gameState.projects.filter(
          (p) => p.status !== "Released"
        );

        // Only return early (and don't set guard) if there are truly no projects
        // This allows the effect to retry when projects load
        if (activeProjects.length === 0) {
          console.log("[Production] No active projects to process");
          return;
        }

        // Mark as processed AFTER confirming we have projects to process
        // This prevents the race condition where empty projects list blocks future runs
        lastProductionProcessedTime.current = {
          month: clock.month,
          year: clock.year,
        };

        console.log(`[Production] Processing ${activeProjects.length} active project(s) for ${clock.month}/${clock.year}`);

        const updatedProjects = [...gameState.projects];
        const newEvents: any[] = [];
        let balanceChange = 0;
        let reputationChange = 0;

        // Process each active project
        for (let i = 0; i < updatedProjects.length; i++) {
          const project = updatedProjects[i];
          if (project.status === "Released") continue;


          // **CRITICAL VALIDATION**: Check if all cast members are still available
          // If actor contracts expired, production should halt
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          let hasExpiredCast = false;
          const expiredActors: string[] = [];

          for (const actorId of project.cast) {
            // Only check database actors (UUIDs), skip seed actors
            if (!uuidRegex.test(actorId)) continue;

            // Check if actor is still in production or on hiatus for this studio
            const { data: actorData } = await supabase
              .from("actors")
              .select("status, name")
              .eq("id", actorId)
              .single();

            if (actorData && actorData.status !== "In Production" && actorData.status !== "On Hiatus") {
              hasExpiredCast = true;
              expiredActors.push(actorData.name);
            }
          }

          // If cast is invalid, halt production and notify
          if (hasExpiredCast) {
            console.warn(`[Production] "${project.title}" halted - actors unavailable:`, expiredActors);
            
            newEvents.push({
              id: `halt-${project.id}`,
              month: clock.month,
              type: "BAD",
              message: `⚠️ PRODUCTION HALTED: "${project.title}" - Cast members no longer available (${expiredActors.join(", ")}). Contract expired.`,
              read: false,
            });

            // Skip production advancement for this project
            continue;
          }

          // Advance production by one month
          console.log(`[Production] Advancing project "${project.title}" (${project.id}) - Current status: ${project.status}, Phase progress: ${project.phaseProgress}%`);
          
          const { movie, event, phaseChanged, released } = advanceProduction(
            project,
            clock.month,
            clock.year
          );

          console.log(`[Production] After advancement - "${movie.title}" - New status: ${movie.status}, Phase progress: ${movie.phaseProgress}%, Phase changed: ${phaseChanged}, Released: ${released}`);
          if (event) {
            console.log(`[Production] Event generated: ${event.title} - ${event.description}`);
          }

          updatedProjects[i] = movie;

          // Save project updates to database (round progress values for integer columns)
          await updateProject(movie.id, {
            status: movie.status,
            progress: Math.round(movie.progress),
            phaseProgress: Math.round(movie.phaseProgress),
            quality: movie.quality,
            currentBudgetSpent: movie.currentBudgetSpent,
            estimatedReleaseMonth: movie.estimatedReleaseMonth,
            estimatedReleaseYear: movie.estimatedReleaseYear,
            productionEvents: movie.productionEvents,
          });

          // Add production event to game events
          if (event) {
            console.log(`[Production] Creating game event for "${project.title}": ${event.description}`);
            newEvents.push({
              id: event.id,
              month: clock.month,
              type:
                event.type === "positive"
                  ? "GOOD"
                  : event.type === "negative"
                  ? "BAD"
                  : "INFO",
              message: `[${movie.title}] ${event.title}: ${event.description}`,
              read: false,
            });
          }

          // If movie just released, calculate box office
          if (released) {
            // Get cast actors
            const cast = gameState.actors.filter((a) =>
              movie.cast.includes(a.id)
            );

            // Count competition (other films released this month)
            const competitionCount = gameState.projects.filter(
              (p) =>
                p.status === "Released" &&
                p.releaseMonth === clock.month &&
                p.releaseYear === clock.year &&
                p.id !== movie.id
            ).length;

            // Calculate box office revenue
            const releaseResult = processMovieRelease(
              movie,
              cast,
              gameState.reputation,
              competitionCount
            );

            updatedProjects[i] = releaseResult.updatedMovie;
            balanceChange += releaseResult.revenueResult.totalRevenue;
            reputationChange += releaseResult.reputationChange;

            // Save release data to database
            await updateProject(movie.id, {
              status: releaseResult.updatedMovie.status,
              releaseMonth: releaseResult.updatedMovie.releaseMonth,
              releaseYear: releaseResult.updatedMovie.releaseYear,
              revenue: releaseResult.updatedMovie.revenue,
              reviews: releaseResult.updatedMovie.reviews,
              progress: 100,
            });

            // Add box office event (GLOBAL - visible to all players)
            const releaseStudioName = profile?.username || "A studio";
            newEvents.push({
              id: `box-office-${movie.id}`,
              month: clock.month,
              type:
                releaseResult.revenueResult.performance === "Flop" ||
                releaseResult.revenueResult.performance === "Underperformer"
                  ? "BAD"
                  : "GOOD",
              message: `BOX OFFICE: ${releaseStudioName} releases "${movie.title}" (${movie.genre}). ${releaseResult.review}`,
              read: false,
              isGlobal: true, // Visible to all players
            });

            console.log(
              `🎬 "${movie.title}" released! Revenue: $${(
                releaseResult.revenueResult.totalRevenue / 1000000
              ).toFixed(1)}M (${releaseResult.revenueResult.performance})`
            );

            // Toast notification for film release
            const totalCost = movie.productionBudget + movie.marketingBudget;
            const profit = releaseResult.revenueResult.totalRevenue - totalCost;
            
            if (profit > 0) {
              notifications.notifyFilmSuccess(movie.title, profit);
            } else if (profit < -totalCost * 0.3) {
              notifications.notifyFilmFlopped(movie.title, profit);
            } else {
              notifications.notifyFilmReleased(movie.title, () => {
                setActiveTab('releases');
                focusWindow('manager');
              });
            }


            // Release actors from production back to "On Hiatus" (if contracted) or "Available"
            // Only sync actors with valid UUID IDs (local seed actors have simple IDs like "a1")
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            for (const actorId of movie.cast) {
              if (!uuidRegex.test(actorId)) continue; // Skip non-UUID actors

              // Check if actor has active contract with this user
              const { data: contractData } = await supabase
                .from("actor_contracts")
                .select("id")
                .eq("actor_id", actorId)
                .eq("studio_id", user.id)
                .eq("status", "active")
                .single();

              const newStatus = contractData ? "On Hiatus" : "Available";
              await supabase
                .from("actors")
                .update({ status: newStatus })
                .eq("id", actorId);
            }
          }

          // Notify on phase changes
          if (phaseChanged && !released) {
            playNotificationSound(); // Play sound for stage transition
            newEvents.push({
              id: `phase-${movie.id}-${clock.month}`,
              month: clock.month,
              year: clock.year,
              type: "INFO",
              message: `"${movie.title}" has entered ${movie.status} phase.`,
              read: false,
            });
          }
        }

        // Update state with non-project changes (projects are updated via DB sync)
        setGameState((prev) => ({
          ...prev,
          balance: prev.balance + balanceChange,
          reputation: applyReputationChange(prev.reputation, reputationChange),
          events: [...prev.events, ...newEvents],
        }));

        // Update Supabase balance and reputation if changed
        if (balanceChange !== 0 || reputationChange !== 0) {
          // Fetch current values from DB to avoid stale closure issues
          const { data: currentState } = await supabase
            .from("game_state")
            .select("balance, reputation")
            .eq("user_id", user.id)
            .single();

          if (currentState) {
            const newBalance = currentState.balance + balanceChange;
            const newReputation = applyReputationChange(currentState.reputation, reputationChange);

            console.log(`[Production] Persisting: balance ${currentState.balance} + ${balanceChange} = ${newBalance}, reputation ${currentState.reputation} + ${reputationChange} = ${newReputation} (tier-protected)`);

            const { error } = await supabase
              .from("game_state")
              .update({
                balance: newBalance,
                reputation: newReputation,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", user.id);

            if (error) {
              console.error("Error updating balance/reputation:", error);
            }
          }
        }

        // Insert production events into Supabase
        // Insert production events into Supabase with deduplication
        if (newEvents.length > 0) {
          const uniqueEventsToInsert = [];
          
          for (const e of newEvents) {
            // Check if this specific event already exists
            const { data: existingEvents } = await supabase
              .from("game_events")
              .select("id")
              .eq("user_id", user.id)
              .eq("description", e.message)
              .eq("month", clock.month)
              .eq("year", clock.year)
              .limit(1);

            if (!existingEvents || existingEvents.length === 0) {
              uniqueEventsToInsert.push({
                user_id: user.id,
                event_type: e.type.toLowerCase(),
                title: e.type,
                description: e.message,
                month: clock.month,
                year: clock.year,
                is_global: e.isGlobal || false,
              });
            } else {
               console.log(`[Event Deduplication] Skipped duplicate event: "${e.message}"`);
            }
          }

          if (uniqueEventsToInsert.length > 0) {
            const { error } = await supabase.from("game_events").insert(uniqueEventsToInsert);
            if (error) {
              console.error("Error inserting production events:", error);
            } else {
              console.log(`[Event Deduplication] Successfully inserted ${uniqueEventsToInsert.length} new events.`);
            }
          }
        }
      } catch (err) {
        console.error("Error processing production advancement:", err);
      }
    };

    processProductionAdvancement();
  }, [
    clock,
    user,
    gameState.projects,
    gameState.actors,
    gameState.reputation,
    gameState.balance,
  ]);

  // Monitor script acquisitions for Variety events
  // Use sessionStorage to track notified scripts within a browser session
  useEffect(() => {
    // Wait for loading to finish
    if (ownedScriptsLoading || !user) return;

    const currentIds: Set<string> = new Set(multiplayerOwnedScripts.map(s => s.script_id));

    // Get previously notified scripts from sessionStorage (persists across component re-renders but not page refresh)
    const notifiedKey = `notified_scripts_${user.id}`;
    const notifiedScripts = new Set<string>(
      JSON.parse(sessionStorage.getItem(notifiedKey) || '[]')
    );

    // Find truly new IDs (not in previous state AND not already notified this session)
    const newIds = [...currentIds].filter(id =>
      !prevOwnedScriptIds.current.has(id) && !notifiedScripts.has(id)
    );

    // SKIP notifications on the very first load to prevent spam on refresh
    if (!scriptsInitialized.current) {
        if (newIds.length > 0) {
            // Mark all existing scripts as "seen" so they don't trigger alerts
            const allIds = [...currentIds];
            sessionStorage.setItem(notifiedKey, JSON.stringify(allIds));
            prevOwnedScriptIds.current = currentIds;
            scriptsInitialized.current = true;
        }
        return;
    }

    if (newIds.length > 0) {
        newIds.forEach(id => {
            const script = multiplayerOwnedScripts.find(s => s.script_id === id);
            if (script) {
                // Mark as notified immediately
                notifiedScripts.add(id);

                // Trigger Notification
                // notifyScriptAcquired removed to prevent spam on refresh

                // Trigger Variety Event (BACKGROUND) with deduplication
                 const insertEvent = async () => {
                     try {
                        const studioName = user.user_metadata?.username || profile?.username || "The studio";
                        const eventDesc = `${studioName} has acquired rights to "${script.title}" (${script.genre}). Pre-production can now begin.`;
                        
                        // Check if event already exists
                        const { data: existingEvent } = await supabase
                          .from("game_events")
                          .select("id")
                          .eq("user_id", user.id)
                          .eq("description", eventDesc)
                          .eq("month", clock?.month || gameState.month)
                          .eq("year", clock?.year || gameState.year)
                          .limit(1);

                        if (!existingEvent || existingEvent.length === 0) {
                          const { error } = await supabase.from("game_events").insert({
                              user_id: user.id,
                              event_type: "INFO",
                              title: "SCRIPT ACQUIRED",
                              description: eventDesc,
                              month: clock?.month || gameState.month,
                              year: clock?.year || gameState.year,
                              is_read: false,
                              is_global: true // Visible to all players
                          });
                          if (error) console.error("Error inserting script event:", error);
                        } else {
                          console.log("[ScriptAcquisition] Skipped duplicate event");
                        }
                     } catch (e) {
                         console.error("Error creating script event:", e);
                     }
                 };
                 insertEvent();
            }
        });

        // Save updated notified scripts to sessionStorage
        sessionStorage.setItem(notifiedKey, JSON.stringify([...notifiedScripts]));
    }

    prevOwnedScriptIds.current = currentIds;
  }, [multiplayerOwnedScripts, ownedScriptsLoading, user, clock?.month, clock?.year, notifications, profile]);

  // Show mobile blocker if on mobile device
  if (isMobile) {
    return <MobileBlocker />;
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#3a6ea5]">
        <div className="text-white text-sm">Loading...</div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!user) {
    return (
      <AuthScreen
        onSignIn={async (email: string, password: string) => {
          setAuthError(null);
          setIsAuthenticating(true);
          try {
            const { error } = await signIn(email, password);
            if (error) setAuthError(error.message);
          } finally {
            setIsAuthenticating(false);
          }
        }}
        onSignUp={async (email: string, password: string, username: string) => {
          setAuthError(null);
          setIsAuthenticating(true);
          try {
            const { error } = await signUp(email, password, username);
            if (error) setAuthError(error.message);
          } finally {
            setIsAuthenticating(false);
          }
        }}
        isLoading={isAuthenticating}
        error={authError}
      />
    );
  }

  // User is fully authenticated with profile - show dashboard

  const focusWindow = (id: string) => {
    setTopZ((prev) => {
      const newZ = prev + 1;
      setWindows((prevWindows) => ({
        ...prevWindows,
        [id]: { ...prevWindows[id], zIndex: newZ, isMinimized: false, isOpen: true },
      }));
      setActiveWindowId(id);
      return newZ;
    });
  };

  const closeWindow = (id: string) => {
    setWindows((prev) => ({ ...prev, [id]: { ...prev[id], isOpen: false } }));
  };

  const toggleWindowMinimize = (id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: !prev[id].isMinimized },
    }));
    if (windows[id].isMinimized) focusWindow(id);
  };

  const handlePlayerBid = (scriptId: string, amount: number) => {
    setGameState((prev) => {
      const updatedScripts = prev.marketScripts.map((s) =>
        s.id === scriptId
          ? { ...s, currentBid: amount, highBidderId: "player" }
          : s
      );
      return { ...prev, marketScripts: updatedScripts };
    });

    // Rival counter-bid chance (within 5 seconds)
    const rivalBidDelay = Math.random() * 3000 + 2000; // 2-5 seconds
    setTimeout(() => {
      if (Math.random() > 0.4) {
        setGameState((prev) => {
          const script = prev.marketScripts.find((s) => s.id === scriptId);
          if (!script || script.highBidderId !== "player") return prev;

          const rival =
            prev.rivals[Math.floor(Math.random() * prev.rivals.length)];
          const counterAmount =
            script.currentBid + Math.floor(Math.random() * 80000 + 20000);

          if (rival.balance < counterAmount) return prev;

          const outbidEvent: GameEvent = {
            id: uuid(),
            month: prev.month,
            type: "BAD",
            message: `OUTBID: ${
              rival.name
            } placed $${counterAmount.toLocaleString()} on "${script.title}"!`,
            read: false,
          };

          return {
            ...prev,
            marketScripts: prev.marketScripts.map((s) =>
              s.id === scriptId
                ? { ...s, currentBid: counterAmount, highBidderId: rival.id }
                : s
            ),
            events: [...prev.events, outbidEvent],
          };
        });
      }
    }, rivalBidDelay);

    // Auto-close auction after 30 seconds
    setTimeout(async () => {
      const script = gameState.marketScripts.find((s) => s.id === scriptId);
      if (!script) return;

      // If player is still high bidder, they win!
      if (script.highBidderId === "player") {
        // Check if player can afford it
        if (gameState.balance < script.currentBid) {
          setGameState((prev) => {
            const insufficientFundsEvent: GameEvent = {
              id: uuid(),
              month: prev.month,
              type: "BAD",
              message: `AUCTION FAILED: Insufficient funds for "${script.title}". Need $${script.currentBid.toLocaleString()}.`,
              read: false,
            };
            return {
              ...prev,
              marketScripts: prev.marketScripts.filter((s) => s.id !== scriptId),
              events: [...prev.events, insufficientFundsEvent],
            };
          });
          return;
        }

        // Player wins! - Check for duplicate event BEFORE updating state
        const studioName = profile?.username || "A studio";
        const auctionEventDesc = `ACQUISITION: ${studioName} acquires "${script.title}" (${script.genre}) for $${script.currentBid.toLocaleString()}!`;
        
        const { data: existingAuction } = await supabase
          .from("game_events")
          .select("id")
          .eq("user_id", user.id)
          .eq("description", auctionEventDesc)
          .eq("month", clock.month)
          .eq("year", clock.year)
          .limit(1);

        if (!existingAuction || existingAuction.length === 0) {
          await supabase.from("game_events").insert({
            user_id: user.id,
            event_type: 'INFO',
            title: 'ACQUISITION',
            description: auctionEventDesc,
            month: clock.month,
            year: clock.year,
            is_read: false,
            is_global: true, // Visible to all players
          });
        } else {
          console.log("[Auction] Skipped duplicate auction event");
        }

        // Now update state
        setGameState((prev) => {
          const wonEvent: GameEvent = {
            id: uuid(),
            month: prev.month,
            type: "GOOD",
            message: `ACQUISITION: ${studioName} acquires "${script.title}" for $${script.currentBid.toLocaleString()}!`,
            read: false,
          };

          return {
            ...prev,
            balance: prev.balance - script.currentBid,
            // ownedScripts managed by useOwnedScripts hook via DB subscription
            marketScripts: prev.marketScripts.filter((s) => s.id !== scriptId),
            events: [...prev.events, wonEvent],
          };
        });
      } else {
        // Rival won, remove from market
        setGameState((prev) => {
          const lostEvent: GameEvent = {
            id: uuid(),
            month: prev.month,
            type: "BAD",
            message: `AUCTION LOST: "${script.title}" went to ${
              prev.rivals.find((r) => r.id === script.highBidderId)?.name ||
              "another studio"
            }.`,
            read: false,
          };

          return {
            ...prev,
            marketScripts: prev.marketScripts.filter((s) => s.id !== scriptId),
            events: [...prev.events, lostEvent],
          };
        });
      }
    }, 30000); // 30 seconds
  };

  const handleSendMoney = (studioId: string, amount: number) => {
    if (gameState.balance < amount) return;
    setGameState((prev) => {
      const transferEvent: GameEvent = {
        id: uuid(),
        month: prev.month,
        type: "INFO",
        message: `TRANSFER: You wired $${amount.toLocaleString()} to ${
          prev.rivals.find((r) => r.id === studioId)?.name
        }.`,
        read: false,
      };
      return {
        ...prev,
        balance: prev.balance - amount,
        rivals: prev.rivals.map((r) =>
          r.id === studioId
            ? {
                ...r,
                balance: r.balance + amount,
                relationship: Math.min(100, r.relationship + 10),
              }
            : r
        ),
        events: [...prev.events, transferEvent],
      };
    });
  };

  const handleSendMessage = (
    studioId: string,
    content: string,
    isPublic: boolean
  ) => {
    const newMessage: StudioMessage = {
      id: uuid(),
      fromId: "player",
      toId: studioId,
      content,
      month: gameState.month,
      isPublic,
    };

    setGameState((prev) => {
      const studio = prev.rivals.find((r) => r.id === studioId);
      const newEvents: GameEvent[] = [...prev.events];
      if (isPublic) {
        newEvents.push({
          id: uuid(),
          month: prev.month,
          type: "GOSSIP",
          message: `WIRE: StarVision Global sends bold memo to ${
            studio?.name
          }: "${content.slice(0, 30)}..."`,
          read: false,
        });
      }
      return {
        ...prev,
        messages: [...prev.messages, newMessage],
        events: newEvents,
      };
    });
  };

  const handleStartProduction = async (
    scriptId: string,
    actorIds: string[],
    budget: number,
    marketing: number
  ) => {
    // Prevent duplicate submissions
    if (isProcessingProduction.current) {
      console.log("[Greenlight] Already processing, ignoring duplicate call");
      return;
    }
    
    const script = gameState.ownedScripts.find((s) => s.id === scriptId);
    if (!script) return;

    // Check if user is authenticated
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    
    // Set processing flag
    isProcessingProduction.current = true;

    // Calculate estimated release date based on production phases
    const estimatedRelease = calculateEstimatedRelease(
      gameState.month,
      gameState.year
    );

    const newProject = {
      scriptId,
      studioId: user.id,
      title: script.title,
      genre: script.genre,
      cast: actorIds,
      marketingBudget: marketing,
      productionBudget: budget,
      progress: 0,
      phaseProgress: 0,
      status: ProjectStatus.PreProduction,
      quality: 0,
      revenue: 0,
      releaseMonth: 0,
      releaseYear: gameState.year,
      chemistry: 0,
      productionEvents: [],
      currentBudgetSpent: 0,
      estimatedReleaseMonth: estimatedRelease.month,
      estimatedReleaseYear: estimatedRelease.year,
    };

    // Save project to database FIRST and get the returned project with DB-generated ID
    const { error, project: savedProject } = await createProject(newProject);
    if (error || !savedProject) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
      isProcessingProduction.current = false; // Reset flag on error
      return;
    }

    // Calculate new balance and persist to database
    const newBalance = gameState.balance - (budget + marketing);
    await updateBalance(newBalance);

    // Save events to database (GLOBAL - visible to all players) with deduplication
    const studioName = profile?.username || "A studio";
    const greenlightEventDesc = `GREENLIT: ${studioName} has greenlit "${script.title}" (${script.genre}). Production begins.`;
    
    // Check if greenlight event already exists
    const { data: existingGreenlight } = await supabase
      .from("game_events")
      .select("id")
      .eq("user_id", user.id)
      .eq("description", greenlightEventDesc)
      .eq("month", gameState.month)
      .eq("year", gameState.year)
      .limit(1);

    if (!existingGreenlight || existingGreenlight.length === 0) {
      await supabase.from("game_events").insert({
        user_id: user.id,
        event_type: "GOOD",
        title: "Project Greenlit",
        description: greenlightEventDesc,
        month: gameState.month,
        year: gameState.year,
        is_read: false,
        is_global: true, // Visible to all players
      });
      console.log("[Greenlight] Inserted greenlight event");
    } else {
      console.log("[Greenlight] Skipped duplicate greenlight event");
    }

    if (marketing > 500000) {
      const marketingEventDesc = `MARKETING: ${studioName} launches major campaign for "${script.title}"`;
      
      // Check if marketing event already exists
      const { data: existingMarketing } = await supabase
        .from("game_events")
        .select("id")
        .eq("user_id", user.id)
        .eq("description", marketingEventDesc)
        .eq("month", gameState.month)
        .eq("year", gameState.year)
        .limit(1);

      if (!existingMarketing || existingMarketing.length === 0) {
        await supabase.from("game_events").insert({
          user_id: user.id,
          event_type: "AD",
          title: "Marketing Campaign",
          description: marketingEventDesc,
          month: gameState.month,
          year: gameState.year,
          is_read: false,
          is_global: true, // Visible to all players
        });
        console.log("[Greenlight] Inserted marketing event");
      } else {
        console.log("[Greenlight] Skipped duplicate marketing event");
      }
    }

    // **CRITICAL FIX**: Delete the script from owned_scripts table to prevent duplication
    // The script should only be used once for production
    const { error: deleteError } = await supabase
      .from("owned_scripts")
      .delete()
      .eq("script_id", scriptId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("[Greenlight] Error deleting owned script:", deleteError);
      // Non-fatal - production can continue but script might reappear
    } else {
      console.log(`[Greenlight] Deleted script ${scriptId} from owned_scripts`);
    }

    // Set actors to "In Production" status in database (only for UUID actors)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const actorId of actorIds) {
      if (uuidRegex.test(actorId)) {
        await supabase
          .from("actors")
          .update({ status: "In Production" })
          .eq("id", actorId);
      }
    }

    setGameState((prev) => {
      const newEvents: GameEvent[] = [
        ...prev.events,
        {
          id: uuid(),
          month: prev.month,
          type: "GOOD",
          message: `GREENLIT: "${script.title}" production started.`,
          read: false,
        },
      ];
      if (marketing > 500000) {
        newEvents.push({
          id: uuid(),
          month: prev.month,
          type: "AD",
          message: `MARKETING: ${script.title}`,
          read: false,
        });
      }
      return {
        ...prev,
        balance: newBalance,
        projects: [...prev.projects, savedProject], // Use savedProject with DB ID
        actors: prev.actors.map((a) =>
          actorIds.includes(a.id) ? { ...a, status: "In Production" } : a
        ),
        ownedScripts: prev.ownedScripts.filter((s) => s.id !== scriptId),
        events: newEvents,
      };
    });
    
    // Reset processing flag
    isProcessingProduction.current = false;
    
    setShowProductionWizard(false);
    setActiveTab("dashboard");
  };

  const handleSaveProfile = async (name: string, avatar: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username: name,
          avatar_url: avatar 
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Profile will update automatically via AuthContext subscription
      // No need to reload - this was causing infinite save loop
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile via 'User Accounts' settings.");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative">
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-[1px] cursor-wait">
          <div className="bg-[#ece9d8] bevel-outset p-4 flex flex-col items-center gap-2 shadow-xl">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold">
              Updating Industry Data...
            </span>
          </div>
        </div>
      )}



      <div className="absolute inset-0 p-4 flex flex-col items-start gap-4 z-0 pointer-events-none">
        <DesktopIcon
          icon="/images/My computer.ico"
          label="My Studio"
          onClick={() => focusWindow("manager")}
          isImage
        />
        <DesktopIcon
          icon="/images/internetexplorer.svg"
          label="Variety News"
          onClick={() => focusWindow("news")}
          isImage
        />
        <DesktopIcon
          icon="/images/mail:message.svg"
          label="Messenger"
          onClick={() => focusWindow("messenger")}
          isImage
        />
        <DesktopIcon
          icon="/images/Full Recycle Bin.ico"
          label="Trash"
          isImage
        />
      </div>

      <div className="flex-1 relative p-4 z-10 pointer-events-none">
        {windows.manager.isOpen && !windows.manager.isMinimized && (
            <WindowFrame
              key="manager"
              title="StarVision Studio Manager 2003"
              className="w-full max-w-6xl h-fit max-h-[90vh]"
              onClose={() => closeWindow("manager")}
              onMinimize={() => toggleWindowMinimize("manager")}
              isActive={activeWindowId === "manager"}
              zIndex={windows.manager.zIndex}
              onFocus={() => focusWindow("manager")}
              initialPos={{ 
                x: typeof window !== 'undefined' ? (window.innerWidth - 1152) / 2 : 100, 
                y: 50 
              }}
            >
              <div className="flex flex-col h-auto overflow-hidden bg-[#ece9d8]">
                {/* MENU BAR */}
                <div className="h-5 bg-[#ece9d8] flex items-center px-1 border-b border-[#d4d0c8] select-none font-tahoma text-[11px] shrink-0">
                    <span className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white cursor-default">File</span>
                    <span className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white cursor-default">Edit</span>
                    <span className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white cursor-default">View</span>
                    <span className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white cursor-default">Favorites</span>
                    <span className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white cursor-default">Tools</span>
                    <span className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white cursor-default">Help</span>
                </div>

                {/* FIXED TABS HEADER */}
                <div className="flex px-1 pt-1.5 items-end shrink-0 border-b border-[#808080] bg-[#ece9d8]">
                  <RetroTab
                    isActive={activeTab === "dashboard"}
                    onClick={() => setActiveTab("dashboard")}
                    label="Summary"
                  />
                  <RetroTab
                    isActive={activeTab === "scripts"}
                    onClick={() => setActiveTab("scripts")}
                    label="IP Market"
                  />
                  <RetroTab
                    isActive={activeTab === "actors"}
                    onClick={() => setActiveTab("actors")}
                    label="Talent Pool"
                  />
                  <RetroTab
                    isActive={activeTab === "releases"}
                    onClick={() => setActiveTab("releases")}
                    label="Filmography"
                  />
                  <RetroTab
                    isActive={activeTab === "awards"}
                    onClick={() => setActiveTab("awards")}
                    label="Awards"
                  />
                </div>

                {/* FLEXIBLE CONTENT BODY */}
                <div className="h-auto p-0.5 flex flex-col overflow-hidden bg-white">
                  {activeTab === "dashboard" && (
                    <div className="flex justify-end p-2 bg-[#ece9d8] border-b border-[#808080] shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-600">Start a new production:</span>
                        <RetroButton
                          onClick={() => setShowProductionWizard(true)}
                          className="!gap-1.5 !px-2"
                        >
                          Greenlight Film
                        </RetroButton>
                      </div>
                    </div>
                  )}

                  <div className="h-auto overflow-hidden">
                    {activeTab === "dashboard" && <Dashboard state={gameState} />}
                    {activeTab === "scripts" && <ScriptMarketMultiplayer />}
                    {activeTab === "actors" && <ActorDb />}
                    {activeTab === "releases" && (
                      <ReleasedFilms state={gameState} />
                    )}
                    {activeTab === "awards" && <Awards state={gameState} />}
                  </div>
                </div>
              </div>
            </WindowFrame>
          )}

          {windows.news.isOpen && !windows.news.isMinimized && (
              <MagazineWindow
                state={gameState}
                onClose={() => closeWindow("news")}
                onMinimize={() => toggleWindowMinimize("news")}
                isActive={activeWindowId === "news"}
                zIndex={windows.news.zIndex}
                onFocus={() => focusWindow("news")}
              />
          )}

          {windows.messenger.isOpen && !windows.messenger.isMinimized && (
              <StudioNetwork
                state={gameState}
                onSendMoney={handleSendMoney}
                onSendMessage={handleSendMessage}
                onClose={() => closeWindow("messenger")}
                onMinimize={() => toggleWindowMinimize("messenger")}
                isActive={activeWindowId === "messenger"}
                zIndex={windows.messenger.zIndex}
                onFocus={() => focusWindow("messenger")}
                playNotificationSound={playNotificationSound}
              />
          )}
      </div>

      {showProductionWizard && (
        <ProductionWizard
          state={gameState}
          onStartProduction={handleStartProduction}
          onCancel={() => setShowProductionWizard(false)}
        />
      )}

      <StartMenu
        isOpen={showStartMenu}
        onClose={() => setShowStartMenu(false)}
        username={profile?.username || gameState.playerName}
        userAvatar={profile?.avatar}
        onLogOff={signOut}
        onSaveProfile={handleSaveProfile}
      />

      <StatusBar
        items={[
          `$${(gameState.balance / 1000).toFixed(0)}K`,
          `${gameState.reputation}% Rep`,
          <MonthTimeline key="timeline" />,
        ]}
        activeWindows={taskbarItems}
        onToggleWindow={(id) => toggleWindowMinimize(id)}
        onStartClick={() => setShowStartMenu(!showStartMenu)}
      />
      
      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default App;
