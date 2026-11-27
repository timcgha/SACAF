import type { ReturnState, View } from "../types";

const RETURN_KEY = "sacaf-return-v0.6";

export function saveReturnState(view: View, index: number): void {
  if (view === "privacy") return;
  const payload: ReturnState = { view, index };
  sessionStorage.setItem(RETURN_KEY, JSON.stringify(payload));
}

export function loadReturnState(): ReturnState {
  try {
    const raw = sessionStorage.getItem(RETURN_KEY);
    if (!raw) return { view: "home", index: 0 };
    const parsed = JSON.parse(raw) as ReturnState;
    if (
      parsed &&
      (parsed.view === "home" ||
        parsed.view === "assessment" ||
        parsed.view === "report") &&
      typeof parsed.index === "number"
    ) {
      return parsed;
    }
  } catch {
    // fall through
  }
  return { view: "home", index: 0 };
}

export function clearReturnState(): void {
  sessionStorage.removeItem(RETURN_KEY);
}
