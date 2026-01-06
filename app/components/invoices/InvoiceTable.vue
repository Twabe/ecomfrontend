<script setup lang="ts">
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  BanknotesIcon
} from '@heroicons/vue/24/outline'
import type { Invoice } from '~/types/invoice'

const props = defineProps<{
  invoices: Invoice[]
  isLoading: boolean
  pagination: {
    currentPage: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}>()

const emit = defineEmits<{
  view: [invoice: Invoice]
  edit: [invoice: Invoice]
  delete: [invoice: Invoice]
  markPaid: [invoice: Invoice]
  pageChange: [page: number]
}>()

const { t } = useI18n()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)
}

const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-MA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Invoice type badge colors
const getInvoiceTypeBadge = (type: string | undefined) => {
  const types: Record<string, { label: string; class: string }> = {
    delivery_company: {
      label: t('invoices.typeDeliveryCompany') || 'Delivery',
      class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    },
    worker: {
      label: t('invoices.typeWorker') || 'Worker',
      class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    },
    media_buyer: {
      label: t('invoices.typeMediaBuyer') || 'Media Buyer',
      class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    },
    manual: {
      label: t('invoices.typeManual') || 'Manual',
      class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    }
  }
  return types[type || 'manual'] || types.manual
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('invoices.code') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('invoices.type') || 'Type' }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('nav.deliveryCompanies') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('nav.stores') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('invoices.ordersCount') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('invoices.totalPrice') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('invoices.status') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('invoices.dateCreated') }}
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-if="isLoading">
            <td colspan="9" class="px-4 py-8 text-center text-gray-500">
              {{ t('common.loading') }}
            </td>
          </tr>
          <tr v-else-if="invoices.length === 0">
            <td colspan="9" class="px-4 py-8 text-center text-gray-500">
              {{ t('common.noData') }}
            </td>
          </tr>
          <tr
            v-for="invoice in invoices"
            :key="invoice.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td class="whitespace-nowrap px-4 py-3">
              <button
                class="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                @click="emit('view', invoice)"
              >
                {{ invoice.code }}
              </button>
            </td>
            <td class="whitespace-nowrap px-4 py-3">
              <span
                class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                :class="getInvoiceTypeBadge(invoice.invoiceType).class"
              >
                {{ invoice.invoiceTypeName || getInvoiceTypeBadge(invoice.invoiceType).label }}
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {{ invoice.deliveryCompanyName || '-' }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {{ invoice.storeName || '-' }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
              {{ invoice.ordersCount }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">
              {{ formatCurrency(invoice.totalPrice) }}
            </td>
            <td class="whitespace-nowrap px-4 py-3">
              <div class="flex gap-2">
                <span
                  class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                  :class="invoice.isValidated ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'"
                >
                  {{ invoice.isValidated ? t('invoices.validated') : t('invoices.notValidated') }}
                </span>
                <span
                  class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                  :class="invoice.isReceived ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'"
                >
                  {{ invoice.isReceived ? t('invoices.received') : t('invoices.notReceived') }}
                </span>
              </div>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(invoice.dateCreated) }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <!-- View details button -->
                <button
                  class="rounded p-1 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                  :title="t('common.view')"
                  @click="emit('view', invoice)"
                >
                  <EyeIcon class="h-5 w-5" />
                </button>
                <!-- Mark as paid button (only if not received) -->
                <button
                  v-if="!invoice.isReceived"
                  class="rounded p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                  :title="t('invoices.markAsPaid')"
                  @click="emit('markPaid', invoice)"
                >
                  <BanknotesIcon class="h-5 w-5" />
                </button>
                <!-- Validated indicator -->
                <CheckCircleIcon
                  v-if="invoice.isValidated"
                  class="h-5 w-5 text-green-500"
                  :title="t('invoices.validated')"
                />
                <!-- Edit button -->
                <button
                  class="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  :title="t('common.edit')"
                  @click="emit('edit', invoice)"
                >
                  <PencilSquareIcon class="h-5 w-5" />
                </button>
                <!-- Delete button -->
                <button
                  class="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  :title="t('common.delete')"
                  @click="emit('delete', invoice)"
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
