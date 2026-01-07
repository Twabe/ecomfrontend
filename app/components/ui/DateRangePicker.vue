<script setup lang="ts">
import { CalendarIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

interface DateRange {
  startDate: string
  endDate: string
}

interface Props {
  modelValue: DateRange
}

interface Emits {
  (e: 'update:modelValue', value: DateRange): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const presets = computed(() => [
  { label: t('reports.today'), days: 0 },
  { label: t('reports.last7Days'), days: 7 },
  { label: t('reports.last30Days'), days: 30 },
  { label: t('reports.thisMonth'), days: -1 },
  { label: t('reports.lastMonth'), days: -2 }
])

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

const getDateRange = (preset: { days: number }): DateRange => {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  let startDate: Date
  let endDate = today

  if (preset.days === 0) {
    // Today
    startDate = new Date(today)
    startDate.setHours(0, 0, 0, 0)
  } else if (preset.days === -1) {
    // This month
    startDate = new Date(today.getFullYear(), today.getMonth(), 1)
  } else if (preset.days === -2) {
    // Last month
    startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    endDate = new Date(today.getFullYear(), today.getMonth(), 0)
  } else {
    // Last N days
    startDate = new Date(today)
    startDate.setDate(today.getDate() - preset.days)
    startDate.setHours(0, 0, 0, 0)
  }

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  }
}

const selectPreset = (preset: { days: number }) => {
  emit('update:modelValue', getDateRange(preset))
  isOpen.value = false
}

const customStartDate = ref(props.modelValue.startDate)
const customEndDate = ref(props.modelValue.endDate)

watch(() => props.modelValue, (newVal) => {
  customStartDate.value = newVal.startDate
  customEndDate.value = newVal.endDate
}, { deep: true })

const applyCustomRange = () => {
  if (customStartDate.value && customEndDate.value) {
    emit('update:modelValue', {
      startDate: customStartDate.value,
      endDate: customEndDate.value
    })
    isOpen.value = false
  }
}

const displayLabel = computed(() => {
  const start = new Date(props.modelValue.startDate)
  const end = new Date(props.modelValue.endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  // Check if it's today
  if (diffDays === 0 && start.toDateString() === today.toDateString()) {
    return t('reports.today')
  }
  // Check if it's last 7 days
  if (diffDays === 7) {
    return t('reports.last7Days')
  }
  // Check if it's last 30 days
  if (diffDays === 30) {
    return t('reports.last30Days')
  }

  // Custom range display
  const formatDisplay = (date: Date) => date.toLocaleDateString()
  return `${formatDisplay(start)} - ${formatDisplay(end)}`
})

// Close dropdown when clicking outside
onClickOutside(dropdownRef, () => {
  isOpen.value = false
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      @click="isOpen = !isOpen"
    >
      <CalendarIcon class="h-5 w-5 text-gray-400" />
      <span>{{ displayLabel }}</span>
      <ChevronDownIcon class="h-4 w-4 text-gray-400" />
    </button>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700"
      >
        <div class="p-4">
          <!-- Presets -->
          <div class="space-y-1">
            <button
              v-for="preset in presets"
              :key="preset.days"
              type="button"
              class="block w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              @click="selectPreset(preset)"
            >
              {{ preset.label }}
            </button>
          </div>

          <!-- Divider -->
          <div class="my-3 border-t border-gray-200 dark:border-gray-700" />

          <!-- Custom Range -->
          <div class="space-y-3">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
              {{ t('reports.customRange') }}
            </p>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {{ t('reports.from') }}
                </label>
                <input
                  v-model="customStartDate"
                  type="date"
                  class="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {{ t('reports.to') }}
                </label>
                <input
                  v-model="customEndDate"
                  type="date"
                  class="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <button
              type="button"
              class="w-full rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              @click="applyCustomRange"
            >
              {{ t('reports.apply') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
