<script setup lang="ts">
import { useReportsService, exportToPdf, exportToExcel, type DateRange } from '~/services/reports/useReportsService'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Statistics.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Date range state - default to last 7 days
const getDefaultDateRange = (): DateRange => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 7)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  }
}

const dateRange = ref<DateRange>(getDefaultDateRange())

// Reports service
const reportsParams = computed(() => ({
  dateRange: dateRange.value
}))

const {
  kpiData,
  ordersByStateData,
  deliveryPerformanceData,
  topProductsData,
  topCustomersData,
  ordersTrendData,
  revenueTrendData,
  isLoading
} = useReportsService(reportsParams)

// Export handlers
const isExporting = ref(false)

const handleExportPdf = async () => {
  isExporting.value = true
  try {
    await exportToPdf('reports-content', `reports-${dateRange.value.startDate}-${dateRange.value.endDate}.pdf`)
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
    // Prepare data for Excel export
    const exportData = [
      // KPIs
      {
        type: 'KPI',
        metric: t('reports.totalOrders'),
        value: kpiData.value.totalOrders
      },
      {
        type: 'KPI',
        metric: t('reports.deliveryRate'),
        value: kpiData.value.deliveryRate.toFixed(1) + '%'
      },
      {
        type: 'KPI',
        metric: t('reports.revenue'),
        value: kpiData.value.revenue
      },
      {
        type: 'KPI',
        metric: t('reports.netProfit'),
        value: kpiData.value.netProfit
      },
      {
        type: 'KPI',
        metric: 'ROAS',
        value: kpiData.value.roas.toFixed(2)
      },
      // Order states
      ...ordersByStateData.value.labels.map((label, i) => ({
        type: t('reports.ordersByState'),
        metric: label,
        value: ordersByStateData.value.values[i],
        percentage: ordersByStateData.value.percentages[i].toFixed(1) + '%'
      })),
      // Top products
      ...topProductsData.value.map(p => ({
        type: t('reports.topProducts'),
        metric: p.name,
        orders: p.orders,
        revenue: p.revenue
      }))
    ]

    await exportToExcel(exportData, `reports-${dateRange.value.startDate}-${dateRange.value.endDate}.xlsx`)
    notify({ type: 'success', message: t('reports.exportSuccess') })
  } catch (error) {
    notify({ type: 'error', message: t('reports.exportError') })
  } finally {
    isExporting.value = false
  }
}

// Chart configurations
const ordersTrendSeries = computed(() => [
  { name: t('reports.delivered'), data: ordersTrendData.value.delivered },
  { name: t('reports.cancelled'), data: ordersTrendData.value.cancelled },
  { name: t('reports.returned'), data: ordersTrendData.value.returned }
])

const revenueTrendSeries = computed(() => [
  { name: t('reports.revenue'), data: revenueTrendData.value.revenue },
  { name: t('reports.profit'), data: revenueTrendData.value.profit }
])

const deliveryPerformanceSeries = computed(() => [
  { name: t('reports.deliveryRate'), data: deliveryPerformanceData.value.deliveryRates },
  { name: t('reports.returnRate'), data: deliveryPerformanceData.value.returnRates }
])

const topProductsSeries = computed(() => [
  { name: t('reports.orders'), data: topProductsData.value.map(p => p.orders) }
])

// State colors for donut chart
const stateColors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16', '#6366F1']

// Currency formatter
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val) + ' DH'
}
</script>

