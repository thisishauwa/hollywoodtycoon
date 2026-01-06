
import { GoogleGenAI, Type } from "@google/genai";
import { Script, Genre, Movie, Actor, ActorTier } from "../types";

// --- LOCAL PROCEDURAL ENGINE (Zero Cost Fallback) ---

const TROPES = {
  Action: ["Explosive", "Vengeance", "High-Octane", "Undercover", "Last Stand", "Overdrive"],
  Comedy: ["Unexpected", "Wacky", "Big Fat", "Total Disaster", "Misadventure", "Switcheroo"],
  Drama: ["Tear-Jerker", "Shattered", "Legacy", "Bitter-Sweet", "Forgotten", "Crossroads"],
  SciFi: ["Neo-", "Circuit", "Galactic", "Infinite", "Protocol", "Anomaly", "Neural"],
  Horror: ["Sinister", "Shadow", "Nightmare", "Curse", "Silent", "Unseen", "Deep"],
  Romance: ["Chasing", "Mistaken", "Fate", "Spark", "Midnight", "Eternal", "Secret"]
};

const NOUNS = ["Heist", "Wedding", "Mission", "Protocol", "Affair", "Encounter", "Legacy", "Showdown", "Reckoning"];
const ADJECTIVES = ["Impossible", "Golden", "Broken", "Ultimate", "Dangerous", "Lethal", "Secret"];

const generateLocalScript = (count: number): Partial<Script>[] => {
    const genres = Object.values(Genre);
    return Array.from({ length: count }).map(() => {
        const genre = genres[Math.floor(Math.random() * genres.length)];
        const trope = TROPES[genre][Math.floor(Math.random() * TROPES[genre].length)];
        const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
        const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        
        return {
            title: Math.random() > 0.5 ? `${adj} ${noun}` : `${trope} ${noun}`,
            description: `A high-stakes ${genre.toLowerCase()} film involving a ${adj.toLowerCase()} secret and a race against time.`,
            tagline: `In a world of ${adj.toLowerCase()} choices, only one ${noun.toLowerCase()} matters.`,
            genre: genre,
            tone: Math.random() > 0.5 ? "Serious" : "Lighthearted"
        };
    });
};

const LOCAL_HEADLINES = [
    "Brad Fitt spotted wearing cargo pants at the premiere.",
    "Studio head denies rumors of a 'Box Office Curse'.",
    "New diet trend 'The Grapefruit Only' diet sweeps Hollywood.",
    "Paparazzi caught hiding in bushes outside A-Lister's home.",
    "Pop princess seen at local drive-thru with mysterious friend.",
    "Action star performs own stunts, breaks two toes.",
    "Direct-to-DVD market sees 300% growth this quarter.",
    "Diva actress demands specific brand of bottled water on set."
];

// --- API WRAPPERS ---

export const generateNewScripts = async (currentYear: number): Promise<Partial<Script>[]> => {
    // Check for API key presence
    if (!process.env.API_KEY) return generateLocalScript(3);

    try {
        // Initializing with named parameter as required by guidelines
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate 3 movie script ideas for the year ${currentYear}. 2000s style. Return JSON.`,
             config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            tagline: { type: Type.STRING },
                            genre: { type: Type.STRING, enum: ["Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Romance"] },
                            tone: { type: Type.STRING, enum: ["Serious", "Lighthearted", "Dark", "Quirky"] }
                        },
                        required: ["title", "description", "genre", "tone", "tagline"]
                    }
                }
             }
        });
        // Accessing .text property directly as per guidelines
        return response.text ? JSON.parse(response.text) : generateLocalScript(3);
    } catch (e) {
        console.error("Gemini script generation error:", e);
        return generateLocalScript(3);
    }
};

export const generateMovieReview = async (movie: Movie): Promise<string> => {
    if (!process.env.API_KEY) {
        if (movie.quality > 80) return `A modern masterpiece of ${movie.genre.toLowerCase()}!`;
        if (movie.quality > 50) return `A solid effort that finds its footing by the second act.`;
        return `A loud, confusing mess that should have stayed in pre-production.`;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Short review for "${movie.title}" (${movie.genre}). Score ${movie.quality}/100. style: 2000s critic.`,
        });
        // Using .text property directly
        return response.text || "No review available.";
    } catch (e) {
        console.error("Gemini movie review error:", e);
        return "Review unavailable.";
    }
};

export const generateRandomEvent = async (year: number): Promise<string> => {
    // Mostly use local headlines to save tokens
    if (Math.random() > 0.2 || !process.env.API_KEY) {
        return LOCAL_HEADLINES[Math.floor(Math.random() * LOCAL_HEADLINES.length)];
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `One short 2000s Hollywood gossip headline for ${year}.`,
        });
        // Using .text property directly
        return response.text || LOCAL_HEADLINES[0];
    } catch (e) {
        console.error("Gemini event generation error:", e);
        return LOCAL_HEADLINES[Math.floor(Math.random() * LOCAL_HEADLINES.length)];
    }
}
