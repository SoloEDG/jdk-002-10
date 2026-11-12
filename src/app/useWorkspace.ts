import { computed, onMounted, onUnmounted, ref } from "vue";
import { useLibrary } from "../features/library";
import { usePerformance } from "../features/performance";
import { useJudgment, bindInput } from "../features/judgment";
import { usePractice } from "../features/practice";
import { useRecords, makeResult } from "../features/records";
import { useGoal } from "../features/goal";
import { makeRun } from "../shared/session";
import type { PracticeConfig } from "../shared/session";
import type { Lane } from "../shared/chart";

export function useWorkspace() {
  const library = useLibrary(),
    practice = usePractice(),
    judgment = useJudgment(),
    records = useRecords(),
    goal = useGoal(),
    error = ref("");
  const performance = usePerformance(
    (t) => judgment.tick(t),
    () => {
      const run = performance.run.value;
      if (!run) return;
      const result = makeResult(run, judgment.hits.value, judgment.stats.value);
      records.commit(result);
      // 仅正式演出完成时结算目标；练习与中途退出不会走到这里。
      goal.markResult(result);
    },
  );
  const locked = computed(
    () =>
      performance.phase.value === "playing" ||
      performance.phase.value === "paused",
  );
  async function start() {
    // 本局目标在开局时固定，播放中无法修改；重新开始沿用当前设置。
    const run = makeRun(
      library.selected.value,
      practice.config.value,
      goal.targetFor(library.selectedId.value),
    );
    judgment.reset(run);
    error.value = "";
    try {
      await performance.start(run);
    } catch {
      error.value = "音频未能启动，请再次点击开始";
      performance.reset();
    }
  }
  function select(id: string) {
    if (locked.value) return;
    library.select(id);
    practice.reset(library.selected.value.beats);
    performance.reset();
    judgment.reset(
      makeRun(
        library.selected.value,
        practice.config.value,
        goal.targetFor(library.selectedId.value),
      ),
    );
  }
  function down(lane: Lane) {
    if (performance.phase.value === "playing")
      judgment.down(lane, performance.time.value);
  }
  function up(lane: Lane) {
    if (performance.phase.value === "playing")
      judgment.up(lane, performance.time.value);
  }
  function pause() {
    performance.pause();
    judgment.clearHeld();
  }
  function toggle() {
    if (performance.phase.value === "playing") pause();
    else if (performance.phase.value === "paused") void performance.resume();
  }
  function updatePractice(patch: Partial<PracticeConfig>) {
    if (!locked.value) practice.update(patch, library.selected.value.beats);
  }
  function setGoal(trackId: string, value: number) {
    if (!locked.value && trackId === library.selectedId.value)
      goal.setTarget(trackId, value);
  }
  function clearGoal(trackId: string) {
    if (!locked.value && trackId === library.selectedId.value)
      goal.clearTarget(trackId);
  }
  let cleanup = () => {};
  const blur = () => {
    if (performance.phase.value === "playing") pause();
  };
  onMounted(() => {
    cleanup = bindInput(down, up, toggle);
    window.addEventListener("blur", blur);
  });
  onUnmounted(() => {
    cleanup();
    window.removeEventListener("blur", blur);
    performance.reset();
  });
  return {
    library,
    practice,
    judgment,
    records,
    goal,
    performance,
    locked,
    error,
    start,
    select,
    down,
    up,
    pause,
    updatePractice,
    setGoal,
    clearGoal,
  };
}
