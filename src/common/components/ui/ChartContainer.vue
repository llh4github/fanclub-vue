<template>
  <div
    class="chart-container [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden"
    data-slot="chart"
    :data-chart="chartId"
    :class="className"
  >
    <ChartStyle :id="chartId" :config="config" />
    <div class="w-full h-full">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, onMounted } from 'vue'
import ChartStyle from './ChartStyle.vue'

const props = defineProps<{
  id?: string
  className?: string
  config: any
}>()

const chartId = `chart-${props.id || Math.random().toString(36).substr(2, 9)}`

provide('chartContext', { config: props.config })
</script>

<style scoped>
.chart-container {
  position: relative;
}
</style>
