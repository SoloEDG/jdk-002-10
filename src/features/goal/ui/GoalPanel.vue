<script setup lang="ts">
import { computed } from "vue";
import { GOAL_MIN, GOAL_MAX, GOAL_DEFAULT } from "../lib/goal";
import type { GoalEntry } from "../lib/storage";
const props = defineProps<{
  trackId: string;
  entry: GoalEntry | null;
  locked: boolean;
}>();
const emit = defineEmits<{
  set: [trackId: string, value: number];
  clear: [trackId: string];
}>();
const target = computed(() => props.entry?.target ?? null);
const achieved = computed(() => props.entry?.achieved === true);
function onInput(e: Event) {
  emit("set", props.trackId, Number((e.target as HTMLInputElement).value));
}
</script>
<template>
  <section class="goal panel">
    <div class="section-label">
      06 / ACCURACY GOAL
      <span v-if="achieved" class="goal-flag">已达标</span>
      <span v-else-if="entry">挑战中</span>
    </div>
    <div class="goal-heading">
      <h3>为这首曲目，设定准确率目标</h3>
      <p class="muted">目标范围 {{ GOAL_MIN }}%–{{ GOAL_MAX }}%，仅正式演出计入达标</p>
    </div>
    <div v-if="target === null" class="goal-empty">
      <p class="muted">尚未设置目标，演出中不会显示差距提示</p>
      <button
        class="goal-set-btn"
        :disabled="locked"
        @click="emit('set', trackId, GOAL_DEFAULT)"
      >
        设置目标 {{ GOAL_DEFAULT }}%
      </button>
    </div>
    <div v-else class="goal-config">
      <div class="goal-value-row">
        <span>目标准确率</span><b>{{ target }}<em>%</em></b>
      </div>
      <input
        class="goal-slider"
        type="range"
        :min="GOAL_MIN"
        :max="GOAL_MAX"
        step="1"
        :value="target"
        :disabled="locked"
        aria-label="准确率目标"
        @input="onInput"
      />
      <div class="goal-scale">
        <span>{{ GOAL_MIN }}%</span><span>{{ GOAL_MAX }}%</span>
      </div>
      <div class="goal-actions">
        <label class="goal-number"
          >精确值
          <input
            type="number"
            :min="GOAL_MIN"
            :max="GOAL_MAX"
            step="1"
            :value="target"
            :disabled="locked"
            aria-label="准确率目标精确值"
            @change="onInput"
        /></label>
        <button
          class="goal-clear"
          :disabled="locked"
          @click="emit('clear', trackId)"
        >
          移除目标
        </button>
      </div>
      <p v-if="locked" class="goal-locked">演出进行中，本局目标不可修改</p>
    </div>
  </section>
</template>
