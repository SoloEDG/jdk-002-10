import { clampGoal } from "./goal";
export type GoalEntry = { target: number; achieved: boolean };
export type GoalMap = Record<string, GoalEntry>;
const KEY = "pulse-goals-v1";
export function loadGoals(): GoalMap {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    const out: GoalMap = {};
    for (const [id, entry] of Object.entries(raw as Record<string, unknown>)) {
      if (!entry || typeof entry !== "object") continue;
      const e = entry as Record<string, unknown>;
      const target = Number(e.target);
      if (!Number.isFinite(target)) continue;
      out[id] = {
        target: clampGoal(target),
        achieved: e.achieved === true,
      };
    }
    return out;
  } catch {
    return {};
  }
}
export function saveGoals(goals: GoalMap): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(goals));
    return true;
  } catch {
    return false;
  }
}
