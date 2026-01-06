
import { Actor, ActorTier, Genre, Script, RivalStudio } from './types';

export const INITIAL_BALANCE = 5000000;
export const START_YEAR = 2003;
export const START_MONTH = 1;

export const GENRES = Object.values(Genre);

const STUDIO_NAMES = [
  "Metro-G-M", "Global-Universal", "IndieCloud Pictures", "Paramount-ish", "Warner-Brothers-ish",
  "Sony-ish Entertainment", "Disney-ish Films", "Miramax-alike", "New Line-alike", "Lionsgate-ish",
  "Summit-alike", "Fox-ish Searchlight", "Focus-ish Features", "A24-proto", "Dimension-alike",
  "DreamWorks-ish", "Pixar-ish Animation", "Castle Rock-ish", "Orion-ish", "Touchstone-ish",
  "New Line-ish", "PolyGram-ish", "MGM-ish", "Screen Gems-ish", "Tristar-ish",
  "Hollywood-ish Pictures", "Working Title-ish", "Imagine-ish", "Amblin-ish", "Village-Roadshow-ish"
];

const PERSONALITIES: RivalStudio['personality'][] = ['Aggressive', 'Friendly', 'Elitist', 'Chaotic'];

export const RIVAL_STUDIOS: RivalStudio[] = STUDIO_NAMES.map((name, i) => ({
  id: `r${i}`,
  name,
  reputation: 30 + Math.floor(Math.random() * 60),
  balance: 5000000 + Math.floor(Math.random() * 95000000),
  yearlyRevenue: 0,
  color: `hsl(${i * 12}, 70%, 40%)`,
  personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
  relationship: 0,
  ownedActors: [],
  ownedScripts: [],
  activeProjects: []
}));

export const SEED_ACTORS: Actor[] = [
  {
    id: 'a1',
    name: 'Brad Fitt',
    age: 38,
    gender: 'Male',
    tier: ActorTier.AList,
    salary: 2000000,
    reputation: 95,
    skill: 90,
    genres: [Genre.Action, Genre.Drama],
    img: 'https://picsum.photos/100/100?random=1',
    status: 'Available',
    bio: 'The biggest heartthrob of the early 2000s. Known for eating in every scene.',
    visualDescription: 'Chiseled jawline, frosted tips, wears aviators indoors.',
    personality: ['Charismatic', 'Hungry'],
    relationships: { 'a2': 25, 'a3': 10 }
  },
  {
    id: 'a2',
    name: 'Julia Roberts-ish',
    age: 35,
    gender: 'Female',
    tier: ActorTier.AList,
    salary: 2200000,
    reputation: 98,
    skill: 88,
    genres: [Genre.Romance, Genre.Comedy],
    img: 'https://picsum.photos/100/100?random=2',
    status: 'Available',
    bio: 'America\'s sweetheart with a million dollar smile and a chaotic laugh.',
    visualDescription: 'Auburn curls, wide smile, often wears polka dots.',
    personality: ['Diva', 'Perfectionist'],
    relationships: { 'a1': 25, 'a5': 15 }
  },
  {
    id: 'a3',
    name: 'Keanu Reeves-alike',
    age: 39,
    gender: 'Male',
    tier: ActorTier.AList,
    salary: 1800000,
    reputation: 92,
    skill: 75,
    genres: [Genre.SciFi, Genre.Action],
    img: 'https://picsum.photos/100/100?random=3',
    status: 'Available',
    bio: 'A man of few words but many martial arts moves.',
    visualDescription: 'Sleek black hair, trench coat enthusiast, stoic expression.',
    personality: ['Humble', 'Stoic'],
    relationships: { 'a1': 10, 'a4': -5 }
  },
  {
    id: 'a4',
    name: 'Angelina J-ish',
    age: 28,
    gender: 'Female',
    tier: ActorTier.AList,
    salary: 1900000,
    reputation: 94,
    skill: 85,
    genres: [Genre.Action, Genre.Drama],
    img: 'https://picsum.photos/100/100?random=4',
    status: 'Available',
    bio: 'The ultimate action queen. Mysterious, intense, and loves vials of blood.',
    visualDescription: 'Full lips, leather-clad, looks ready for a heist.',
    personality: ['Intense', 'Mysterious'],
    relationships: { 'a1': 5, 'a3': -10 }
  },
  {
    id: 'a5',
    name: 'Tom C-ish',
    age: 41,
    gender: 'Male',
    tier: ActorTier.AList,
    salary: 2500000,
    reputation: 99,
    skill: 92,
    genres: [Genre.Action, Genre.Drama],
    img: 'https://picsum.photos/100/100?random=5',
    status: 'Available',
    bio: 'Does his own stunts. Always running. Might jump on your couch.',
    visualDescription: 'Intense grin, cockpit-ready, shorter than he looks on screen.',
    personality: ['Driven', 'Unstoppable'],
    relationships: { 'a2': 15, 'a1': 0 }
  }
];

export const SEED_SCRIPTS: Script[] = [
  {
    id: 's1',
    title: 'The Matrix: Re-Reloaded',
    genre: Genre.SciFi,
    quality: 85,
    complexity: 80,
    baseCost: 500000,
    currentBid: 500000,
    highBidderId: 'r3',
    description: 'Computers are taking over, again. More leather, more sunglasses.',
    tagline: 'Plug in. Drop out. Reboot.',
    requiredCast: 2,
    tone: 'Serious'
  },
  {
    id: 's2',
    title: 'My Big Fat Greek Wedding 2',
    genre: Genre.Romance,
    quality: 70,
    complexity: 40,
    baseCost: 200000,
    currentBid: 200000,
    highBidderId: 'r2',
    description: 'More windex, more family drama.',
    tagline: 'Love is a four letter word. Greek is not.',
    requiredCast: 2,
    tone: 'Lighthearted'
  }
];
