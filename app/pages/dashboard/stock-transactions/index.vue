<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.stockTransactions') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('common.records') }}</p>
      </div>
      <div class="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
        {{ $t('stockTransactions.readOnlyNotice') }}
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchKeyword"
            type="text"
            class="input pl-10"
            :placeholder="$t('common.search') + '...'"
            @input="debouncedSearch"
          />
        </div>
        <select v-model="filterProductId" class="input" @change="applyFilters">
          <option value="">{{ $t('stockTransactions.allProducts') }}</option>
          <option v-for="product in productsList" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>
        <select v-model="filterType" class="input" @change="applyFilters">
          <option value="">{{ $t('stockTransactions.allTypes') }}</option>
          <option v-for="type in STOCK_TRANSACTION_TYPES" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-3 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="stockTransactions.length === 0" class="text-center py-12">
        <DocumentTextIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('stockTransactions.type') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('nav.products') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.quantity') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('stockTransactions.price') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('stockTransactions.before') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('stockTransactions.after') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('stockTransactions.reference') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.date') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in stockTransactions" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span
                  :class="getTypeClass(item.type)"
                  class="px-2 py-1 text-xs font-medium rounded"
                >
                  {{ item.type }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="font-medium text-gray-900 dark:text-white">{{ item.productName }}</span>
                <span v-if="item.variantName" class="block text-xs text-gray-500 dark:text-gray-400">
                  {{ item.variantName }}
                  <span v-if="item.variantSku" class="text-gray-400">({{ item.variantSku }})</span>
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  :class="[
                    'font-semibold',
                    (item.quantity ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  ]"
                >
                  {{ (item.quantity ?? 0) >= 0 ? '+' : '' }}{{ item.quantity }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="text-gray-900 dark:text-white">{{ formatCurrency(item.price) }}</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span class="text-gray-500 dark:text-gray-400">{{ item.quantityBefore }}</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span class="font-medium text-gray-900 dark:text-white">{{ item.quantityAfter }}</span>
              </td>
              <td class="py-3 px-4">
                <span v-if="item.referenceCode" class="font-mono text-xs text-gray-600 dark:text-gray-400">
                  {{ item.referenceCode }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-600 dark:text-gray-400 text-sm">{{ formatDate(item.dateAdded) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Page {{ pagination.currentPage }} / {{ pagination.totalPages }}
        </p>
        <div class="flex gap-2">
          <button
            @click="setPage(pagination.currentPage - 1)"
            :disabled="!pagination.hasPreviousPage"
            class="btn-secondary text-sm px-3 py-1"
          >
            {{ $t('common.previous') }}
          </button>
          <button
            @click="setPage(pagination.currentPage + 1)"
            :disabled="!pagination.hasNextPage"
            class="btn-secondary text-sm px-3 py-1"
          >
            {{ $t('common.next') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  MagnifyingGlassIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import { useStockTransactionsService, useProductsService } from '~/services'
import { STOCK_TRANSACTION_TYPES } from '~/types/stocktransaction'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.StockTransactions.View'
})

// Stock transactions service (read-only)
const {
  items: stockTransactions,
  pagination,
  isLoading,
  setPage,
  setKeyword,
  setFilters,
} = useStockTransactionsService()

// Products for dropdown
const { items: productsList } = useProductsService()

// Format helpers
const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount?: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount || 0)
}

const getTypeClass = (type?: string) => {
  const colors: Record<string, string> = {
    Purchase: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Sale: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Return: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    Adjustment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    Transfer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
  return colors[type || ''] || colors.Transfer
}

// Search & Filters
const searchKeyword = ref('')
const filterProductId = ref('')
const filterType = ref('')

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => setKeyword(searchKeyword.value), 300)
}

// Apply filters
const applyFilters = () => {
  setFilters({
    productId: filterProductId.value || undefined,
    type: filterType.value || undefined
  })
}
</script>
