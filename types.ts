export enum Genre {
  Action = "Action",
  Comedy = "Comedy",
  Drama = "Drama",
  SciFi = "Sci-Fi",
  Horror = "Horror",
  Romance = "Romance",
  Thriller = "Thriller",
  Fantasy = "Fantasy",
}

// Studio Reputation Tiers
export enum StudioTier {
  Unknown = "Unknown",
  Indie = "Indie Studio",
  Rising = "Rising Studio",
  Major = "Major Studio",
  Legendary = "Legendary",
}

export interface StudioTierInfo {
  tier: StudioTier;
  minReputation: number;
  maxReputation: number;
  allowedActorTiers: ActorTier[];
  salaryDiscount: number; // percentage discount on actor salaries
  description: string;
  color: string;
}

export enum ActorTier {
  AList = "A-List",
  BList = "B-List",
  CList = "C-List",
  IndieDarling = "Indie Darling",
  Newcomer = "Newcomer",
}

export interface Actor {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  tier: ActorTier;
  salary: number;
  reputation: number;
  skill: number;
  genres: Genre[];
  img: string;
  status: "Available" | "In Production" | "Retired" | "Deceased" | "On Hiatus";
  bio: string;
  visualDescription: string;
  personality: string[];
  relationships: Record<string, number>;
  gossip?: string[];
}

export interface Script {
  id: string;
  title: string;
  genre: Genre;
  tagline: string;
  quality: number;
  complexity: number;
  baseCost: number;
  currentBid: number;
  highBidderId: string | null; // 'player' or rivalId or null
  description: string;
  requiredCast: number;
  tone:
    | "Serious"
    | "Lighthearted"
    | "Dark"
    | "Quirky"
    | "Melancholic"
    | "Uplifting";
}

export enum ProjectStatus {
  PreProduction = "Pre-Production",
  Filming = "Filming",
  PostProduction = "Post-Production",
  Released = "Released",
}

export interface Movie {
  id: string;
  scriptId: string;
  studioId: string; // 'player' or rivalId
  title: string;
  genre: Genre;
  cast: string[];
  marketingBudget: number;
  productionBudget: number;
  progress: number;
  status: ProjectStatus;
  quality: number;
  chemistry: number;
  revenue: number;
  releaseMonth: number;
  releaseYear: number;
  reviews?: string[];
}

export interface RivalStudio {
  id: string;
  name: string;
  reputation: number;
  balance: number;
  yearlyRevenue: number;
  color: string;
  personality: "Aggressive" | "Friendly" | "Elitist" | "Chaotic";
  relationship: number; // -100 to 100
  ownedActors: string[]; // IDs
  ownedScripts: string[]; // IDs
  activeProjects: string[]; // Titles
}

export interface GameState {
  month: number;
  year: number;
  balance: number;
  reputation: number;
  actors: Actor[];
  marketScripts: Script[];
  ownedScripts: Script[];
  projects: Movie[];
  rivals: RivalStudio[];
  events: GameEvent[];
  playerName: string;
  studioName: string;
  messages: StudioMessage[];
}

export interface StudioMessage {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  month: number;
  isPublic: boolean;
}

export interface GameEvent {
  id: string;
  month: number;
  message: string;
  type: "INFO" | "GOOD" | "BAD" | "AUCTION" | "GOSSIP" | "AD";
  read: boolean;
}

export interface ActorContract {
  id: string;
  actorId: string;
  studioId: string;
  startMonth: number;
  startYear: number;
  durationMonths: 3 | 6 | 12;
  monthlySalary: number;
  signingBonus: number;
  status: "active" | "expired" | "terminated" | "bought_out";
  createdAt: string;
}
