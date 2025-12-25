<script setup lang="ts">
import {
  CalendarIcon,
  ChevronDownIcon,
} from '@heroicons/vue/24/outline'
import type { DatePreset, DateRange } from '~/utils/date'
import {
  getDateRangeFromPreset,
  formatDateForInput,
  formatDateRangeDisplay,
} from '~/utils/date'

const props = defineProps<{
  modelValue: DateRange
  preset?: DatePreset
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DateRange]
  'update:preset': [value: DatePreset]
}>()

const { t, locale } = useI18n()

const selectedPreset = ref<DatePreset>(props.preset || 'this_month')
const showCustomInputs = ref(false)
const customFrom = ref('')
const customTo = ref('')

// Preset options
const presets: { value: DatePreset; labelKey: string }[] = [
  { value: 'today', labelKey: 'date.today' },
  { value: 'yesterday', labelKey: 'date.yesterday' },
  { value: 'this_week', labelKey: 'date.thisWeek' },
  { value: 'last_week', labelKey: 'date.lastWeek' },
  { value: 'this_month', labelKey: 'date.thisMonth' },
  { value: 'last_month', labelKey: 'date.lastMonth' },
  { value: 'this_year', labelKey: 'date.thisYear' },
  { value: 'last_year', labelKey: 'date.lastYear' },
  { value: 'custom', labelKey: 'date.custom' },
]

// Select preset
const selectPreset = (preset: DatePreset) => {
  selectedPreset.value = preset
  emit('update:preset', preset)

  if (preset === 'custom') {
    showCustomInputs.value = true
    // Set custom inputs to current values
    customFrom.value = formatDateForInput(props.modelValue.from)
    customTo.value = formatDateForInput(props.modelValue.to)
  } else {
    showCustomInputs.value = false
    const range = getDateRangeFromPreset(preset)
    emit('update:modelValue', range)
  }
}

// Apply custom date range
const applyCustomRange = () => {
  const from = customFrom.value ? new Date(customFrom.value) : null
  const to = customTo.value ? new Date(customTo.value + 'T23:59:59.999') : null
  emit('update:modelValue', { from, to })
}

// Watch for external preset changes
watch(() => props.preset, (newPreset) => {
  if (newPreset && newPreset !== selectedPreset.value) {
    selectedPreset.value = newPreset
    showCustomInputs.value = newPreset === 'custom'
  }
})

// Display text
const displayText = computed(() => {
  if (selectedPreset.value === 'custom' && (props.modelValue.from || props.modelValue.to)) {
    return formatDateRangeDisplay(props.modelValue, locale.value)
  }
  const preset = presets.find(p => p.value === selectedPreset.value)
  return preset ? t(preset.labelKey) : ''
})
</script>

<template>
  <div class="date-range-filter">
    <!-- Preset buttons (horizontal scroll on mobile) -->
    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      <button
        v-for="preset in presets"
        :key="preset.value"
        type="button"
        @click="selectPreset(preset.value)"
        :class="[
          'px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors',
          selectedPreset === preset.value
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        ]"
      >
        <CalendarIcon v-if="preset.value === 'custom'" class="w-4 h-4 inline-block mr-1" />
        {{ $t(preset.labelKey) }}
      </button>
    </div>

    <!-- Custom date inputs -->
    <Transition name="slide-down">
      <div
        v-if="showCustomInputs"
        class="mt-3 flex flex-wrap gap-3 items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">{{ $t('date.from') }}</label>
          <input
            type="date"
            v-model="customFrom"
            class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <span class="text-gray-400">→</span>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">{{ $t('date.to') }}</label>
          <input
            type="date"
            v-model="customTo"
            class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          type="button"
          @click="applyCustomRange"
          class="px-4 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {{ $t('common.apply') }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  height: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background: #475569;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
