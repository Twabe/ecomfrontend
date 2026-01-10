<script setup lang="ts">
import {
  useCampaignAnalyticsService,
  useCampaignFilters,
  getRateColor,
  type CampaignAnalyticsParams,
  type CampaignPerformanceDto,
} from '~/services/campaign-analytics/useCampaignAnalyticsService'
import { useStoresService } from '~/services'
import { exportToPdf, exportToExcel } from '~/services/reports/useReportsService'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Dashboard.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Date range state - default to last 30 days
const getDefaultDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 30)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  }
}

const dateRange = ref(getDefaultDateRange())

// Filters
const selectedSource = ref<string | null>(null)
const selectedCampaign = ref<string | null>(null)
const selectedStoreId = ref<string | null>(null)

// Campaign filters service
const {
  sourceOptions,
  campaignOptions,
  isLoadingSources,
  isLoadingCampaigns,
  selectedSource: filterSource,
} = useCampaignFilters()

// Sync selected source with filter service
watch(selectedSource, (val) => {
  filterSource.value = val
  // Reset campaign when source changes
  selectedCampaign.value = null
})

// Stores service for filter dropdown
const { items: stores } = useStoresService()

// Campaign analytics service params
const campaignParams = computed<CampaignAnalyticsParams>(() => ({
  startDate: dateRange.value.startDate,
  endDate: dateRange.value.endDate,
  source: selectedSource.value,
  campaign: selectedCampaign.value,
  storeId: selectedStoreId.value,
}))

const {
  summary,
  campaigns,
  sources,
  contents,
  funnel,
  dailyTrend,
  trendChartData,
  sourceChartData,
  topCampaignsByRevenue,
  isLoading,
} = useCampaignAnalyticsService(campaignParams)

// Export handlers
const isExporting = ref(false)

const handleExportPdf = async () => {
  isExporting.value = true
  try {
    await exportToPdf('campaigns-content', `campaign-analytics-${dateRange.value.startDate}-${dateRange.value.endDate}.pdf`)
    notify({ type: 'success', message: t('reports.exportSuccess') })
  } catch (error) {
    notify({ type: 'error', message: t('reports.exportError') })
  } finally {
    isExporting.value = false
  }
}

const handleExportExcel = async () => {
  isExporting.value = true
  try {
    const exportData = [
      // Summary KPIs
      { type: 'KPI', metric: t('campaigns.totalOrders'), value: summary.value.totalOrders },
      { type: 'KPI', metric: t('campaigns.trackedOrders'), value: summary.value.trackedOrders },
      { type: 'KPI', metric: t('campaigns.trackingCoverage'), value: summary.value.trackingCoverage.toFixed(1) + '%' },
      { type: 'KPI', metric: t('campaigns.confirmationRate'), value: summary.value.overallConfirmationRate.toFixed(1) + '%' },
      { type: 'KPI', metric: t('campaigns.deliveryRate'), value: summary.value.overallDeliveryRate.toFixed(1) + '%' },
      { type: 'KPI', metric: t('campaigns.returnRate'), value: summary.value.overallReturnRate.toFixed(1) + '%' },
      { type: 'KPI', metric: t('campaigns.totalRevenue'), value: summary.value.totalRevenue },
      // Campaigns
      ...campaigns.value.map(c => ({
        type: t('campaigns.campaignDetails'),
        source: c.source,
        campaign: c.campaign,
        medium: c.medium,
        totalOrders: c.totalOrders,
        confirmationRate: c.confirmationRate.toFixed(1) + '%',
        deliveryRate: c.deliveryRate.toFixed(1) + '%',
        returnRate: c.returnRate.toFixed(1) + '%',
        revenue: c.revenue,
      })),
      // Sources
      ...sources.value.map(s => ({
        type: t('campaigns.sourceDetails'),
        source: s.source,
        totalOrders: s.totalOrders,
        confirmationRate: s.confirmationRate.toFixed(1) + '%',
        deliveryRate: s.deliveryRate.toFixed(1) + '%',
        returnRate: s.returnRate.toFixed(1) + '%',
        revenue: s.revenue,
      })),
    ]

    await exportToExcel(exportData, `campaign-analytics-${dateRange.value.startDate}-${dateRange.value.endDate}.xlsx`)
    notify({ type: 'success', message: t('reports.exportSuccess') })
  } catch (error) {
    notify({ type: 'error', message: t('reports.exportError') })
  } finally {
    isExporting.value = false
  }
}

