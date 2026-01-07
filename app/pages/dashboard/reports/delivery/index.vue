<script setup lang="ts">
import { useDeliveryReportsService, type DeliveryReportsParams } from '~/services/delivery-reports/useDeliveryReportsService'
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

// Service params
const params = computed<DeliveryReportsParams>(() => ({
  startDate: dateRange.value.startDate,
  endDate: dateRange.value.endDate,
}))

const {
  kpiData,
  companyData,
  performanceChartData,
  distributionChartData,
  isLoading,
} = useDeliveryReportsService(params)

// Export handlers
const isExporting = ref(false)

const handleExportPdf = async () => {
  isExporting.value = true
  try {
    await exportToPdf('delivery-content', `delivery-${dateRange.value.startDate}-${dateRange.value.endDate}.pdf`)
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
    const exportData = companyData.value.map(c => ({
      company: c.deliveryCompanyName,
      totalOrders: c.totalOrders,
      delivered: c.deliveredOrders,
      returned: c.returnedOrders,
      cancelled: c.cancelledOrders,
      deliveryRate: c.deliveryRate.toFixed(1) + '%',
      returnRate: c.returnRate.toFixed(1) + '%',
      cancelRate: c.cancelRate.toFixed(1) + '%',
      revenue: c.totalRevenue,
    }))

    await exportToExcel(exportData, `delivery-${dateRange.value.startDate}-${dateRange.value.endDate}.xlsx`)
    notify({ type: 'success', message: t('reports.exportSuccess') })
  } catch (error) {
    notify({ type: 'error', message: t('reports.exportError') })
  } finally {
    isExporting.value = false
  }
}

// Chart series for performance
const performanceSeries = computed(() => [
  { name: t('deliveryReports.deliveryRate'), data: performanceChartData.value.deliveryRates },
  { name: t('deliveryReports.returnRate'), data: performanceChartData.value.returnRates },
  { name: t('deliveryReports.cancelRate'), data: performanceChartData.value.cancelRates },
])

// Colors
const performanceColors = ['#10B981', '#F59E0B', '#EF4444'] // green, yellow, red
const distributionColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4']

// Currency formatter
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val) + ' DH'
}

// Percent formatter
const formatPercent = (val: number) => {
  return val.toFixed(1) + '%'
}

// Get rate color class
const getRateColorClass = (rate: number, type: 'delivery' | 'return' | 'cancel') => {
  if (type === 'delivery') {
    if (rate >= 70) return 'text-green-600 dark:text-green-400'
    if (rate >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  } else {
    if (rate <= 10) return 'text-green-600 dark:text-green-400'
    if (rate <= 20) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }
}
</script>

<template>
  <div id="delivery-content" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('deliveryReports.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('deliveryReports.subtitle') }}
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
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <!-- Total Orders -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('deliveryReports.totalOrders') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {{ kpiData.totalOrders.toLocaleString() }}
        </div>
      </div>

      <!-- Delivery Rate -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('deliveryReports.deliveryRate') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold" :class="getRateColorClass(kpiData.deliveryRate, 'delivery')">
          {{ formatPercent(kpiData.deliveryRate) }}
        </div>
      </div>

      <!-- Return Rate -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('deliveryReports.returnRate') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold" :class="getRateColorClass(kpiData.returnRate, 'return')">
          {{ formatPercent(kpiData.returnRate) }}
        </div>
      </div>

      <!-- Cancel Rate -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('deliveryReports.cancelRate') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold" :class="getRateColorClass(kpiData.cancelRate, 'cancel')">
          {{ formatPercent(kpiData.cancelRate) }}
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Company Performance (Grouped Bar Chart) -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('deliveryReports.companyPerformance') }}
        </h3>
        <ChartsBarChart
          v-if="!isLoading && performanceChartData.companies.length > 0"
          :series="performanceSeries"
          :categories="performanceChartData.companies"
          :height="300"
          :colors="performanceColors"
          :y-axis-formatter="(val) => val.toFixed(0) + '%'"
        />
        <div v-else-if="isLoading" class="flex h-[300px] items-center justify-center">
          <div class="h-full w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div v-else class="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
          {{ t('reports.noData') }}
        </div>
      </div>

      <!-- Order Distribution (Donut Chart) -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('deliveryReports.orderDistribution') }}
        </h3>
        <ChartsDonutChart
          v-if="!isLoading && distributionChartData.values.some(v => v > 0)"
          :series="distributionChartData.values"
          :labels="distributionChartData.labels"
          :height="300"
          :colors="distributionColors"
        />
        <div v-else-if="isLoading" class="flex h-[300px] items-center justify-center">
          <div class="mx-auto h-48 w-48 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div v-else class="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
          {{ t('reports.noData') }}
        </div>
      </div>
    </div>

    <!-- Company Comparison Table -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('deliveryReports.companyComparison') }}
      </h3>
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div v-else-if="companyData.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('reports.company') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('deliveryReports.totalOrders') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('deliveryReports.deliveredOrders') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('deliveryReports.returnedOrders') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('deliveryReports.cancelledOrders') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('deliveryReports.deliveryRate') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('reports.revenue') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="company in companyData" :key="company.deliveryCompanyId">
              <td class="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                {{ company.deliveryCompanyName }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ company.totalOrders.toLocaleString() }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-green-600 dark:text-green-400">
                {{ company.deliveredOrders.toLocaleString() }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-orange-600 dark:text-orange-400">
                {{ company.returnedOrders.toLocaleString() }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-red-600 dark:text-red-400">
                {{ company.cancelledOrders.toLocaleString() }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  :class="['text-sm font-semibold', getRateColorClass(company.deliveryRate, 'delivery')]"
                >
                  {{ formatPercent(company.deliveryRate) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(company.totalRevenue) }}
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
