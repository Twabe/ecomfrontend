<script setup lang="ts">
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'
import type { Payment } from '~/types/payment'

const props = defineProps<{
  payments: Payment[]
  isLoading: boolean
  pagination: {
    currentPage: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}>()

const emit = defineEmits<{
  view: [payment: Payment]
  edit: [payment: Payment]
  delete: [payment: Payment]
  allocate: [payment: Payment]
  pageChange: [page: number]
}>()

const { t } = useI18n()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-MA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('payments.code') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('nav.deliveryCompanies') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('payments.amount') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('common.status') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('payments.paymentDate') }}
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-if="isLoading">
            <td colspan="6" class="px-4 py-8 text-center text-gray-500">
              {{ t('common.loading') }}
            </td>
          </tr>
          <tr v-else-if="payments.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-gray-500">
              {{ t('common.noData') }}
            </td>
          </tr>
          <tr
            v-for="payment in payments"
            :key="payment.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td class="whitespace-nowrap px-4 py-3">
              <button
                class="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                @click="emit('view', payment)"
              >
                {{ payment.paymentCode }}
              </button>
              <div class="text-xs text-gray-500">
                {{ payment.linkedOrdersCount }} {{ t('orders.items') }}
              </div>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {{ payment.deliveryCompanyName }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">
              {{ formatCurrency(payment.amount) }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm">
              <span
                v-if="payment.isFullyAllocated"
                class="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              >
                {{ t('payments.allocated') }}
              </span>
              <span
                v-else
                class="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
              >
                {{ t('payments.unallocated') }}: {{ formatCurrency(payment.unallocatedAmount) }}
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(payment.paymentDate) }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <!-- View details button -->
                <button
                  class="rounded p-1 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                  :title="t('common.view')"
                  @click="emit('view', payment)"
                >
                  <EyeIcon class="h-5 w-5" />
                </button>
                <!-- Allocate button (only if not fully allocated) -->
                <button
                  v-if="!payment.isFullyAllocated"
                  class="rounded p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                  :title="t('payments.allocatePayment')"
                  @click="emit('allocate', payment)"
                >
                  <CurrencyDollarIcon class="h-5 w-5" />
                </button>
                <!-- Edit button -->
                <button
                  class="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  :title="t('common.edit')"
                  @click="emit('edit', payment)"
                >
                  <PencilSquareIcon class="h-5 w-5" />
                </button>
                <!-- Delete button -->
                <button
                  class="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  :title="t('common.delete')"
                  @click="emit('delete', payment)"
                >
                  <TrashIcon class="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ t('common.showing') }} {{ (pagination.currentPage - 1) * pagination.pageSize + 1 }} -
        {{ Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount) }}
        {{ t('common.of') }} {{ pagination.totalCount }}
      </div>
      <div class="flex gap-2">
        <button
          :disabled="pagination.currentPage === 1"
          class="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
          @click="emit('pageChange', pagination.currentPage - 1)"
        >
          {{ t('common.previous') }}
        </button>
        <button
          :disabled="pagination.currentPage === pagination.totalPages"
          class="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
          @click="emit('pageChange', pagination.currentPage + 1)"
        >
          {{ t('common.next') }}
        </button>
      </div>
    </div>
  </div>
</template>
