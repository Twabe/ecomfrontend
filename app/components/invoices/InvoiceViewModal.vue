<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { InvoiceDetails, InvoiceOrder } from '~/types/invoice'

const props = defineProps<{
  show: boolean
  invoice: InvoiceDetails | null
}>()

const emit = defineEmits<{
  close: []
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

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <TransitionRoot :show="show" as="template">
    <Dialog class="relative z-50" @close="handleClose">
      <TransitionChild
        enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-300" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
            leave="ease-in duration-200" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
          >
            <DialogPanel v-if="invoice" class="w-full max-w-3xl transform rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('invoices.invoiceDetails') }} - {{ invoice.code }}
              </DialogTitle>

              <div class="mt-4 space-y-4">
                <!-- Status badges -->
                <div class="flex gap-2">
                  <span
                    class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                    :class="invoice.isValidated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                  >
                    {{ invoice.isValidated ? t('invoices.validated') : t('invoices.notValidated') }}
                  </span>
                  <span
                    class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                    :class="invoice.isReceived ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ invoice.isReceived ? t('invoices.received') : t('invoices.notReceived') }}
                  </span>
                </div>

                <!-- Invoice Info -->
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ t('invoices.information') }}</h4>
                  <div class="mt-2 grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                    <div><span class="text-gray-500">{{ t('nav.deliveryCompanies') }}:</span> {{ invoice.deliveryCompanyName || '-' }}</div>
                    <div><span class="text-gray-500">{{ t('nav.stores') }}:</span> {{ invoice.storeName || '-' }}</div>
                    <div v-if="invoice.workerName"><span class="text-gray-500">{{ t('invoices.typeWorker') }}:</span> {{ invoice.workerName }}</div>
                    <div v-if="invoice.mediaBuyerName"><span class="text-gray-500">{{ t('invoices.typeMediaBuyer') }}:</span> {{ invoice.mediaBuyerName }}</div>
                    <div><span class="text-gray-500">{{ t('invoices.ordersCount') }}:</span> {{ invoice.ordersCount }}</div>
                    <div><span class="text-gray-500">{{ t('invoices.totalPrice') }}:</span> {{ formatCurrency(invoice.totalPrice) }}</div>
                    <div><span class="text-gray-500">{{ t('invoices.dateCreated') }}:</span> {{ formatDate(invoice.dateCreated) }}</div>
                    <div><span class="text-gray-500">{{ t('invoices.dateReceived') }}:</span> {{ formatDate(invoice.dateReceived) }}</div>
                  </div>
                  <div v-if="invoice.note" class="mt-2">
                    <span class="text-gray-500">{{ t('common.note') }}:</span> {{ invoice.note }}
                  </div>
                </div>

                <!-- Orders List -->
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ t('invoices.includedOrders') }} ({{ invoice.orders?.length || 0 }})</h4>
                  <div v-if="invoice.orders && invoice.orders.length > 0" class="mt-2 max-h-64 overflow-y-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead>
                        <tr>
                          <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">{{ t('orders.orderNumber') }}</th>
                          <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">{{ t('orders.customer') }}</th>
                          <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">{{ t('orders.city') }}</th>
                          <th class="px-2 py-1 text-right text-xs font-medium text-gray-500">{{ t('orders.total') }}</th>
                          <th class="px-2 py-1 text-right text-xs font-medium text-gray-500">{{ t('orders.shipping') }}</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                        <tr v-for="order in invoice.orders" :key="order.orderId">
                          <td class="px-2 py-1 text-sm text-primary-600">{{ order.orderCode }}</td>
                          <td class="px-2 py-1 text-sm">
                            <div>{{ order.customerName }}</div>
                            <div class="text-xs text-gray-500">{{ order.customerPhone }}</div>
                          </td>
                          <td class="px-2 py-1 text-sm text-gray-500">{{ order.city || '-' }}</td>
                          <td class="px-2 py-1 text-right text-sm">{{ formatCurrency(order.price) }}</td>
                          <td class="px-2 py-1 text-right text-sm text-gray-500">{{ formatCurrency(order.fees) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p v-else class="mt-2 text-sm text-gray-500">{{ t('invoices.noOrders') }}</p>
                </div>
              </div>

              <div class="mt-6 flex justify-end">
                <button
                  type="button"
                  class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                  @click="handleClose"
                >
                  {{ t('common.close') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
