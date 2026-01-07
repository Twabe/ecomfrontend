<script setup lang="ts">
import { useFinancialReportsService, type FinancialReportsParams } from '~/services/financial-reports/useFinancialReportsService'
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
const params = computed<FinancialReportsParams>(() => ({
  startDate: dateRange.value.startDate,
  endDate: dateRange.value.endDate,
}))

const {
  kpiData,
  expensesByType,
  expensesByProduct,
  profitLossData,
  expenseTypeChartData,
  expenseProductChartData,
  revenueTrendData,
  isLoading,
} = useFinancialReportsService(params)

// Export handlers
const isExporting = ref(false)

const handleExportPdf = async () => {
  isExporting.value = true
  try {
    await exportToPdf('financial-content', `financial-${dateRange.value.startDate}-${dateRange.value.endDate}.pdf`)
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
      // P&L Summary
      { section: t('financialReports.profitLoss'), item: t('financialReports.totalRevenue'), amount: profitLossData.value.revenue },
      { section: t('financialReports.profitLoss'), item: t('financialReports.totalCosts'), amount: -profitLossData.value.productCosts },
      { section: t('financialReports.profitLoss'), item: t('financialReports.grossProfit'), amount: profitLossData.value.grossProfit },
      { section: t('financialReports.profitLoss'), item: t('financialReports.adSpend'), amount: -profitLossData.value.adSpend },
      { section: t('financialReports.profitLoss'), item: t('financialReports.otherExpenses'), amount: -profitLossData.value.otherExpenses },
      { section: t('financialReports.profitLoss'), item: t('financialReports.netProfit'), amount: profitLossData.value.netProfit },
      // Expenses by type
      ...expensesByType.value.map(e => ({
        section: t('financialReports.expensesByType'),
        item: e.type,
        amount: e.amount,
        percentage: e.percentage.toFixed(1) + '%',
      })),
      // Expenses by product
      ...expensesByProduct.value.map(e => ({
        section: t('financialReports.expensesByProduct'),
        item: e.productName,
        amount: e.amount,
      })),
    ]

    await exportToExcel(exportData, `financial-${dateRange.value.startDate}-${dateRange.value.endDate}.xlsx`)
    notify({ type: 'success', message: t('reports.exportSuccess') })
  } catch (error) {
    notify({ type: 'error', message: t('reports.exportError') })
  } finally {
    isExporting.value = false
  }
}

// Chart series for revenue trend
const revenueTrendSeries = computed(() => [
  { name: t('financialReports.totalRevenue'), data: revenueTrendData.value.revenue },
  { name: t('financialReports.netProfit'), data: revenueTrendData.value.profit },
])

// Chart series for expenses by product
const expenseProductSeries = computed(() => [{
  name: t('financialReports.totalExpenses'),
  data: expenseProductChartData.value.values,
}])

// Colors
const trendColors = ['#3B82F6', '#10B981'] // blue for revenue, green for profit
const expenseTypeColors = ['#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']
const expenseProductColors = ['#6366F1']

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

// Get profit color class
const getProfitColorClass = (val: number) => {
  if (val > 0) return 'text-green-600 dark:text-green-400'
  if (val < 0) return 'text-red-600 dark:text-red-400'
  return 'text-gray-600 dark:text-gray-400'
}
</script>

