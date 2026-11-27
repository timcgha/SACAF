import type {
  Answers,
  MaturityLevel,
  Question,
  SacafData,
  Score,
  Tier,
} from "../types";

export const TIERS: Tier[] = ["Foundational", "Operational", "Advanced"];

export const SCORE_OPTIONS: Score[] = [3, 2, 1, 0];

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function scoredValues(questions: Question[], answers: Answers): number[] {
  return questions
    .map((q) => answers[q.id]?.score)
    .filter((s): s is Score => s !== null && s !== undefined);
}

export function categoryAverage(
  category: string,
  questions: Question[],
  answers: Answers,
): number | null {
  return average(
    scoredValues(
      questions.filter((q) => q.category === category),
      answers,
    ),
  );
}

export function tierAverage(
  tier: Tier,
  questions: Question[],
  answers: Answers,
): number | null {
  return average(
    scoredValues(
      questions.filter((q) => q.tier === tier),
      answers,
    ),
  );
}

/** Match spreadsheet: overall = mean of the three tier averages. */
export function overallAverage(
  questions: Question[],
  answers: Answers,
): number | null {
  const tiers = TIERS.map((tier) => tierAverage(tier, questions, answers));
  if (tiers.some((t) => t === null)) return null;
  return average(tiers as number[]);
}

export function maturityKey(
  score: number | null,
): "initial" | "developing" | "optimized" | null {
  if (score === null) return null;
  if (score < 1.5) return "initial";
  if (score < 2.5) return "developing";
  return "optimized";
}

export function maturityFor(
  score: number | null,
  data: SacafData,
): MaturityLevel | null {
  const key = maturityKey(score);
  return key ? data.maturityLevels[key] : null;
}

export function tierDescription(
  tier: Tier,
  score: number | null,
  data: SacafData,
): string | null {
  const key = maturityKey(score);
  return key ? data.tierDescriptions[tier][key] : null;
}

export function formatScore(score: number | null): string {
  if (score === null) return "—";
  return score.toFixed(2);
}

export function answeredCount(questions: Question[], answers: Answers): number {
  return questions.filter((q) => answers[q.id]?.score !== null && answers[q.id]?.score !== undefined)
    .length;
}

export function isComplete(questions: Question[], answers: Answers): boolean {
  return answeredCount(questions, answers) === questions.length;
}

export function categoriesInOrder(questions: Question[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const q of questions) {
    if (!seen.has(q.category)) {
      seen.add(q.category);
      order.push(q.category);
    }
  }
  return order;
}

export interface RecommendationItem {
  question: Question;
  score: Score;
  notes: string;
}

export function recommendationsNeedingAttention(
  questions: Question[],
  answers: Answers,
): RecommendationItem[] {
  return questions
    .map((question) => {
      const answer = answers[question.id];
      const score = answer?.score;
      if (score === null || score === undefined || score >= 3) return null;
      return {
        question,
        score,
        notes: answer?.notes ?? "",
      };
    })
    .filter((item): item is RecommendationItem => item !== null);
}

export function matureItems(
  questions: Question[],
  answers: Answers,
): Question[] {
  return questions.filter((q) => answers[q.id]?.score === 3);
}
