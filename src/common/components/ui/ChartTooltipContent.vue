<template>
  <div
    v-if="active && payload && payload.length"
    class="chart-tooltip-content border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl"
    :class="className"
  >
    <div v-if="!nestLabel">
      {{ tooltipLabel }}
    </div>
    <div class="grid gap-1.5">
      <div
        v-for="(item, index) in payload"
        :key="item.dataKey"
        class="[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5"
        :class="{ 'items-center': indicator === 'dot' }"
      >
        <template v-if="formatter && item.value !== undefined && item.name">
          {{ formatter(item.value, item.name, item, index, item.payload) }}
        </template>
        <template v-else>
          <div v-if="itemConfig?.icon">
            <!-- 图标组件 -->
          </div>
          <div
            v-else-if="!hideIndicator"
            class="shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)"
            :class="{
              'h-2.5 w-2.5': indicator === 'dot',
              'w-1': indicator === 'line',
              'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
              'my-0.5': nestLabel && indicator === 'dashed',
            }"
            :style="{ '--color-bg': indicatorColor, '--color-border': indicatorColor }"
          ></div>
          <div
            class="flex flex-1 justify-between leading-none"
            :class="{ 'items-end': nestLabel, 'items-center': !nestLabel }"
          >
            <div class="grid gap-1.5">
              <div v-if="nestLabel">
                {{ tooltipLabel }}
              </div>
              <span class="text-muted-foreground">
                {{ itemConfig?.label || item.name }}
              </span>
            </div>
            <span v-if="item.value" class="text-foreground font-mono font-medium tabular-nums">
              {{ item.value.toLocaleString() }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'

const props = defineProps<{
  active?: boolean
  payload?: any[]
  className?: string
  indicator?: 'line' | 'dot' | 'dashed'
  hideLabel?: boolean
  hideIndicator?: boolean
  label?: any
  labelFormatter?: (value: any, payload: any[]) => any
  labelClassName?: string
  formatter?: (value: any, name: any, item: any, index: number, payload: any) => any
  color?: string
  nameKey?: string
  labelKey?: string
}>()

const chartContext = inject('chartContext') as any

if (!chartContext) {
  throw new Error('ChartTooltipContent must be used within a ChartContainer')
}

const { config } = chartContext

const tooltipLabel = computed(() => {
  if (props.hideLabel || !props.payload?.length) {
    return null
  }

  const [item] = props.payload
  const key = `${props.labelKey || item?.dataKey || item?.name || 'value'}`
  const itemConfig = getPayloadConfigFromPayload(config, item, key)
  const value =
    !props.labelKey && typeof props.label === 'string'
      ? config[props.label as keyof typeof config]?.label || props.label
      : itemConfig?.label

  if (props.labelFormatter) {
    return props.labelFormatter(value, props.payload!)
  }

  if (!value) {
    return null
  }

  return value
})

const nestLabel = computed(() => {
  return props.payload?.length === 1 && props.indicator !== 'dot'
})

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

const indicatorColor = computed(() => {
  return props.color || props.payload?.[0]?.payload?.fill || props.payload?.[0]?.color
})

const itemConfig = computed(() => {
  if (!props.payload?.length) return null
  const [item] = props.payload
  const key = `${props.nameKey || item.name || item.dataKey || 'value'}`
  return getPayloadConfigFromPayload(config, item, key)
})
</script>

<style scoped>
.chart-tooltip-content {
  z-index: 1000;
}
</style>
