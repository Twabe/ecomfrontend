<script setup lang="ts">
import {
  CubeIcon,
  CheckCircleIcon,
  ArrowUturnLeftIcon,
  XCircleIcon,
  InboxArrowDownIcon,
  PhoneIcon,
  TruckIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  title: string
  count: number | null | undefined
  amount?: number | null
  percentage?: number | null
  icon: 'cube' | 'check' | 'arrow-turn' | 'x-circle' | 'inbox' | 'phone' | 'truck'
  color: 'blue' | 'green' | 'orange' | 'red' | 'indigo' | 'yellow' | 'purple' | 'gray' | 'cyan'
  clickable?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

// Icon mapping
const iconComponent = computed(() => {
  const icons = {
    cube: CubeIcon,
    check: CheckCircleIcon,
    'arrow-turn': ArrowUturnLeftIcon,
    'x-circle': XCircleIcon,
    inbox: InboxArrowDownIcon,
    phone: PhoneIcon,
    truck: TruckIcon,
  }
  return icons[props.icon]
})

// Color classes
const colorClasses = computed(() => {
  const colors = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      icon: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800',
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      icon: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
    },
    gray: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      icon: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
    },
    cyan: {
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      icon: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-200 dark:border-cyan-800',
    },
  }
  return colors[props.color]
})

// Format currency
const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return '-'
  return new Intl.NumberFormat('fr-MA', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + ' DH'
}

// Format percentage
const formatPercentage = (value: number | null | undefined): string => {
  if (value == null) return ''
  return value.toFixed(1) + '%'
}

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<template>
  <div
    :class="[
      'rounded-xl border p-4 transition-all duration-200',
      colorClasses.bg,
      colorClasses.border,
      clickable ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''
    ]"
    @click="handleClick"
  >
    <!-- Header with icon -->
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ title }}</span>
      <component :is="iconComponent" :class="['w-5 h-5', colorClasses.icon]" />
    </div>

    <!-- Count -->
    <div class="text-2xl font-bold text-gray-900 dark:text-white">
      {{ count ?? '-' }}
    </div>

    <!-- Amount -->
    <div v-if="amount !== undefined" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
      {{ formatCurrency(amount) }}
    </div>

    <!-- Percentage -->
    <div
      v-if="percentage !== undefined && percentage !== null"
      :class="['text-xs font-medium mt-1', colorClasses.icon]"
    >
      {{ formatPercentage(percentage) }}
    </div>
  </div>
</template>
