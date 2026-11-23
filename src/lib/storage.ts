import type { Answers } from "../types";

const STORAGE_KEY = "sacaf-assessment-v0.6";

export function loadAnswers(): Answers {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Answers;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveAnswers(answers: Answers): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}

export function clearAnswers(): void {
  localStorage.removeItem(STORAGE_KEY);
}
