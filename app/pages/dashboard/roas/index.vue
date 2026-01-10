<script setup lang="ts">
import { useROASService, getROASColor, getROASBgColor, getROASLevel, type ROASParams } from '~/services/roas/useROASService'
import { exportToPdf, exportToExcel } from '~/services/reports/useReportsService'
import { useProductsService } from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.SpentAds.View'
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
const selectedProductId = ref<string | null>(null)
const selectedPlatform = ref<string | null>(null)

// Available platforms
const platforms = [
  { value: null, label: 'roas.allPlatforms' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'google', label: 'Google' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'snapchat', label: 'Snapchat' },
]

// Products service for filter dropdown
const { items: products } = useProductsService()

// ROAS service params
const roasParams = computed<ROASParams>(() => ({
  startDate: dateRange.value.startDate,
  endDate: dateRange.value.endDate,
  productId: selectedProductId.value,
  platform: selectedPlatform.value,
}))

const {
  kpiData,
  productROASData,
  platformROASData,
  productChartData,
  platformChartData,
  isLoading,
} = useROASService(roasParams)

// Export handlers
const isExporting = ref(false)

const handleExportPdf = async () => {
  isExporting.value = true
  try {
    await exportToPdf('roas-content', `roas-${dateRange.value.startDate}-${dateRange.value.endDate}.pdf`)
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
      // KPIs
      { type: 'KPI', metric: t('roas.totalAdSpend'), value: kpiData.value.totalAdSpend },
      { type: 'KPI', metric: t('roas.totalRevenue'), value: kpiData.value.totalRevenue },
      { type: 'KPI', metric: t('roas.totalProfit'), value: kpiData.value.totalProfit },
      { type: 'KPI', metric: t('roas.overallROAS'), value: kpiData.value.overallROAS.toFixed(2) + 'x' },
      { type: 'KPI', metric: t('roas.totalOrders'), value: kpiData.value.totalOrders },
      { type: 'KPI', metric: t('roas.costPerOrder'), value: kpiData.value.averageCostPerOrder },
      // Products
      ...productROASData.value.map(p => ({
        type: t('roas.productDetails'),
        productName: p.productName,
        adSpend: p.totalAdSpend,
        revenue: p.totalRevenue,
        profit: p.totalProfit,
        roas: p.roas.toFixed(2) + 'x',
        orders: p.ordersCount,
        costPerOrder: p.costPerOrder,
      })),
      // Platforms
      ...platformROASData.value.map(p => ({
        type: t('roas.platformDetails'),
        platform: p.platform,
        adSpend: p.totalAdSpend,
        spendShare: p.spendShare.toFixed(1) + '%',
        estimatedRevenue: p.estimatedRevenue,
        roas: p.roas.toFixed(2) + 'x',
        estimatedOrders: p.estimatedOrders,
      })),
    ]

    await exportToExcel(exportData, `roas-${dateRange.value.startDate}-${dateRange.value.endDate}.xlsx`)
    notify({ type: 'success', message: t('reports.exportSuccess') })
  } catch (error) {
    notify({ type: 'error', message: t('reports.exportError') })
  } finally {
    isExporting.value = false
  }
}

// Chart series
const productROASSeries = computed(() => [{
  name: 'ROAS',
  data: productChartData.value.roas
}])

// Platform colors for donut chart
const platformColors = ['#3B82F6', '#EA4335', '#000000', '#FFFC00']

// Currency formatter
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val) + ' DH'
}

// ROAS formatter
const formatROAS = (val: number) => {
  return val.toFixed(2) + 'x'
}

