<script setup lang="ts">
import { computed } from "vue";
import type { Hit } from "../../../shared/session";
const props = defineProps<{
  score: number;
  accuracy: number;
  fullAccuracy: number;
  combo: number;
  maxCombo: number;
  hits: Hit[];
  target: number | null;
  practice: boolean;
}>();
const gap = computed(() =>
  props.target === null ? 0 : props.target - props.fullAccuracy,
);
const onTrack = computed(
  () => props.target !== null && props.fullAccuracy >= props.target,
);
</script>
<template>
  <section class="score-panel panel">
    <div class="section-label">
      03 / LIVE SCORE <span class="green">● LIVE</span>
    </div>
    <div class="big-score">{{ String(score).padStart(7, "0") }}</div>
    <div class="score-stats">
      <div>
        <small>ACCURACY</small><b>{{ accuracy.toFixed(2) }}<em>%</em></b>
      </div>
      <div>
        <small>MAX COMBO</small><b>{{ maxCombo }}<em>×</em></b>
      </div>
    </div>
    <div v-if="target !== null" class="goal-live" :class="{ practice }">
      <div class="goal-live-head">
        <span>目标 {{ target }}%</span>
        <b :class="{ reached: onTrack }">
          <template v-if="onTrack">领先 {{ (-gap).toFixed(1) }}%</template>
          <template v-else>还差 {{ gap.toFixed(1) }}%</template>
        </b>
      </div>
      <div class="goal-track">
        <i
          :style="{
            width: Math.min(100, (fullAccuracy / target) * 100) + '%',
          }"
        ></i>
        <em :style="{ left: target + '%' }"></em>
      </div>
      <p>
        全程准确率 {{ fullAccuracy.toFixed(1) }}%
        <small v-if="practice">· 练习不计入达标</small>
      </p>
    </div>
    <div class="combo-current">
      <span>当前连击</span><b>{{ combo }} <small>COMBO</small></b>
    </div>
    <div class="grade-list">
      <div
        v-for="g in ['PERFECT', 'GREAT', 'GOOD', 'MISS']"
        :key="g"
        :class="g.toLowerCase()"
      >
        <i></i><span>{{ g }}</span
        ><b>{{ hits.filter((h) => h.grade === g).length }}</b>
      </div>
    </div>
  </section>
</template>
