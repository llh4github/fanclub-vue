<template>
  <div
    v-if="payload && payload.length"
    class="chart-legend-content flex items-center justify-center gap-4"
    :class="[verticalAlign === 'top' ? 'pb-3' : 'pt-3', className]"
  >
    <div
      v-for="item in payload"
      :key="item.value"
      class="[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
    >
      <div v-if="getItemConfig(item)?.icon && !hideIcon">
        <!-- 图标组件 -->
      </div>
      <div
        v-else
        class="h-2 w-2 shrink-0 rounded-[2px]"
        :style="{ backgroundColor: item.color }"
      ></div>
      {{ getItemConfig(item)?.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'

const props = defineProps<{
  className?: string
  hideIcon?: boolean
  payload?: any[]
  verticalAlign?: 'top' | 'bottom'
  nameKey?: string
}>()

const chartContext = inject('chartContext') as any

if (!chartContext) {
  throw new Error('ChartLegendContent must be used within a ChartContainer')
}

const { config } = chartContext

const getPayloadConfigFromPayload = (config: any, payload: any, key: string) => {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }

  const payloadPayload =
    'payload' in payload && typeof payload.payload === 'object' && payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (key in payload && typeof payload[key as keyof typeof payload] === 'string') {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config]
}

const getItemConfig = (item: any) => {
  const key = `${props.nameKey || item.dataKey || 'value'}`
  return getPayloadConfigFromPayload(config, item, key)
}
</script>

<style scoped>
.chart-legend-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
</style>
