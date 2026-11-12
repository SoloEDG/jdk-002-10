import type { Result, Run, Hit } from "../../../shared/session";
export function makeResult(
  run: Run,
  hits: Hit[],
  stats: {
    score: number;
    accuracy: number;
    fullAccuracy: number;
    maxCombo: number;
  },
): Result {
  // 达标判定只对正式演出有效，且以整首全部音符的准确率为准。
  const goalReached =
    !run.practice &&
    run.target !== null &&
    stats.fullAccuracy >= run.target;
  return {
    id: run.id,
    trackId: run.track.id,
    title: run.track.title,
    at: Date.now(),
    score: stats.score,
    accuracy: stats.accuracy,
    maxCombo: stats.maxCombo,
    hits: [...hits],
    practice: run.practice,
    speed: run.speed,
    target: run.target,
    goalReached,
  };
}
export function rank(accuracy: number) {
  return accuracy >= 98
    ? "S"
    : accuracy >= 90
      ? "A"
      : accuracy >= 75
        ? "B"
        : "C";
}
export function bestFor(records: Result[], trackId: string) {
  return records
    .filter((r) => r.trackId === trackId && !r.practice)
    .sort((a, b) => b.score - a.score)[0];
}
