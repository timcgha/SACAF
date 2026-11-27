export type Score = 0 | 1 | 2 | 3;

export type Tier = "Foundational" | "Operational" | "Advanced";

export interface Question {
  id: number;
  tier: Tier;
  category: string;
  question: string;
  recommendation: string;
  impact: string;
}

export interface MaturityLevel {
  min: number;
  max: number;
  label: string;
  description: string;
}

export interface SacafData {
  title: string;
  version: string;
  scoreLabels: Record<string, string>;
  maturityLevels: Record<"initial" | "developing" | "optimized", MaturityLevel>;
  tierDescriptions: Record<Tier, Record<"initial" | "developing" | "optimized", string>>;
  questions: Question[];
}

export interface Answer {
  score: Score | null;
  notes: string;
}

export type Answers = Record<number, Answer>;

export type View = "home" | "assessment" | "report" | "privacy";

export interface ReturnState {
  view: Exclude<View, "privacy">;
  index: number;
}