<template>
  <div id="financial-content" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('financialReports.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('financialReports.subtitle') }}
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
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <!-- Total Revenue -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('financialReports.totalRevenue') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {{ formatCurrency(kpiData.totalRevenue) }}
        </div>
      </div>

      <!-- Total Costs -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('financialReports.totalCosts') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">
          {{ formatCurrency(kpiData.totalCosts) }}
        </div>
      </div>

      <!-- Total Expenses -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('financialReports.totalExpenses') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
          {{ formatCurrency(kpiData.totalExpenses) }}
        </div>
      </div>

      <!-- Net Profit -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('financialReports.netProfit') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold" :class="getProfitColorClass(kpiData.netProfit)">
          {{ formatCurrency(kpiData.netProfit) }}
        </div>
      </div>

      <!-- Profit Margin -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('financialReports.profitMargin') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold" :class="getProfitColorClass(kpiData.profitMargin)">
          {{ formatPercent(kpiData.profitMargin) }}
        </div>
      </div>
    </div>

    <!-- Revenue Trend Chart -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('financialReports.revenueTrend') }}
      </h3>
      <ChartsLineChart
        v-if="!isLoading && revenueTrendData.categories.length > 0"
        :series="revenueTrendSeries"
        :categories="revenueTrendData.categories"
        :height="300"
        :colors="trendColors"
        :y-axis-formatter="(val) => formatCurrency(val)"
      />
      <div v-else-if="isLoading" class="flex h-[300px] items-center justify-center">
        <div class="h-full w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div v-else class="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
        {{ t('reports.noData') }}
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Expenses by Type (Donut) -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('financialReports.expensesByType') }}
        </h3>
        <ChartsDonutChart
          v-if="!isLoading && expenseTypeChartData.values.some(v => v > 0)"
          :series="expenseTypeChartData.values"
          :labels="expenseTypeChartData.labels"
          :height="300"
          :colors="expenseTypeColors"
        />
        <div v-else-if="isLoading" class="flex h-[300px] items-center justify-center">
          <div class="mx-auto h-48 w-48 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div v-else class="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
          {{ t('reports.noData') }}
        </div>
      </div>

      <!-- Expenses by Product (Bar) -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('financialReports.expensesByProduct') }}
        </h3>
        <ChartsBarChart
          v-if="!isLoading && expenseProductChartData.labels.length > 0"
          :series="expenseProductSeries"
          :categories="expenseProductChartData.labels"
          :height="300"
          :colors="expenseProductColors"
          horizontal
          :show-legend="false"
          :y-axis-formatter="(val) => formatCurrency(val)"
        />
        <div v-else-if="isLoading" class="flex h-[300px] items-center justify-center">
          <div class="h-full w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div v-else class="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
          {{ t('reports.noData') }}
        </div>
      </div>
    </div>

    <!-- Profit & Loss Summary -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('financialReports.profitLoss') }}
      </h3>
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 6" :key="i" class="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div v-else class="space-y-4">
        <!-- Revenue -->
        <div class="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
          <span class="text-base font-medium text-gray-900 dark:text-white">
            {{ t('financialReports.totalRevenue') }}
          </span>
          <span class="text-lg font-bold text-gray-900 dark:text-white">
            {{ formatCurrency(profitLossData.revenue) }}
          </span>
        </div>

        <!-- Product Costs -->
        <div class="flex items-center justify-between pl-4">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            - {{ t('financialReports.totalCosts') }}
          </span>
          <span class="text-base font-medium text-red-600 dark:text-red-400">
            ({{ formatCurrency(profitLossData.productCosts) }})
          </span>
        </div>

        <!-- Gross Profit -->
        <div class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-2 py-2 dark:border-gray-700 dark:bg-gray-700/50">
          <span class="text-base font-medium text-gray-900 dark:text-white">
            = {{ t('financialReports.grossProfit') }}
          </span>
          <span class="text-lg font-bold" :class="getProfitColorClass(profitLossData.grossProfit)">
            {{ formatCurrency(profitLossData.grossProfit) }}
          </span>
        </div>

        <!-- Ad Spend -->
        <div class="flex items-center justify-between pl-4">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            - {{ t('financialReports.adSpend') }}
          </span>
          <span class="text-base font-medium text-red-600 dark:text-red-400">
            ({{ formatCurrency(profitLossData.adSpend) }})
          </span>
        </div>

        <!-- Other Expenses -->
        <div class="flex items-center justify-between pl-4">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            - {{ t('financialReports.otherExpenses') }}
          </span>
          <span class="text-base font-medium text-red-600 dark:text-red-400">
            ({{ formatCurrency(profitLossData.otherExpenses) }})
          </span>
        </div>

        <!-- Net Profit -->
        <div class="flex items-center justify-between border-t-2 border-gray-300 bg-gray-100 px-2 py-3 dark:border-gray-600 dark:bg-gray-700">
          <span class="text-lg font-bold text-gray-900 dark:text-white">
            = {{ t('financialReports.netProfit') }}
          </span>
          <span class="text-xl font-bold" :class="getProfitColorClass(profitLossData.netProfit)">
            {{ formatCurrency(profitLossData.netProfit) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
