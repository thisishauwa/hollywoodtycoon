
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

const LOCAL_HEADLINE_TEMPLATES = [
    "{name} spotted wearing cargo pants at the premiere.",
    "Studio head denies rumors of a 'Box Office Curse' involving {name}.",
    "{name} adopts a tiger? Rumors swirl.",
    "Paparazzi caught hiding in bushes outside {name}'s home.",
    "{name} seen at local drive-thru with mysterious friend.",
    "{name} performs own stunts, breaks two toes.",
    "{name} demands specific brand of bottled water on set.",
    "{name} helps old lady cross the street - PR stunt?.",
    "Fashion disaster! {name} wears denim on denim.",
    "{name} to launch own perfume line called 'Essence'."
];

export const generateRandomEvent = async (year: number, actors: Actor[] = []): Promise<string> => {
    // Pick a random actor if available
    const subject = actors.length > 0 ? actors[Math.floor(Math.random() * actors.length)] : null;
    const subjectName = subject ? subject.name : "A mystery celebrity";

    // Safe API Key access
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '');
    const useAI = !!apiKey && Math.random() > 0.2;

    // Mostly use local headlines to save tokens
    if (!useAI) {
        const template = LOCAL_HEADLINE_TEMPLATES[Math.floor(Math.random() * LOCAL_HEADLINE_TEMPLATES.length)];
        return template.replace("{name}", subjectName);
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = subject 
            ? `One short 2000s Hollywood gossip headline for ${year} about actor ${subject.name} (known for being ${subject.personality[0]}).`
            : `One short 2000s Hollywood gossip headline for ${year}.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || LOCAL_HEADLINE_TEMPLATES[0].replace("{name}", subjectName);
    } catch (e) {
        console.error("Gemini event generation error:", e);
        const template = LOCAL_HEADLINE_TEMPLATES[Math.floor(Math.random() * LOCAL_HEADLINE_TEMPLATES.length)];
        return template.replace("{name}", subjectName);
    }
}

export const generateNewScripts = async (currentYear: number): Promise<Partial<Script>[]> => {
    // Check for API key presence
    if (!process.env.API_KEY) return generateLocalScript(3);

    try {
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
        return response.text || "No review available.";
    } catch (e) {
        console.error("Gemini movie review error:", e);
        return "Review unavailable.";
    }
};
