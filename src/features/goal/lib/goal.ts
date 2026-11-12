// 准确率目标只允许在 70% ~ 100% 之间。
export const GOAL_MIN = 70;
export const GOAL_MAX = 100;
export const GOAL_DEFAULT = 80;
export function clampGoal(value: number): number {
  if (!Number.isFinite(value)) return GOAL_DEFAULT;
  return Math.max(GOAL_MIN, Math.min(GOAL_MAX, Math.round(value)));
}