// Chart series for trend
const trendSeries = computed(() => [
  { name: t('campaigns.orders'), data: trendChartData.value.orders },
  { name: t('campaigns.confirmed'), data: trendChartData.value.confirmed },
  { name: t('campaigns.delivered'), data: trendChartData.value.delivered },
])

// Source colors for donut
const sourceColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

// Currency formatter
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val) + ' DH'
}

// Rate formatter
const formatRate = (val: number) => {
  return val.toFixed(1) + '%'
}

// Get rate badge classes
const getRateBadgeClasses = (rate: number, type: 'confirmation' | 'delivery' | 'return') => {
  if (type === 'return') {
    // For return rate, lower is better
    if (rate <= 5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (rate <= 10) return 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300'
    if (rate <= 20) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  // For confirmation and delivery rate, higher is better
  const thresholds = type === 'confirmation' ? [80, 70, 60] : [90, 80, 70]

  if (rate >= thresholds[0]) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  if (rate >= thresholds[1]) return 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300'
  if (rate >= thresholds[2]) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

// Mobile view toggle
const isMobileView = ref(false)

// Check screen size on mount
onMounted(() => {
  const checkMobile = () => {
    isMobileView.value = window.innerWidth < 768
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)
  onUnmounted(() => window.removeEventListener('resize', checkMobile))
})
</script>

<template>
  <div id="campaigns-content" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('campaigns.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('campaigns.subtitle') }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <UiDateRangePicker v-model="dateRange" />
        <ReportsExportButtons
          :is-exporting="isExporting"
          @export-pdf="handleExportPdf"
          @export-excel="handleExportExcel"
        />
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4">
      <!-- Source Filter -->
      <div class="w-48">
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('campaigns.source') }}
        </label>
        <select
          v-model="selectedSource"
          :disabled="isLoadingSources"
          class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option :value="null">{{ t('campaigns.allSources') }}</option>
          <option v-for="source in sourceOptions" :key="source" :value="source">
            {{ source }}
          </option>
        </select>
      </div>

      <!-- Campaign Filter -->
      <div class="w-64">
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('campaigns.campaign') }}
        </label>
        <select
          v-model="selectedCampaign"
          :disabled="isLoadingCampaigns"
          class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option :value="null">{{ t('campaigns.allCampaigns') }}</option>
          <option v-for="campaign in campaignOptions" :key="campaign" :value="campaign">
            {{ campaign }}
          </option>
        </select>
      </div>

      <!-- Store Filter -->
      <div class="w-48">
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('common.store') }}
        </label>
        <select
          v-model="selectedStoreId"
          class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option :value="null">{{ t('common.allStores') }}</option>
          <option v-for="store in stores" :key="store.id" :value="store.id">
            {{ store.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <!-- Total Orders (All) -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ t('campaigns.totalOrders') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-xl font-bold text-gray-900 dark:text-white">
          {{ summary.totalOrders.toLocaleString() }}
        </div>
        <div v-if="!isLoading" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ t('campaigns.totalOrdersDesc') }}
        </div>
      </div>

      <!-- Tracked Orders (UTM) -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ t('campaigns.trackedOrders') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-xl font-bold text-blue-600 dark:text-blue-400">
          {{ summary.trackedOrders }}
        </div>
        <div v-if="!isLoading" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ formatRate(summary.trackingCoverage) }} du total
        </div>
      </div>

      <!-- Confirmation Rate -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ t('campaigns.confirmationRate') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-xl font-bold" :class="getRateColor(summary.overallConfirmationRate, 'confirmation')">
          {{ formatRate(summary.overallConfirmationRate) }}
        </div>
        <div v-if="!isLoading" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ t('campaigns.confirmationRateDesc') }}
        </div>
      </div>

      <!-- Delivery Rate -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ t('campaigns.deliveryRate') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-xl font-bold" :class="getRateColor(summary.overallDeliveryRate, 'delivery')">
          {{ formatRate(summary.overallDeliveryRate) }}
        </div>
        <div v-if="!isLoading" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ t('campaigns.deliveryRateDesc') }}
        </div>
      </div>

      <!-- Return Rate -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ t('campaigns.returnRate') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-xl font-bold" :class="getRateColor(summary.overallReturnRate, 'return')">
          {{ formatRate(summary.overallReturnRate) }}
        </div>
        <div v-if="!isLoading" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ t('campaigns.returnRateDesc') }}
        </div>
      </div>

      <!-- Total Revenue -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ t('campaigns.totalRevenue') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-xl font-bold text-green-600 dark:text-green-400">
          {{ formatCurrency(summary.totalRevenue) }}
        </div>
        <div v-if="!isLoading" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ t('campaigns.revenueDesc') }}
        </div>
      </div>
    </div>

    <!-- Marketing Metrics Row (CAC, ROAS, Ad Spend) -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <!-- Ad Spend -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ t('campaigns.adSpend') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-xl font-bold text-orange-600 dark:text-orange-400">
          {{ formatCurrency(summary.totalAdSpend) }}
        </div>
      </div>

      <!-- New Customers -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ t('campaigns.newCustomers') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-xl font-bold text-purple-600 dark:text-purple-400">
          {{ summary.newCustomers }}
        </div>
      </div>

      <!-- CAC -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ t('campaigns.cac') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-xl font-bold" :class="summary.cac > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'">
          {{ summary.cac > 0 ? formatCurrency(summary.cac) : '-' }}
        </div>
        <div v-if="!isLoading" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ t('campaigns.cacDesc') }}
        </div>
      </div>

      <!-- ROAS -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ t('campaigns.roas') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-xl font-bold" :class="summary.roas >= 2 ? 'text-green-600 dark:text-green-400' : summary.roas >= 1 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'">
          {{ summary.roas > 0 ? summary.roas.toFixed(2) + 'x' : '-' }}
        </div>
        <div v-if="!isLoading" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ t('campaigns.roasDesc') }}
        </div>
      </div>
    </div>

    <!-- Conversion Funnel -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('campaigns.conversionFunnel') }}
      </h3>
      <div v-if="isLoading" class="h-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div v-else class="flex items-center justify-between gap-2">
        <!-- Stage 1: Orders -->
        <div class="flex-1 text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
            <span class="text-lg font-bold">{{ funnel.totalOrders }}</span>
          </div>
          <div class="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('campaigns.orders') }}</div>
        </div>

        <!-- Arrow with drop-off -->
        <div class="flex flex-col items-center">
          <div class="text-red-500 text-xs font-medium">-{{ funnel.confirmationDropOff }}%</div>
          <div class="text-gray-400">→</div>
        </div>

        <!-- Stage 2: Confirmed -->
        <div class="flex-1 text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
            <span class="text-lg font-bold">{{ funnel.confirmedOrders }}</span>
          </div>
          <div class="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('campaigns.confirmed') }}</div>
        </div>

        <!-- Arrow with drop-off -->
        <div class="flex flex-col items-center">
          <div class="text-red-500 text-xs font-medium">-{{ funnel.deliveryDropOff }}%</div>
          <div class="text-gray-400">→</div>
        </div>

        <!-- Stage 3: Delivered -->
        <div class="flex-1 text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <span class="text-lg font-bold">{{ funnel.deliveredOrders }}</span>
          </div>
          <div class="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('campaigns.delivered') }}</div>
        </div>

        <!-- Arrow with drop-off -->
        <div class="flex flex-col items-center">
          <div class="text-red-500 text-xs font-medium">-{{ funnel.returnDropOff }}%</div>
          <div class="text-gray-400">→</div>
        </div>

        <!-- Stage 4: Successful -->
        <div class="flex-1 text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400">
            <span class="text-lg font-bold">{{ funnel.successfulOrders }}</span>
          </div>
          <div class="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('campaigns.successful') }}</div>
          <div class="mt-1 text-xs font-bold text-teal-600 dark:text-teal-400">{{ funnel.overallSuccessRate }}%</div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Daily Trend (Line Chart) -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('campaigns.dailyTrend') }}
        </h3>
        <ChartsLineChart
          v-if="!isLoading && trendChartData.labels.length > 0"
          :series="trendSeries"
          :categories="trendChartData.labels"
          :height="300"
          :colors="['#6B7280', '#10B981', '#3B82F6']"
          :show-legend="true"
        />
        <div v-else-if="isLoading" class="flex h-[300px] items-center justify-center">
          <div class="h-full w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div v-else class="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
          {{ t('reports.noData') }}
        </div>
      </div>

      <!-- Orders by Source (Donut Chart) -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('campaigns.bySource') }}
        </h3>
        <ChartsDonutChart
          v-if="!isLoading && sourceChartData.orders.some(v => v > 0)"
          :series="sourceChartData.orders"
          :labels="sourceChartData.labels"
          :height="300"
          :colors="sourceColors"
        />
        <div v-else-if="isLoading" class="flex h-[300px] items-center justify-center">
          <div class="mx-auto h-48 w-48 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div v-else class="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
          {{ t('reports.noData') }}
        </div>
      </div>
    </div>

    <!-- Campaign Performance Table / Cards -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('campaigns.campaignDetails') }}
      </h3>

      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      <!-- Mobile: Card View -->
      <div v-else-if="campaigns.length > 0 && isMobileView" class="space-y-4">
        <CampaignsCampaignCard
          v-for="campaign in campaigns"
          :key="`${campaign.source}-${campaign.campaign}`"
          :campaign="campaign"
        />
      </div>

      <!-- Desktop: Table View -->
      <div v-else-if="campaigns.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.source') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.campaign') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.orders') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.confirmed') }} %
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.delivered') }} %
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.returned') }} %
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.revenue') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.aov') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="campaign in campaigns" :key="`${campaign.source}-${campaign.campaign}`">
              <td class="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white capitalize">
                {{ campaign.source || '-' }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ campaign.campaign || '-' }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ campaign.totalOrders.toLocaleString() }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  :class="['inline-flex rounded-full px-2 py-1 text-xs font-semibold', getRateBadgeClasses(campaign.confirmationRate, 'confirmation')]"
                >
                  {{ formatRate(campaign.confirmationRate) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  :class="['inline-flex rounded-full px-2 py-1 text-xs font-semibold', getRateBadgeClasses(campaign.deliveryRate, 'delivery')]"
                >
                  {{ formatRate(campaign.deliveryRate) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  :class="['inline-flex rounded-full px-2 py-1 text-xs font-semibold', getRateBadgeClasses(campaign.returnRate, 'return')]"
                >
                  {{ formatRate(campaign.returnRate) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-green-600 dark:text-green-400">
                {{ formatCurrency(campaign.revenue) }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(campaign.averageOrderValue) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="flex h-[200px] items-center justify-center text-gray-500 dark:text-gray-400">
        {{ t('reports.noData') }}
      </div>
    </div>

    <!-- Sources Table -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('campaigns.sourceDetails') }}
      </h3>
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 4" :key="i" class="h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div v-else-if="sources.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.source') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.orders') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.confirmed') }} %
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.delivered') }} %
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.returned') }} %
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.revenue') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="source in sources" :key="source.source">
              <td class="whitespace-nowrap px-4 py-4">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {{ source.source }}
                  </span>
                </div>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ source.totalOrders.toLocaleString() }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  :class="['inline-flex rounded-full px-2 py-1 text-xs font-semibold', getRateBadgeClasses(source.confirmationRate, 'confirmation')]"
                >
                  {{ formatRate(source.confirmationRate) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  :class="['inline-flex rounded-full px-2 py-1 text-xs font-semibold', getRateBadgeClasses(source.deliveryRate, 'delivery')]"
                >
                  {{ formatRate(source.deliveryRate) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  :class="['inline-flex rounded-full px-2 py-1 text-xs font-semibold', getRateBadgeClasses(source.returnRate, 'return')]"
                >
                  {{ formatRate(source.returnRate) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-green-600 dark:text-green-400">
                {{ formatCurrency(source.revenue) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="flex h-[200px] items-center justify-center text-gray-500 dark:text-gray-400">
        {{ t('reports.noData') }}
      </div>
    </div>

    <!-- Content Performance Table (utm_content - Ad Creatives) -->
    <div v-if="contents.length > 0" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('campaigns.contentDetails') }}
      </h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Content
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.source') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.orders') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.confirmed') }} %
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.delivered') }} %
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('campaigns.revenue') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="content in contents" :key="content.content">
              <td class="whitespace-nowrap px-4 py-4">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ content.content }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">
                {{ content.source || '-' }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ content.totalOrders.toLocaleString() }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  :class="['inline-flex rounded-full px-2 py-1 text-xs font-semibold', getRateBadgeClasses(content.confirmationRate, 'confirmation')]"
                >
                  {{ formatRate(content.confirmationRate) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  :class="['inline-flex rounded-full px-2 py-1 text-xs font-semibold', getRateBadgeClasses(content.deliveryRate, 'delivery')]"
                >
                  {{ formatRate(content.deliveryRate) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-green-600 dark:text-green-400">
                {{ formatCurrency(content.revenue) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
