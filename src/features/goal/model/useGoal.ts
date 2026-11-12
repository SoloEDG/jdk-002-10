import { computed, ref } from "vue";
import type { Result } from "../../../shared/session";
import { clampGoal } from "../lib/goal";
import { loadGoals, saveGoals, type GoalMap } from "../lib/storage";
export function useGoal() {
  const goals = ref<GoalMap>(loadGoals());
  const warning = ref("");
  const achievedIds = computed(
    () =>
      new Set(
        Object.entries(goals.value)
          .filter(([, e]) => e.achieved)
          .map(([id]) => id),
      ),
  );
  function persist() {
    if (!saveGoals(goals.value))
      warning.value = "存储空间不足，目标标记仅在当前页面保留";
  }
  function entryFor(trackId: string) {
    return goals.value[trackId] ?? null;
  }
  function targetFor(trackId: string): number | null {
    return entryFor(trackId)?.target ?? null;
  }
  function isAchieved(trackId: string): boolean {
    return achievedIds.value.has(trackId);
  }
  function setTarget(trackId: string, value: number) {
    const target = clampGoal(value);
    const prev = goals.value[trackId];
    // 目标变化后，旧目标下的达标标记不再代表当前目标，重新挑战。
    goals.value = {
      ...goals.value,
      [trackId]: { target, achieved: prev?.target === target && prev.achieved },
    };
    persist();
  }
  function clearTarget(trackId: string) {
    if (!(trackId in goals.value)) return;
    const next = { ...goals.value };
    delete next[trackId];
    goals.value = next;
    persist();
  }
  // 只在正式演出结束时结算；练习与未完成退出不会写入达标标记。
  function markResult(result: Result) {
    if (result.practice || result.target === null || result.target === undefined)
      return;
    const entry = goals.value[result.trackId];
    if (!entry || entry.target !== result.target) return;
    if (entry.achieved || !result.goalReached) return;
    goals.value = {
      ...goals.value,
      [result.trackId]: { target: entry.target, achieved: true },
    };
    persist();
  }
  return {
    goals,
    warning,
    achievedIds,
    entryFor,
    targetFor,
    isAchieved,
    setTarget,
    clearTarget,
    markResult,
  };
}