<template>
  <div id="reports-content" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('reports.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('reports.subtitle') }}
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

    <!-- KPI Cards -->
    <ReportsKpiCards :data="kpiData" :is-loading="isLoading" />

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Orders Trend -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('reports.ordersTrend') }}
        </h3>
        <ChartsLineChart
          v-if="!isLoading"
          :series="ordersTrendSeries"
          :categories="ordersTrendData.categories"
          :height="300"
          :colors="['#10B981', '#EF4444', '#F59E0B']"
        />
        <div v-else class="flex h-[300px] items-center justify-center">
          <div class="h-full w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      <!-- Delivery Performance -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('reports.deliveryPerformance') }}
        </h3>
        <ChartsBarChart
          v-if="!isLoading && deliveryPerformanceData.companies.length > 0"
          :series="deliveryPerformanceSeries"
          :categories="deliveryPerformanceData.companies"
          :height="300"
          :colors="['#10B981', '#EF4444']"
          :y-axis-formatter="(val) => val.toFixed(0) + '%'"
        />
        <div v-else-if="isLoading" class="flex h-[300px] items-center justify-center">
          <div class="h-full w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div v-else class="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
          {{ t('reports.noData') }}
        </div>
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Orders by State -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('reports.ordersByState') }}
        </h3>
        <ChartsDonutChart
          v-if="!isLoading && ordersByStateData.values.some(v => v > 0)"
          :series="ordersByStateData.values"
          :labels="ordersByStateData.labels"
          :height="300"
          :colors="stateColors"
        />
        <div v-else-if="isLoading" class="flex h-[300px] items-center justify-center">
          <div class="mx-auto h-48 w-48 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div v-else class="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
          {{ t('reports.noData') }}
        </div>
      </div>

      <!-- Top Products -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('reports.topProducts') }}
        </h3>
        <ChartsBarChart
          v-if="!isLoading && topProductsData.length > 0"
          :series="topProductsSeries"
          :categories="topProductsData.map(p => p.name)"
          :height="300"
          :colors="['#4F46E5']"
          horizontal
          :show-legend="false"
        />
        <div v-else-if="isLoading" class="flex h-[300px] items-center justify-center">
          <div class="h-full w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div v-else class="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
          {{ t('reports.noData') }}
        </div>
      </div>
    </div>

    <!-- Charts Row 3 -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Revenue Trend -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('reports.revenueTrend') }}
        </h3>
        <ChartsLineChart
          v-if="!isLoading"
          :series="revenueTrendSeries"
          :categories="revenueTrendData.categories"
          :height="300"
          :colors="['#4F46E5', '#10B981']"
          :y-axis-formatter="formatCurrency"
        />
        <div v-else class="flex h-[300px] items-center justify-center">
          <div class="h-full w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      <!-- Top Customers Table -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('reports.topCustomers') }}
        </h3>
        <div v-if="isLoading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div v-else-if="topCustomersData.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {{ t('reports.customer') }}
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {{ t('reports.orders') }}
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {{ t('reports.totalSpent') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="customer in topCustomersData" :key="customer.customerId">
                <td class="whitespace-nowrap px-3 py-4">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ customer.customerName }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ customer.phone }}
                  </div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                  {{ customer.orderCount }}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatCurrency(customer.totalSpent ?? 0) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="flex h-[200px] items-center justify-center text-gray-500 dark:text-gray-400">
          {{ t('reports.noData') }}
        </div>
      </div>
    </div>

    <!-- Delivery Companies Table -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('reports.deliveryCompaniesPerformance') }}
      </h3>
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div v-else-if="deliveryPerformanceData.companies.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('reports.company') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('reports.totalOrders') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('reports.deliveryRate') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('reports.returnRate') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(company, index) in deliveryPerformanceData.companies" :key="company">
              <td class="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                {{ company }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ deliveryPerformanceData.orders[index] }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  :class="[
                    'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                    deliveryPerformanceData.deliveryRates[index] >= 80
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : deliveryPerformanceData.deliveryRates[index] >= 60
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  ]"
                >
                  {{ deliveryPerformanceData.deliveryRates[index].toFixed(1) }}%
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  :class="[
                    'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                    deliveryPerformanceData.returnRates[index] <= 10
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : deliveryPerformanceData.returnRates[index] <= 20
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  ]"
                >
                  {{ deliveryPerformanceData.returnRates[index].toFixed(1) }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="flex h-[200px] items-center justify-center text-gray-500 dark:text-gray-400">
        {{ t('reports.noData') }}
      </div>
    </div>
  </div>
</template>
