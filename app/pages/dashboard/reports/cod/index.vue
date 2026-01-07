<script setup lang="ts">
import { useCodReportsService, type CodReportsParams } from '~/services/cod-reports/useCodReportsService'
import { exportToPdf, exportToExcel } from '~/services/reports/useReportsService'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Payments.View'
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
const params = computed<CodReportsParams>(() => ({
  startDate: dateRange.value.startDate,
  endDate: dateRange.value.endDate,
}))

const {
  kpiData,
  companyBalanceData,
  outstandingOrdersData,
  balanceChartData,
  agingChartData,
  isLoading,
} = useCodReportsService(params)

// Export handlers
const isExporting = ref(false)

const handleExportPdf = async () => {
  isExporting.value = true
  try {
    await exportToPdf('cod-content', `cod-${dateRange.value.startDate}-${dateRange.value.endDate}.pdf`)
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
      // Company summary
      ...companyBalanceData.value.map(c => ({
        type: t('codReports.companySummary'),
        company: c.deliveryCompanyName,
        outstanding: c.totalOutstandingAmount,
        received: c.totalPaymentsReceived,
        unallocated: c.unallocatedAmount,
        netBalance: c.netBalance,
        ordersCount: c.outstandingOrdersCount,
        daysSinceOldest: c.daysSinceOldest,
      })),
      // Outstanding orders
      ...outstandingOrdersData.value.map(o => ({
        type: t('codReports.pendingOrders'),
        orderCode: o.orderCode,
        customer: o.customerName,
        phone: o.phone,
        amount: o.price,
        company: o.deliveryCompanyName,
        daysOutstanding: o.daysOutstanding,
      })),
    ]

    await exportToExcel(exportData, `cod-${dateRange.value.startDate}-${dateRange.value.endDate}.xlsx`)
    notify({ type: 'success', message: t('reports.exportSuccess') })
  } catch (error) {
    notify({ type: 'error', message: t('reports.exportError') })
  } finally {
    isExporting.value = false
  }
}

// Chart series for balance
const balanceSeries = computed(() => [
  { name: t('codReports.totalOutstanding'), data: balanceChartData.value.outstanding },
  { name: t('codReports.totalReceived'), data: balanceChartData.value.received },
])

// Chart series for aging
const agingSeries = computed(() => [{
  name: t('codReports.outstandingCod'),
  data: agingChartData.value.values,
}])

// Colors
const balanceColors = ['#EF4444', '#10B981'] // red for outstanding, green for received
const agingColors = ['#3B82F6', '#F59E0B', '#EF4444', '#7C3AED'] // blue to purple gradient

// Currency formatter
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val) + ' DH'
}

// Date formatter
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-MA')
}

// Get days color class
const getDaysColorClass = (days: number) => {
  if (days <= 7) return 'text-green-600 dark:text-green-400'
  if (days <= 14) return 'text-yellow-600 dark:text-yellow-400'
  if (days <= 30) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

// Get net balance color class
const getBalanceColorClass = (balance: number) => {
  if (balance > 0) return 'text-green-600 dark:text-green-400'
  if (balance < 0) return 'text-red-600 dark:text-red-400'
  return 'text-gray-600 dark:text-gray-400'
}
</script>

<template>
  <div id="cod-content" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('codReports.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('codReports.subtitle') }}
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
      <!-- Total Outstanding -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('codReports.totalOutstanding') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
          {{ formatCurrency(kpiData.totalOutstanding) }}
        </div>
      </div>

      <!-- Total Received -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('codReports.totalReceived') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
          {{ formatCurrency(kpiData.totalReceived) }}
        </div>
      </div>

      <!-- Total Unallocated -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('codReports.totalPending') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          {{ formatCurrency(kpiData.totalUnallocated) }}
        </div>
      </div>

      <!-- Net Balance -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('codReports.netBalance') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold" :class="getBalanceColorClass(kpiData.netBalance)">
          {{ formatCurrency(kpiData.netBalance) }}
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Company Balance (Horizontal Bar) -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('codReports.companyBalance') }}
        </h3>
        <ChartsBarChart
          v-if="!isLoading && balanceChartData.companies.length > 0"
          :series="balanceSeries"
          :categories="balanceChartData.companies"
          :height="300"
          :colors="balanceColors"
          horizontal
          :y-axis-formatter="(val) => formatCurrency(val)"
        />
        <div v-else-if="isLoading" class="flex h-[300px] items-center justify-center">
          <div class="h-full w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div v-else class="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
          {{ t('reports.noData') }}
        </div>
      </div>

      <!-- Aging Report (Bar Chart) -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('codReports.agingReport') }}
        </h3>
        <ChartsBarChart
          v-if="!isLoading && agingChartData.values.some(v => v > 0)"
          :series="agingSeries"
          :categories="agingChartData.labels.map(l => l + ' ' + $t('common.days'))"
          :height="300"
          :colors="agingColors"
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

    <!-- Company Summary Table -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('codReports.companySummary') }}
      </h3>
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div v-else-if="companyBalanceData.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('reports.company') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('codReports.totalOutstanding') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('codReports.totalReceived') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('codReports.unallocatedPayments') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('codReports.netBalance') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('reports.orders') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('codReports.oldestOutstanding') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="company in companyBalanceData" :key="company.deliveryCompanyId">
              <td class="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                {{ company.deliveryCompanyName }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-red-600 dark:text-red-400">
                {{ formatCurrency(company.totalOutstandingAmount) }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-green-600 dark:text-green-400">
                {{ formatCurrency(company.totalPaymentsReceived) }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-yellow-600 dark:text-yellow-400">
                {{ formatCurrency(company.unallocatedAmount) }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span :class="['text-sm font-semibold', getBalanceColorClass(company.netBalance)]">
                  {{ formatCurrency(company.netBalance) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ company.outstandingOrdersCount }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span :class="['text-sm', getDaysColorClass(company.daysSinceOldest)]">
                  {{ company.daysSinceOldest }} {{ t('common.days') }}
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

    <!-- Outstanding Orders Table -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('codReports.pendingOrders') }}
      </h3>
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div v-else-if="outstandingOrdersData.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('orders.orderCode') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('reports.customer') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('common.phone') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('orders.amount') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('reports.company') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('common.date') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('codReports.daysOutstanding') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="order in outstandingOrdersData.slice(0, 20)" :key="order.orderId">
              <td class="whitespace-nowrap px-4 py-4 text-sm font-medium text-primary-600 dark:text-primary-400">
                {{ order.orderCode }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ order.customerName }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ order.phone }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                {{ formatCurrency(order.price) }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ order.deliveryCompanyName }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ formatDate(order.dateValidated) }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span :class="['text-sm font-semibold', getDaysColorClass(order.daysOutstanding)]">
                  {{ order.daysOutstanding }} {{ t('common.days') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="outstandingOrdersData.length > 20" class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {{ t('common.andMore', { count: outstandingOrdersData.length - 20 }) }}
        </div>
      </div>
      <div v-else class="flex h-[200px] items-center justify-center text-gray-500 dark:text-gray-400">
        {{ t('reports.noData') }}
      </div>
    </div>
  </div>
</template>
