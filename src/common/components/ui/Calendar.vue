<template>
  <div class="calendar p-3" data-slot="calendar" :class="className">
    <div class="flex flex-col sm:flex-row gap-2">
      <div class="flex flex-col gap-4">
        <div class="flex justify-center pt-1 relative items-center w-full">
          <button
            class="nav-button absolute left-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            @click="$emit('prev-month')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span class="text-sm font-medium">{{ currentMonthYear }}</span>
          <button
            class="nav-button absolute right-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            @click="$emit('next-month')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
        <div class="w-full border-collapse space-x-1">
          <div class="flex">
            <div
              v-for="day in weekDays"
              :key="day"
              class="text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] flex items-center justify-center"
            >
              {{ day }}
            </div>
          </div>
          <div v-for="(week, index) in weeks" :key="index" class="flex w-full mt-2">
            <div
              v-for="(day, dayIndex) in week"
              :key="dayIndex"
              class="relative p-0 text-center text-sm focus-within:relative focus-within:z-20"
              :class="{
                'bg-accent': isSelected(day),
                'rounded-r-md': isRangeEnd(day),
                'rounded-l-md': isRangeStart(day),
                'text-muted-foreground': isOutsideMonth(day),
                'opacity-50': isDisabled(day),
              }"
            >
              <button
                class="size-8 p-0 font-normal hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
                :class="{
                  'bg-primary text-primary-foreground': isSelected(day),
                  'bg-accent text-accent-foreground': isToday(day),
                }"
                @click="$emit('select', day)"
                :disabled="isDisabled(day)"
              >
                {{ day.getDate() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  className?: string
  showOutsideDays?: boolean
  mode?: 'single' | 'range'
  selected?: Date | [Date, Date] | null
  disabled?: (date: Date) => boolean
  initialMonth?: Date
}>()

defineEmits<{
  (e: 'select', date: Date): void
  (e: 'prev-month'): void
  (e: 'next-month'): void
}>()

const currentMonth = ref(props.initialMonth || new Date())

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const currentMonthYear = computed(() => {
  return currentMonth.value.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
})

const weeks = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  for (let i = 0; i < 42; i++) {
    // 6 weeks * 7 days
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    currentWeek.push(currentDate)

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  return weeks
})

function isSelected(date: Date): boolean {
  if (!props.selected) return false

  if (props.mode === 'range' && Array.isArray(props.selected)) {
    const [start, end] = props.selected
    if (!start || !end) return false
    return date >= start && date <= end
  }

  return props.selected instanceof Date && isSameDay(date, props.selected)
}

function isRangeStart(date: Date): boolean {
  if (props.mode !== 'range' || !Array.isArray(props.selected) || !props.selected[0]) return false
  return isSameDay(date, props.selected[0])
}

function isRangeEnd(date: Date): boolean {
  if (props.mode !== 'range' || !Array.isArray(props.selected) || !props.selected[1]) return false
  return isSameDay(date, props.selected[1])
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

function isOutsideMonth(date: Date): boolean {
  return date.getMonth() !== currentMonth.value.getMonth()
}

function isDisabled(date: Date): boolean {
  return typeof props.disabled === 'function' && props.disabled(date)
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}
</script>

<style scoped>
.calendar {
  padding: 0.75rem;
}

.nav-button {
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background-color: transparent;
  padding: 0;
  width: 1.75rem;
  height: 1.75rem;
  opacity: 0.5;
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.nav-button:hover {
  opacity: 1;
}

.nav-button svg {
  width: 1rem;
  height: 1rem;
}

button {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 400;
  transition: all 0.2s ease;
  border-radius: 0.375rem;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
