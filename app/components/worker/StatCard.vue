<template>
  <div class="card p-4">
    <div class="flex items-center gap-3">
      <div
        :class="[
          'p-3 rounded-lg',
          colorClasses.bg
        ]"
      >
        <component :is="icon" :class="['w-6 h-6', colorClasses.icon]" />
      </div>
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ label }}</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ count }}<span v-if="suffix" class="text-sm font-normal text-gray-500">{{ suffix }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ClockIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  PhoneIcon,
  TruckIcon,
  ShieldCheckIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InboxArrowDownIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'

type ColorVariant = 'yellow' | 'blue' | 'green' | 'purple' | 'red' | 'gray' | 'orange' | 'indigo'

const props = withDefaults(defineProps<{
  label: string
  count: number
  suffix?: string
  color?: ColorVariant
  iconType?: 'pending' | 'active' | 'completed' | 'callback' | 'delivery' | 'quality' | 'error' | 'warning' | 'available' | 'capacity'
}>(), {
  color: 'gray',
  iconType: 'pending'
})

const colorMap: Record<ColorVariant, { bg: string; icon: string }> = {
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    icon: 'text-yellow-600 dark:text-yellow-400'
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'bg-emerald-100 dark:bg-emerald-900',
    icon: 'text-emerald-600 dark:text-emerald-400'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900',
    icon: 'text-purple-600 dark:text-purple-400'
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900',
    icon: 'text-red-600 dark:text-red-400'
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    icon: 'text-gray-600 dark:text-gray-400'
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900',
    icon: 'text-orange-600 dark:text-orange-400'
  },
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-900',
    icon: 'text-indigo-600 dark:text-indigo-400'
  }
}

const iconMap = {
  pending: ClockIcon,
  active: ClipboardDocumentListIcon,
  completed: CheckCircleIcon,
  callback: PhoneIcon,
  delivery: TruckIcon,
  quality: ShieldCheckIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  available: InboxArrowDownIcon,
  capacity: UserIcon,
}

const colorClasses = computed(() => colorMap[props.color])
const icon = computed(() => iconMap[props.iconType])
</script>
