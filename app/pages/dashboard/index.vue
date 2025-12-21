<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {{ $t('dashboard.welcome') }}, {{ user?.firstName || user?.userName }}!
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {{ todayDate }}
        </p>
      </div>
      <div class="flex gap-2">
        <NuxtLink
          to="/dashboard/orders"
          class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <PlusIcon class="h-5 w-5" />
          {{ t('dashboard.newOrder') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <div v-for="i in 4" :key="i" class="card animate-pulse">
        <div class="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <!-- Today's Orders -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.todayOrders') }}</p>
            <p class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {{ dashboardStats?.orderStatistics.todayOrders ?? 0 }}
            </p>
          </div>
          <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
            <ShoppingCartIcon class="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-gray-500 dark:text-gray-400">
            {{ t('dashboard.thisWeekOrders') }}: {{ dashboardStats?.orderStatistics.thisWeekOrders ?? 0 }}
          </span>
        </div>
      </div>

      <!-- Today's Revenue -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.todayRevenue') }}</p>
            <p class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {{ formatCurrency(dashboardStats?.revenueStats.todayRevenue ?? 0) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <BanknotesIcon class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-gray-500 dark:text-gray-400">
            {{ t('dashboard.thisMonthRevenue') }}: {{ formatCurrency(dashboardStats?.revenueStats.thisMonthRevenue ?? 0) }}
          </span>
        </div>
      </div>

      <!-- Pending Deliveries -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.inDelivery') }}</p>
            <p class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {{ dashboardStats?.orderStatistics.inDelivery ?? 0 }}
            </p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
            <TruckIcon class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-yellow-600 dark:text-yellow-400 font-medium">
            {{ t('dashboard.readyForDelivery') }}: {{ dashboardStats?.orderStatistics.readyForDelivery ?? 0 }}
          </span>
        </div>
      </div>

      <!-- Delivered -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.delivered') }}</p>
            <p class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {{ dashboardStats?.orderStatistics.delivered ?? 0 }}
            </p>
          </div>
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <CheckCircleIcon class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-red-600 dark:text-red-400">
            {{ t('dashboard.returned') }}: {{ dashboardStats?.orderStatistics.returned ?? 0 }}
          </span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Orders by State -->
      <div class="lg:col-span-2 card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ t('dashboard.ordersByState') }}
        </h2>
        <div v-if="isLoading" class="animate-pulse space-y-3">
          <div v-for="i in 5" :key="i" class="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div v-else-if="!dashboardStats?.ordersByState?.length" class="text-center py-8 text-gray-500">
          {{ t('common.noData') }}
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="state in dashboardStats.ordersByState"
            :key="state.state"
            class="flex items-center gap-4"
          >
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ state.state }}
                </span>
                <span class="text-sm text-gray-500">
                  {{ state.count }} ({{ state.percentage.toFixed(1) }}%)
                </span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  class="bg-primary-600 h-2 rounded-full transition-all duration-500"
                  :style="{ width: `${state.percentage}%` }"
                ></div>
              </div>
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white w-24 text-right">
              {{ formatCurrency(state.totalAmount) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Order Status -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ t('dashboard.quickActions') }}</h2>

        <div class="space-y-3">
          <NuxtLink
            to="/dashboard/orders"
            class="flex items-center gap-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <PlusIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ t('dashboard.newOrder') }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('orders.createOrder') }}</p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/dashboard/products"
            class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <CubeIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ t('dashboard.addProduct') }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('products.createProduct') }}</p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/dashboard/delivery-notes"
            class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <DocumentTextIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ t('nav.deliveryNotes') }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('deliveryNotes.createNote') }}</p>
            </div>
          </NuxtLink>
        </div>

        <!-- Order Status Summary -->
        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">{{ t('dashboard.orderStatus') }}</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">{{ t('dashboard.pendingConfirmations') }}</span>
              <span class="font-medium text-yellow-600 dark:text-yellow-400">
                {{ dashboardStats?.orderStatistics.pendingConfirmations ?? 0 }}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">{{ t('dashboard.readyForDelivery') }}</span>
              <span class="font-medium text-blue-600 dark:text-blue-400">
                {{ dashboardStats?.orderStatistics.readyForDelivery ?? 0 }}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">{{ t('dashboard.inDelivery') }}</span>
              <span class="font-medium text-orange-600 dark:text-orange-400">
                {{ dashboardStats?.orderStatistics.inDelivery ?? 0 }}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">{{ t('dashboard.cancelled') }}</span>
              <span class="font-medium text-red-600 dark:text-red-400">
                {{ dashboardStats?.orderStatistics.cancelled ?? 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Products & Top Customers -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Products -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('dashboard.topProducts') }}</h2>
          <NuxtLink to="/dashboard/products" class="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            {{ t('nav.products') }} &rarr;
          </NuxtLink>
        </div>
        <div v-if="isLoading" class="animate-pulse space-y-3">
          <div v-for="i in 5" :key="i" class="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div v-else-if="!dashboardStats?.topProducts?.length" class="text-center py-8 text-gray-500">
          {{ t('common.noData') }}
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="text-left text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                <th class="pb-3 font-medium">{{ t('products.name') }}</th>
                <th class="pb-3 font-medium text-center">{{ t('dashboard.orders') }}</th>
                <th class="pb-3 font-medium text-right">{{ t('dashboard.revenue') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="product in dashboardStats.topProducts.slice(0, 5)" :key="product.productId" class="text-sm">
                <td class="py-3">
                  <div class="font-medium text-gray-900 dark:text-white">{{ product.productName }}</div>
                  <div class="text-xs text-gray-500">{{ t('dashboard.quantitySold') }}: {{ product.quantitySold }}</div>
                </td>
                <td class="py-3 text-center text-gray-600 dark:text-gray-300">{{ product.orderCount }}</td>
                <td class="py-3 text-right font-medium text-gray-900 dark:text-white">
                  {{ formatCurrency(product.totalRevenue) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Customers -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('dashboard.topCustomers') }}</h2>
          <NuxtLink to="/dashboard/customers" class="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            {{ t('nav.customers') }} &rarr;
          </NuxtLink>
        </div>
        <div v-if="isLoading" class="animate-pulse space-y-3">
          <div v-for="i in 5" :key="i" class="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div v-else-if="!dashboardStats?.topCustomers?.length" class="text-center py-8 text-gray-500">
          {{ t('common.noData') }}
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="text-left text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                <th class="pb-3 font-medium">{{ t('customers.name') }}</th>
                <th class="pb-3 font-medium text-center">{{ t('dashboard.orders') }}</th>
                <th class="pb-3 font-medium text-right">{{ t('customers.totalSpent') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="customer in dashboardStats.topCustomers.slice(0, 5)" :key="customer.customerId || customer.phone" class="text-sm">
                <td class="py-3">
                  <div class="font-medium text-gray-900 dark:text-white">{{ customer.customerName }}</div>
                  <div class="text-xs text-gray-500">{{ customer.phone }}</div>
                </td>
                <td class="py-3 text-center text-gray-600 dark:text-gray-300">{{ customer.orderCount }}</td>
                <td class="py-3 text-right font-medium text-gray-900 dark:text-white">
                  {{ formatCurrency(customer.totalSpent) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Delivery Company Performance -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('dashboard.deliveryPerformance') }}</h2>
        <NuxtLink to="/dashboard/delivery-companies" class="text-sm text-primary-600 dark:text-primary-400 hover:underline">
          {{ t('nav.deliveryCompanies') }} &rarr;
        </NuxtLink>
      </div>
      <div v-if="isLoading" class="animate-pulse space-y-3">
        <div v-for="i in 3" :key="i" class="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div v-else-if="!dashboardStats?.deliveryCompanyPerformance?.length" class="text-center py-8 text-gray-500">
        {{ t('common.noData') }}
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="text-left text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
              <th class="pb-3 font-medium">{{ t('nav.deliveryCompanies') }}</th>
              <th class="pb-3 font-medium text-center">{{ t('dashboard.totalOrders') }}</th>
              <th class="pb-3 font-medium text-center">{{ t('dashboard.delivered') }}</th>
              <th class="pb-3 font-medium text-center">{{ t('dashboard.returned') }}</th>
              <th class="pb-3 font-medium text-center">{{ t('dashboard.deliveryRate') }}</th>
              <th class="pb-3 font-medium text-right">{{ t('dashboard.revenue') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="company in dashboardStats.deliveryCompanyPerformance" :key="company.deliveryCompanyId" class="text-sm">
              <td class="py-3 font-medium text-gray-900 dark:text-white">{{ company.deliveryCompanyName }}</td>
              <td class="py-3 text-center text-gray-600 dark:text-gray-300">{{ company.totalOrders }}</td>
              <td class="py-3 text-center text-green-600 dark:text-green-400">{{ company.deliveredOrders }}</td>
              <td class="py-3 text-center text-red-600 dark:text-red-400">{{ company.returnedOrders }}</td>
              <td class="py-3 text-center">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    company.deliveryRate >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    company.deliveryRate >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  ]"
                >
                  {{ company.deliveryRate.toFixed(1) }}%
                </span>
              </td>
              <td class="py-3 text-right font-medium text-gray-900 dark:text-white">
                {{ formatCurrency(company.totalRevenue) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ShoppingCartIcon,
  BanknotesIcon,
  TruckIcon,
  PlusIcon,
  CubeIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import { useDashboardService, useSettingsService } from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Dashboard.View'
})

const { t, locale } = useI18n()
const { user } = useAuth()
const { formatCurrency } = useSettingsService()

// Use dashboard service with Vue Query caching
const { overview: dashboardStats, isLoading, refetchOverview } = useDashboardService(ref({}))

// Today's date
const todayDate = computed(() => {
  return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-MA' : 'fr-MA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date())
})
</script>
