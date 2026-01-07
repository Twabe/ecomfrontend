<script setup lang="ts">
import { useCustomerReportsService } from '~/services/customer-reports/useCustomerReportsService'
import { exportToPdf, exportToExcel } from '~/services/reports/useReportsService'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Customers.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Service
const {
  kpiData,
  topCustomers,
  problematicCustomers,
  blacklistedCustomers,
  distributionChartData,
  behaviorChartData,
  isLoading,
} = useCustomerReportsService()

// Export handlers
const isExporting = ref(false)

const handleExportPdf = async () => {
  isExporting.value = true
  try {
    await exportToPdf('customer-content', `customer-reports-${new Date().toISOString().split('T')[0]}.pdf`)
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
      // Top Customers
      ...topCustomers.value.map((c, i) => ({
        section: t('customerReports.topCustomers'),
        rank: i + 1,
        name: c.fullName,
        phone: c.phone,
        orders: c.totalOrders,
        spent: c.totalSpent,
        deliveryRate: c.deliveryRate.toFixed(1) + '%',
        cancellationRate: c.cancellationRate.toFixed(1) + '%',
      })),
      // Problematic Customers
      ...problematicCustomers.value.map(c => ({
        section: t('customerReports.problematicCustomers'),
        name: c.fullName,
        phone: c.phone,
        orders: c.totalOrders,
        cancelled: c.cancelledOrders,
        cancellationRate: c.cancellationRate.toFixed(1) + '%',
        lastOrder: c.lastOrderDate || '-',
      })),
      // Blacklisted Customers
      ...blacklistedCustomers.value.map(c => ({
        section: t('customerReports.blacklistedCustomers'),
        name: c.fullName,
        phone: c.phone,
        reason: c.blacklistReason || '-',
      })),
    ]

    await exportToExcel(exportData, `customer-reports-${new Date().toISOString().split('T')[0]}.xlsx`)
    notify({ type: 'success', message: t('reports.exportSuccess') })
  } catch (error) {
    notify({ type: 'error', message: t('reports.exportError') })
  } finally {
    isExporting.value = false
  }
}

// Chart series for behavior comparison
const behaviorSeries = computed(() => [
  { name: t('customerReports.deliveryRate'), data: behaviorChartData.value.deliveryRates },
  { name: t('customerReports.cancellationRate'), data: behaviorChartData.value.cancellationRates },
])

// Colors
const distributionColors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'] // green, blue, orange, red
const behaviorColors = ['#10B981', '#EF4444'] // green for delivery, red for cancellation

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
const getRateColorClass = (rate: number, type: 'delivery' | 'cancellation') => {
  if (type === 'delivery') {
    if (rate >= 80) return 'text-green-600 dark:text-green-400'
    if (rate >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  } else {
    if (rate <= 20) return 'text-green-600 dark:text-green-400'
    if (rate <= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }
}

// Get customer type badge
const getCustomerTypeBadge = (customer: { isHighValue: boolean; isProblematic: boolean; isBlacklisted: boolean }) => {
  if (customer.isBlacklisted) return { label: t('customerReports.blacklisted'), class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
  if (customer.isProblematic) return { label: t('customerReports.problematic'), class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' }
  if (customer.isHighValue) return { label: 'VIP', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
  return { label: t('customerReports.regular'), class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' }
}

// Format date
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div id="customer-content" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('customerReports.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('customerReports.subtitle') }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <ReportsExportButtons
          :is-exporting="isExporting"
          @export-pdf="handleExportPdf"
          @export-excel="handleExportExcel"
        />
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <!-- Total Customers -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('customerReports.totalCustomers') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {{ kpiData.totalCustomers.toLocaleString() }}
        </div>
      </div>

      <!-- VIP Customers -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('customerReports.vipCustomers') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
          {{ kpiData.vipCustomers.toLocaleString() }}
        </div>
      </div>

      <!-- Problematic Customers -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('customerReports.problematicCustomers') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">
          {{ kpiData.problematicCustomers.toLocaleString() }}
        </div>
      </div>

      <!-- Average Order Value -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('customerReports.averageOrderValue') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {{ formatCurrency(kpiData.averageOrderValue) }}
        </div>
      </div>

      <!-- Blacklisted Customers -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('customerReports.blacklistedCustomers') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
          {{ kpiData.blacklistedCustomers.toLocaleString() }}
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Customer Distribution (Donut) -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('customerReports.customerDistribution') }}
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

      <!-- Purchase Behavior (Bar) -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('customerReports.purchaseBehavior') }}
        </h3>
        <ChartsBarChart
          v-if="!isLoading && behaviorChartData.categories.length > 0"
          :series="behaviorSeries"
          :categories="behaviorChartData.categories"
          :height="300"
          :colors="behaviorColors"
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

    <!-- Top Customers Table -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('customerReports.topCustomers') }}
      </h3>
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div v-else-if="topCustomers.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                #
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.customer') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.orders') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.totalSpent') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.deliveryRate') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.cancellationRate') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(customer, index) in topCustomers" :key="customer.id">
              <td class="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ index + 1 }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <div class="flex items-center gap-2">
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ customer.fullName }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ customer.phone }}
                    </div>
                  </div>
                  <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium" :class="getCustomerTypeBadge(customer).class">
                    {{ getCustomerTypeBadge(customer).label }}
                  </span>
                </div>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ customer.totalOrders.toLocaleString() }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                {{ formatCurrency(customer.totalSpent) }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span :class="['text-sm font-semibold', getRateColorClass(customer.deliveryRate, 'delivery')]">
                  {{ formatPercent(customer.deliveryRate) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span :class="['text-sm font-semibold', getRateColorClass(customer.cancellationRate, 'cancellation')]">
                  {{ formatPercent(customer.cancellationRate) }}
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

    <!-- Problematic Customers Table -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('customerReports.problematicCustomers') }}
      </h3>
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div v-else-if="problematicCustomers.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.customer') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.phone') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.orders') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.cancelled') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.cancellationRate') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.lastOrder') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="customer in problematicCustomers" :key="customer.id">
              <td class="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                {{ customer.fullName }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ customer.phone }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ customer.totalOrders.toLocaleString() }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-red-600 dark:text-red-400">
                {{ customer.cancelledOrders.toLocaleString() }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span class="text-sm font-semibold text-red-600 dark:text-red-400">
                  {{ formatPercent(customer.cancellationRate) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(customer.lastOrderDate) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="flex h-[200px] items-center justify-center text-gray-500 dark:text-gray-400">
        {{ t('reports.noData') }}
      </div>
    </div>

    <!-- Blacklisted Customers Table -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('customerReports.blacklistedCustomers') }}
      </h3>
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div v-else-if="blacklistedCustomers.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.customer') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.phone') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.blacklistReason') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.totalOrders') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('customerReports.totalSpent') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="customer in blacklistedCustomers" :key="customer.id">
              <td class="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                {{ customer.fullName }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ customer.phone }}
              </td>
              <td class="px-4 py-4 text-sm text-red-600 dark:text-red-400">
                {{ customer.blacklistReason || '-' }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ customer.totalOrders.toLocaleString() }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(customer.totalSpent) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="flex h-[150px] items-center justify-center text-gray-500 dark:text-gray-400">
        {{ t('customerReports.noBlacklisted') }}
      </div>
    </div>
  </div>
</template>
