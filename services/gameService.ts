
import { GameState, ProjectStatus, Movie, Actor, Script, Genre, GameEvent, ActorTier, RivalStudio, StudioMessage } from '../types';
import { generateNewScripts, generateMovieReview, generateRandomEvent } from './geminiService';
import { processActorLifecycle, updateActorTiers, LifecycleEvent } from './actorLifecycle';
import { supabase } from '../lib/supabase';

// Sync actor changes to Supabase
async function syncActorToSupabase(actor: Actor) {
    const { error } = await supabase
        .from("actors")
        .update({
            reputation: actor.reputation,
            skill: actor.skill,
            salary: actor.salary,
            status: actor.status,
            age: actor.age,
            tier: actor.tier,
            relationships: actor.relationships,
            gossip: actor.gossip || [],
        })
        .eq("id", actor.id);

    if (error) {
        console.error(`[GameService] Error syncing actor ${actor.name}:`, error);
    }
    return error;
}

const uuid = () => 'id-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);

export const calculateTotalChemistry = (castIds: string[], allActors: Actor[]): number => {
    if (castIds.length < 2) return 0;
    let totalChemistry = 0;
    const cast = allActors.filter(a => castIds.includes(a.id));
    for (let i = 0; i < cast.length; i++) {
        for (let j = i + 1; j < cast.length; j++) {
            const a1 = cast[i];
            const a2 = cast[j];
            const rel1 = a1.relationships?.[a2.id] || 0;
            const rel2 = a2.relationships?.[a1.id] || 0;
            totalChemistry += (rel1 + rel2) / 2;
        }
    }
    return Math.round(totalChemistry);
};

export const calculateMovieQuality = (movie: Movie, actors: Actor[], script: Script, chemistryScore: number): number => {
    let quality = script.quality;
    const cast = actors.filter(a => movie.cast.includes(a.id));
    const avgSkill = cast.reduce((acc, a) => acc + a.skill, 0) / (cast.length || 1);
    const genreMatches = cast.filter(a => a.genres.includes(movie.genre)).length;
    quality += (avgSkill * 0.4);
    quality += (genreMatches * 5);
    quality += chemistryScore;
    const totalBudget = movie.productionBudget + movie.marketingBudget;
    if (totalBudget > 10000000) quality += 10;
    else if (totalBudget < 500000) quality -= 10;
    quality += (Math.random() * 20 - 10);
    return Math.max(1, Math.min(100, quality));
};

export const calculateBoxOffice = (movie: Movie, state: GameState): number => {
    const base = movie.productionBudget * 1.5;
    const qualityMultiplier = Math.pow(movie.quality / 45, 2.5);
    
    const competitors = state.projects.filter(p => 
        p.status === ProjectStatus.Released && 
        p.releaseMonth === state.month && 
        p.releaseYear === state.year &&
        p.genre === movie.genre &&
        p.id !== movie.id
    );
    
    const competitionPenalty = 1 - (competitors.length * 0.15);
    let revenue = (base * qualityMultiplier + (movie.marketingBudget * 2)) * Math.max(0.4, competitionPenalty);
    revenue = revenue * (0.8 + Math.random() * 0.4);
    return Math.floor(revenue);
};

