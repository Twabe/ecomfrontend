<script setup lang="ts">
import type { DashboardStatsDto } from '~/api/generated/models'

const props = defineProps<{
  stats: DashboardStatsDto | null | undefined
  isLoading: boolean
  showFullStats: boolean
  currentFilter?: {
    label: string
    count: number
    amount: number
  }
}>()

const emit = defineEmits<{
  cardClick: [filter: { state?: string; phase?: string; trackingState?: string } | null]
}>()

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// Get state data from ordersByState array
const getStateData = (state: string) => {
  return props.stats?.ordersByState?.find(
    s => s.state?.toLowerCase() === state.toLowerCase()
  )
}

// Get count by state from ordersByState array
const getCountByState = (state: string): number => {
  return getStateData(state)?.count ?? 0
}

// Get amount by state from ordersByState array
const getAmountByState = (state: string): number => {
  return getStateData(state)?.totalAmount ?? 0
}

// Get percentage by state
const getPercentageByState = (state: string): number | null => {
  return getStateData(state)?.percentage ?? null
}

// Calculate total amount
const totalAmount = computed(() => {
  return props.stats?.ordersByState?.reduce((sum, s) => sum + (s.totalAmount ?? 0), 0) ?? 0
})

// Card click handlers
const handleCardClick = (filter: { state?: string; phase?: string; trackingState?: string } | null) => {
  emit('cardClick', filter)

  // Navigate while preserving date filters
  const query: Record<string, string> = {}

  // Preserve date filters
  if (route.query.createdFrom) query.createdFrom = route.query.createdFrom as string
  if (route.query.createdTo) query.createdTo = route.query.createdTo as string
  if (route.query.datePreset) query.datePreset = route.query.datePreset as string

  // Add new filter
  if (filter) {
    if (filter.state) query.state = filter.state
    if (filter.phase) query.phase = filter.phase
    if (filter.trackingState) query.trackingState = filter.trackingState
  }

  router.push({ path: '/dashboard/orders', query })
}

// Format currency
const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return '-'
  return new Intl.NumberFormat('fr-MA', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + ' DH'
}
</script>

<template>
  <!-- Loading skeleton -->
  <div v-if="isLoading" class="mb-6">
    <div v-if="showFullStats" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      <div v-for="i in 8" :key="i" class="h-28 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
    </div>
    <div v-else class="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
  </div>

  <!-- Full stats grid (for all orders page) -->
  <div v-else-if="showFullStats" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
    <!-- Total -->
    <UiStatCard
      :title="$t('stats.total')"
      :count="stats?.orderStatistics?.totalOrders"
      :amount="totalAmount"
      icon="cube"
      color="blue"
      clickable
      @click="handleCardClick(null)"
    />

    <!-- Delivered -->
    <UiStatCard
      :title="$t('stats.delivered')"
      :count="getCountByState('delivered')"
      :amount="getAmountByState('delivered')"
      :percentage="getPercentageByState('delivered')"
      icon="check"
      color="green"
      clickable
      @click="handleCardClick({ state: 'delivered' })"
    />

    <!-- Returned -->
    <UiStatCard
      :title="$t('stats.returned')"
      :count="getCountByState('returned')"
      :amount="getAmountByState('returned')"
      :percentage="getPercentageByState('returned')"
      icon="arrow-turn"
      color="orange"
      clickable
      @click="handleCardClick({ state: 'returned' })"
    />

    <!-- Cancelled -->
    <UiStatCard
      :title="$t('stats.cancelled')"
      :count="getCountByState('cancelled')"
      :amount="getAmountByState('cancelled')"
      :percentage="getPercentageByState('cancelled')"
      icon="x-circle"
      color="red"
      clickable
      @click="handleCardClick({ state: 'cancelled' })"
    />

    <!-- Confirmed (ready for delivery) - state-based -->
    <UiStatCard
      :title="$t('stats.confirmed')"
      :count="getCountByState('confirmed')"
      :amount="getAmountByState('confirmed')"
      :percentage="getPercentageByState('confirmed')"
      icon="check"
      color="cyan"
      clickable
      @click="handleCardClick({ state: 'confirmed' })"
    />

    <!-- New (pending confirmations) - phase-based, no amount data available -->
    <UiStatCard
      :title="$t('stats.new')"
      :count="stats?.orderStatistics?.pendingConfirmations"
      icon="inbox"
      color="indigo"
      clickable
      @click="handleCardClick({ phase: 'new' })"
    />

    <!-- In Confirmation - phase-based, no amount data available -->
    <UiStatCard
      :title="$t('stats.confirmation')"
      :count="stats?.orderStatistics?.readyForDelivery"
      icon="phone"
      color="yellow"
      clickable
      @click="handleCardClick({ phase: 'confirmation' })"
    />

    <!-- In Delivery - phase-based, no amount data available -->
    <UiStatCard
      :title="$t('stats.inDelivery')"
      :count="stats?.orderStatistics?.inDelivery"
      icon="truck"
      color="purple"
      clickable
      @click="handleCardClick({ phase: 'shipping', trackingState: 'in_progress' })"
    />
  </div>

  <!-- Single summary bar (for filtered pages) -->
  <div
    v-else-if="currentFilter"
    class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
  >
    <div class="flex items-center gap-4">
      <span class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ currentFilter.count }}
      </span>
      <span class="text-gray-600 dark:text-gray-400">
        {{ currentFilter.label }}
      </span>
    </div>
    <div class="text-xl font-semibold text-primary-600 dark:text-primary-400">
      {{ formatCurrency(currentFilter.amount) }}
    </div>
  </div>
</template>
