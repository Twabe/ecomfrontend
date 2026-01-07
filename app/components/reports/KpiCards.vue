<script setup lang="ts">
import {
  ShoppingCartIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/vue/24/outline'

interface KpiData {
  totalOrders: number
  deliveryRate: number
  revenue: number
  netProfit: number
  roas: number
  previousPeriod?: {
    totalOrders?: number
    deliveryRate?: number
    revenue?: number
    netProfit?: number
    roas?: number
  }
}

interface Props {
  data: KpiData
  isLoading?: boolean
  currency?: string
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  currency: 'DH'
})

const { t } = useI18n()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + ' ' + props.currency
}

const formatPercentage = (value: number) => {
  return value.toFixed(1) + '%'
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('fr-MA').format(value)
}

const calculateChange = (current: number, previous?: number) => {
  if (!previous || previous === 0) return null
  return ((current - previous) / previous) * 100
}

const kpis = computed(() => [
  {
    key: 'totalOrders',
    label: t('reports.totalOrders'),
    value: formatNumber(props.data.totalOrders),
    change: calculateChange(props.data.totalOrders, props.data.previousPeriod?.totalOrders),
    icon: ShoppingCartIcon,
    color: 'bg-blue-500'
  },
  {
    key: 'deliveryRate',
    label: t('reports.deliveryRate'),
    value: formatPercentage(props.data.deliveryRate),
    change: props.data.previousPeriod?.deliveryRate
      ? props.data.deliveryRate - props.data.previousPeriod.deliveryRate
      : null,
    icon: TruckIcon,
    color: props.data.deliveryRate >= 80 ? 'bg-green-500' : props.data.deliveryRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
  },
  {
    key: 'revenue',
    label: t('reports.revenue'),
    value: formatCurrency(props.data.revenue),
    change: calculateChange(props.data.revenue, props.data.previousPeriod?.revenue),
    icon: CurrencyDollarIcon,
    color: 'bg-indigo-500'
  },
  {
    key: 'netProfit',
    label: t('reports.netProfit'),
    value: formatCurrency(props.data.netProfit),
    change: calculateChange(props.data.netProfit, props.data.previousPeriod?.netProfit),
    icon: ChartBarIcon,
    color: props.data.netProfit >= 0 ? 'bg-emerald-500' : 'bg-red-500'
  },
  {
    key: 'roas',
    label: 'ROAS',
    value: props.data.roas.toFixed(2) + 'x',
    change: props.data.previousPeriod?.roas
      ? ((props.data.roas - props.data.previousPeriod.roas) / props.data.previousPeriod.roas) * 100
      : null,
    icon: ArrowTrendingUpIcon,
    color: props.data.roas >= 2 ? 'bg-green-500' : props.data.roas >= 1 ? 'bg-yellow-500' : 'bg-red-500'
  }
])
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
    <template v-if="isLoading">
      <div
        v-for="i in 5"
        :key="i"
        class="animate-pulse rounded-lg bg-white p-6 shadow dark:bg-gray-800"
      >
        <div class="flex items-center justify-between">
          <div class="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div class="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div class="mt-4 h-6 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        <div class="mt-2 h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </template>

    <template v-else>
      <div
        v-for="kpi in kpis"
        :key="kpi.key"
        class="rounded-lg bg-white p-6 shadow dark:bg-gray-800"
      >
        <div class="flex items-center justify-between">
          <div :class="[kpi.color, 'rounded-lg p-2']">
            <component :is="kpi.icon" class="h-6 w-6 text-white" />
          </div>
          <div
            v-if="kpi.change !== null"
            :class="[
              'flex items-center gap-1 text-sm font-medium',
              kpi.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            ]"
          >
            <component
              :is="kpi.change >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon"
              class="h-4 w-4"
            />
            <span>{{ Math.abs(kpi.change).toFixed(1) }}%</span>
          </div>
        </div>
        <div class="mt-4">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ kpi.value }}
          </p>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ kpi.label }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