export const processAdvanceMonth = async (state: GameState): Promise<GameState> => {
    const newState = { ...state };
    newState.month += 1;
    const events: GameEvent[] = [];

    // --- YEARLY RESET ---
    if (newState.month > 12) {
        newState.month = 1;
        newState.year += 1;
        newState.rivals = newState.rivals.map(r => ({ ...r, yearlyRevenue: 0 }));
    }

    // --- CONTRACT EXPIRATION CHECK ---
    // Process contract expirations and release actors no longer under contract
    const { data: contractResult } = await supabase.rpc("check_contract_expiration", {
        current_month: newState.month,
        current_year: newState.year,
    });
    if (contractResult && contractResult[0]) {
        const { expired_contracts, extended_contracts } = contractResult[0];
        if (expired_contracts?.length > 0) {
            events.push({
                id: uuid(),
                month: newState.month,
                type: "INFO",
                message: `CONTRACT: ${expired_contracts.length} actor contract(s) have expired.`,
                read: false,
            });
        }
        if (extended_contracts?.length > 0) {
            events.push({
                id: uuid(),
                month: newState.month,
                type: "INFO",
                message: `CONTRACT: ${extended_contracts.length} contract(s) auto-extended (actors in production).`,
                read: false,
            });
        }
    }

    // --- ACTOR LIFECYCLE EVENTS (death, marriage, scandal, etc.) ---
    const { updatedActors, events: lifecycleEvents } = processActorLifecycle(
        newState.actors,
        newState.month
    );
    const tieredActors = updateActorTiers(updatedActors);

    // Find actors that changed and sync to Supabase
    const changedActors = tieredActors.filter(newActor => {
        const oldActor = newState.actors.find(a => a.id === newActor.id);
        if (!oldActor) return false;
        return (
            oldActor.reputation !== newActor.reputation ||
            oldActor.skill !== newActor.skill ||
            oldActor.salary !== newActor.salary ||
            oldActor.status !== newActor.status ||
            oldActor.age !== newActor.age ||
            oldActor.tier !== newActor.tier ||
            JSON.stringify(oldActor.relationships) !== JSON.stringify(newActor.relationships) ||
            JSON.stringify(oldActor.gossip) !== JSON.stringify(newActor.gossip)
        );
    });

    // Sync changed actors to Supabase (includes new gossip from lifecycle events)
    if (changedActors.length > 0) {
        console.log(`[GameService] Syncing ${changedActors.length} changed actors to Supabase`);
        await Promise.all(changedActors.map(syncActorToSupabase));
    }

    newState.actors = tieredActors;

    // Convert lifecycle events to game events
    lifecycleEvents
        .filter(e => e.message.length > 0) // Only significant events
        .forEach(lifecycleEvent => {
            let eventType: GameEvent["type"] = "INFO";
            if (lifecycleEvent.type === "death") eventType = "BAD";
            else if (lifecycleEvent.type === "scandal" || lifecycleEvent.type === "career_slump" || lifecycleEvent.type === "feud" || lifecycleEvent.type === "divorce") eventType = "BAD";
            else if (lifecycleEvent.type === "award_win" || lifecycleEvent.type === "comeback" || lifecycleEvent.type === "breakout_role") eventType = "GOOD";
            else if (lifecycleEvent.type === "marriage" || lifecycleEvent.type === "reconciliation") eventType = "GOSSIP";
            else eventType = "GOSSIP";

            events.push({
                id: uuid(),
                month: newState.month,
                type: eventType,
                message: lifecycleEvent.message,
                read: false,
            });
        });

    // --- AUCTION RESOLUTION ---
    const wonByPlayer = newState.marketScripts.filter(s => s.highBidderId === 'player');
    wonByPlayer.forEach(s => {
        newState.balance -= s.currentBid;
        newState.ownedScripts.push(s);
        events.push({ id: uuid(), month: newState.month, type: 'GOOD', message: `AUCTION WON: Rights to "${s.title}" secured for $${s.currentBid.toLocaleString()}.`, read: false });
    });
    newState.marketScripts = [];

    // --- MASS RIVAL AI ACTIVITY (30 STUDIOS) ---
    // Every month, a few rivals release films to make the world feel alive
    const activeRivalsCount = 3 + Math.floor(Math.random() * 4); // 3-6 studios active each month
    const activeRivals = [...newState.rivals].sort(() => 0.5 - Math.random()).slice(0, activeRivalsCount);

    activeRivals.forEach(rival => {
        // High chance of script bidding (Handled in refresh market usually, but rival-rival bid here)
        // High chance of film release
        if (Math.random() > 0.4) {
            const genres = [Genre.Action, Genre.Comedy, Genre.Drama, Genre.Horror, Genre.SciFi, Genre.Romance];
            const genre = genres[Math.floor(Math.random() * genres.length)];
            const titles = ["Dark Knight Rising", "Lost in Translation-ish", "Finding Nemo-alike", "Oldboy-remake", "Mean Girls-proto"];
            const rivalMovie: Movie = {
                id: uuid(),
                scriptId: 'ai-script',
                studioId: rival.id,
                title: `${rival.name} presents ${titles[Math.floor(Math.random() * titles.length)]}`,
                genre: genre,
                cast: [],
                marketingBudget: 1000000 + Math.random() * 5000000,
                productionBudget: 2000000 + Math.random() * 10000000,
                progress: 100,
                status: ProjectStatus.Released,
                quality: 30 + Math.random() * 65,
                chemistry: 0,
                revenue: 0,
                releaseMonth: newState.month,
                releaseYear: newState.year,
            };
            rivalMovie.revenue = calculateBoxOffice(rivalMovie, newState);
            const rIdx = newState.rivals.findIndex(r => r.id === rival.id);
            if (rIdx !== -1) {
                newState.rivals[rIdx].balance += rivalMovie.revenue;
                newState.rivals[rIdx].yearlyRevenue += rivalMovie.revenue;
            }
            newState.projects.push(rivalMovie);
            events.push({ 
                id: uuid(), 
                month: newState.month, 
                type: 'INFO', 
                message: `BO: ${rival.name} released "${rivalMovie.title}". Reviews are ${rivalMovie.quality > 70 ? 'RAVING' : 'MIXED'}.`, 
                read: false 
            });
        }
    });

    // --- RANDOM FLAVOR EVENT & GOSSIP ---
    const headline = await generateRandomEvent(newState.year);
    events.push({ id: uuid(), month: newState.month, type: 'GOSSIP', message: `GOSSIP: ${headline}`, read: false });

    // --- PLAYER PROJECTS ---
    const updatedProjects = await Promise.all(newState.projects.map(async (p) => {
        if (p.status === ProjectStatus.Released || p.studioId !== 'player') return p;
        p.progress += 25 + Math.random() * 15;
        if (p.progress >= 100) {
            p.progress = 100;
            const script = newState.ownedScripts.find(s => s.id === p.scriptId);
            if (script) {
                const chemistry = calculateTotalChemistry(p.cast, newState.actors);
                p.chemistry = chemistry;
                p.quality = calculateMovieQuality(p, newState.actors, script, chemistry);
                p.revenue = calculateBoxOffice(p, newState);
                p.status = ProjectStatus.Released;
                p.releaseMonth = newState.month;
                p.releaseYear = newState.year;
                newState.balance += p.revenue;
                newState.reputation += Math.floor(p.quality / 10);
                // Release actors from production - check if they have active contracts
                for (const actorId of p.cast) {
                    const actor = newState.actors.find(a => a.id === actorId);
                    if (actor) {
                        // Check for active contract in Supabase
                        const { data: contract } = await supabase
                            .from("actor_contracts")
                            .select("id")
                            .eq("actor_id", actorId)
                            .eq("status", "active")
                            .single();
                        // If under contract, go to "On Hiatus", otherwise "Available"
                        actor.status = contract ? "On Hiatus" : "Available";
                    }
                }
                const review = await generateMovieReview(p);
                p.reviews = [review];
                events.push({ id: uuid(), month: newState.month, type: 'GOOD', message: `RELEASE: "${p.title}" hits theaters!`, read: false });
            }
        }
        return p;
    }));
    newState.projects = updatedProjects;

    // --- REFRESH MARKET ---
    if (newState.marketScripts.length === 0) {
        const scriptData = await generateNewScripts(newState.year);
        newState.marketScripts = scriptData.map(d => {
            const baseCost = 150000 + Math.floor(Math.random() * 850000);
            const highBidder = newState.rivals[Math.floor(Math.random() * newState.rivals.length)];
            return {
                id: uuid(),
                title: d.title || "Untitled",
                description: d.description || "...",
                tagline: d.tagline || "",
                genre: (d.genre as Genre) || Genre.Drama,
                quality: 45 + Math.random() * 45,
                complexity: 50,
                baseCost: baseCost,
                currentBid: baseCost,
                highBidderId: highBidder.id,
                requiredCast: 2,
                tone: (d.tone as any) || 'Serious'
            };
        });
    }

    newState.events = [...newState.events, ...events];
    return newState;
};
