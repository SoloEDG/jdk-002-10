<script setup lang="ts">
import { computed } from "vue";
import type { Track, Lane } from "../../../shared/chart";
import type { Phase, Run } from "../../../shared/session";
import { laneLabels } from "../../../shared/chart";
import { noteY, tailHeight, visibleNotes } from "../lib/geometry";
const props = defineProps<{
  track: Track;
  run: Run | null;
  time: number;
  phase: Phase;
  done: Set<string>;
  held: Set<Lane>;
  feedback: string;
  combo: number;
  fullAccuracy: number;
}>();
defineEmits<{ down: [lane: Lane]; up: [lane: Lane] }>();
const notes = computed(() =>
  visibleNotes(
    props.run?.notes ?? props.track.notes,
    props.time,
    props.track.bpm,
    props.done,
  ),
);
const goalResult = computed(() => {
  const r = props.run;
  if (props.phase !== "finished" || !r || r.target === null) return null;
  const reached = props.fullAccuracy >= r.target;
  return {
    practice: r.practice,
    target: r.target,
    reached,
    gap: Math.abs(r.target - props.fullAccuracy),
  };
});
</script>
<template>
  <div class="stage">
    <div class="stage-grid"></div>
    <div class="lane-head">
      <span v-for="label in laneLabels" :key="label">{{ label }}</span>
    </div>
    <div class="lane-lines"><i v-for="i in 5" :key="i"></i></div>
    <div v-if="phase === 'ready'" class="stage-message">
      <div class="stage-symbol">⌁</div>
      <h3>READY TO FEEL?</h3>
      <p>戴上耳机，进入你的节奏</p>
      <span>← ↓ ↑ → / D F J K</span>
    </div>
    <div v-if="phase === 'paused'" class="stage-message paused">
      <h3>PAUSED</h3>
      <p>节拍在这里等你</p>
    </div>
    <div v-if="phase === 'finished'" class="stage-message paused">
      <h3>TRACK COMPLETE</h3>
      <p>这一刻，属于你</p>
      <div
        v-if="goalResult"
        class="goal-result"
        :class="{
          reached: goalResult.reached && !goalResult.practice,
          practice: goalResult.practice,
        }"
      >
        <template v-if="goalResult.practice">
          <strong>练习不计入达标</strong>
          <small>目标 {{ goalResult.target }}% · 全程准确率
            {{ fullAccuracy.toFixed(1) }}%</small
          >
        </template>
        <template v-else-if="goalResult.reached">
          <strong>目标达成 ✓</strong>
          <small
            >{{ goalResult.target }}% 目标 · 领先
            {{ goalResult.gap.toFixed(1) }}%</small
          >
        </template>
        <template v-else>
          <strong>未达目标</strong>
          <small
            >目标 {{ goalResult.target }}% · 还差
            {{ goalResult.gap.toFixed(1) }}%</small
          >
        </template>
      </div>
    </div>
    <template v-for="n in notes" :key="n.id"
      ><div
        v-for="lane in n.lanes"
        :key="lane"
        class="note"
        :class="{
          'hold-note': n.duration > 0,
          'chord-note': n.lanes.length > 1,
        }"
        :style="{
          left: lane * 25 + 2 + '%',
          top: noteY(n, time, track.bpm) + 'px',
        }"
      >
        <div
          v-if="n.duration"
          class="tail"
          :style="{ height: tailHeight(n, track.bpm) + 'px' }"
        ></div>
        <b>{{ laneLabels[lane] }}</b>
      </div></template
    >
    <div v-if="phase === 'playing'" class="judgment-float">
      <strong>{{ feedback }}</strong
      ><span v-if="combo > 1">{{ combo }}<small> COMBO</small></span>
    </div>
    <div class="hit-line"></div>
    <div class="receptors">
      <button
        v-for="(label, i) in laneLabels"
        :key="label"
        :class="{ pressed: held.has(i as Lane) }"
        :aria-label="'轨道' + label"
        @pointerdown.prevent="
          ($event.target as HTMLElement).setPointerCapture($event.pointerId);
          $emit('down', i as Lane);
        "
        @pointerup="$emit('up', i as Lane)"
        @pointercancel="$emit('up', i as Lane)"
      >
        {{ label }}<small>{{ ["D", "F", "J", "K"][i] }}</small>
      </button>
    </div>
  </div>
</template>