// Get ROAS badge classes
const getROASBadgeClasses = (roas: number) => {
  const level = getROASLevel(roas)
  switch (level) {
    case 'excellent':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'good':
      return 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300'
    case 'average':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'loss':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
}
</script>

<template>
  <div id="roas-content" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('roas.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('roas.subtitle') }}
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
      <!-- Product Filter -->
      <div class="w-64">
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('roas.byProduct') }}
        </label>
        <select
          v-model="selectedProductId"
          class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option :value="null">{{ t('roas.allProducts') }}</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>
      </div>

      <!-- Platform Filter -->
      <div class="w-48">
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('roas.byPlatform') }}
        </label>
        <select
          v-model="selectedPlatform"
          class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option v-for="p in platforms" :key="p.value ?? 'all'" :value="p.value">
            {{ p.value ? p.label : t(p.label) }}
          </option>
        </select>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <!-- Total Ad Spend -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('roas.totalAdSpend') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {{ formatCurrency(kpiData.totalAdSpend) }}
        </div>
      </div>

      <!-- Total Revenue -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('roas.totalRevenue') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {{ formatCurrency(kpiData.totalRevenue) }}
        </div>
      </div>

      <!-- Total Profit -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('roas.totalProfit') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
          {{ formatCurrency(kpiData.totalProfit) }}
        </div>
      </div>

      <!-- Overall ROAS -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('roas.overallROAS') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold" :class="getROASColor(kpiData.overallROAS)">
          {{ formatROAS(kpiData.overallROAS) }}
        </div>
      </div>

      <!-- Total Orders -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('roas.totalOrders') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {{ kpiData.totalOrders.toLocaleString() }}
        </div>
      </div>

      <!-- Cost per Order -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('roas.costPerOrder') }}
        </div>
        <div v-if="isLoading" class="mt-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div v-else class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {{ formatCurrency(kpiData.averageCostPerOrder) }}
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- ROAS by Product (Horizontal Bar) -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('roas.byProduct') }}
        </h3>
        <ChartsBarChart
          v-if="!isLoading && productChartData.labels.length > 0"
          :series="productROASSeries"
          :categories="productChartData.labels"
          :height="300"
          :colors="['#4F46E5']"
          horizontal
          :show-legend="false"
          :y-axis-formatter="(val) => typeof val === 'number' ? val.toFixed(2) + 'x' : String(val)"
        />
        <div v-else-if="isLoading" class="flex h-[300px] items-center justify-center">
          <div class="h-full w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div v-else class="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
          {{ t('reports.noData') }}
        </div>
      </div>

      <!-- Spend by Platform (Donut) -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('roas.byPlatform') }}
        </h3>
        <ChartsDonutChart
          v-if="!isLoading && platformChartData.values.some(v => v > 0)"
          :series="platformChartData.values"
          :labels="platformChartData.labels"
          :height="300"
          :colors="platformColors"
        />
        <div v-else-if="isLoading" class="flex h-[300px] items-center justify-center">
          <div class="mx-auto h-48 w-48 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div v-else class="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
          {{ t('reports.noData') }}
        </div>
      </div>
    </div>

    <!-- Products Table -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('roas.productDetails') }}
      </h3>
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div v-else-if="productROASData.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('common.product') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('roas.totalAdSpend') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('roas.totalRevenue') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('roas.totalProfit') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                ROAS
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('roas.totalOrders') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('roas.costPerOrder') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="product in productROASData" :key="product.productId">
              <td class="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                {{ product.productName }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(product.totalAdSpend) }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(product.totalRevenue) }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-green-600 dark:text-green-400">
                {{ formatCurrency(product.totalProfit) }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  :class="['inline-flex rounded-full px-2 py-1 text-xs font-semibold', getROASBadgeClasses(product.roas)]"
                >
                  {{ formatROAS(product.roas) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ product.ordersCount.toLocaleString() }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(product.costPerOrder) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="flex h-[200px] items-center justify-center text-gray-500 dark:text-gray-400">
        {{ t('reports.noData') }}
      </div>
    </div>

    <!-- Platforms Table -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('roas.platformDetails') }}
      </h3>
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 4" :key="i" class="h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div v-else-if="platformROASData.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('common.platform') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('roas.totalAdSpend') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('roas.spendShare') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('roas.estimatedRevenue') }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                ROAS
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ t('roas.estimatedOrders') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="platform in platformROASData" :key="platform.platform">
              <td class="whitespace-nowrap px-4 py-4">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {{ platform.platform }}
                  </span>
                </div>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(platform.totalAdSpend) }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ platform.spendShare.toFixed(1) }}%
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(platform.estimatedRevenue) }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  :class="['inline-flex rounded-full px-2 py-1 text-xs font-semibold', getROASBadgeClasses(platform.roas)]"
                >
                  {{ formatROAS(platform.roas) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">
                {{ platform.estimatedOrders.toLocaleString() }}
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
