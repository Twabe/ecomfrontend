<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import type { DeliveryNoteDetails, DeliveryNoteOrder } from '~/types/deliveryNote'

const props = defineProps<{
  show: boolean
  deliveryNote: DeliveryNoteDetails | null
}>()

const emit = defineEmits<{
  close: []
  removeOrders: [orderIds: string[]]
}>()

const { t } = useI18n()

const selectedOrderIds = ref<string[]>([])

watch(() => props.show, (val) => {
  if (val) {
    selectedOrderIds.value = []
  }
})

const toggleOrder = (orderId: string) => {
  const index = selectedOrderIds.value.indexOf(orderId)
  if (index === -1) {
    selectedOrderIds.value.push(orderId)
  } else {
    selectedOrderIds.value.splice(index, 1)
  }
}

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

const handleRemoveOrders = () => {
  if (selectedOrderIds.value.length === 0) return
  emit('removeOrders', selectedOrderIds.value)
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
            <DialogPanel v-if="deliveryNote" class="w-full max-w-3xl transform rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('deliveryNotes.noteDetails') }} - {{ deliveryNote.code }}
              </DialogTitle>

              <div class="mt-4 space-y-4">
                <!-- DeliveryNote Info -->
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ t('deliveryNotes.information') }}</h4>
                  <div class="mt-2 grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                    <div><span class="text-gray-500">{{ t('nav.deliveryCompanies') }}:</span> {{ deliveryNote.deliveryCompanyName || '-' }}</div>
                    <div><span class="text-gray-500">{{ t('nav.stores') }}:</span> {{ deliveryNote.storeName || '-' }}</div>
                    <div><span class="text-gray-500">{{ t('deliveryNotes.ordersCount') }}:</span> {{ deliveryNote.ordersCount }}</div>
                    <div><span class="text-gray-500">{{ t('deliveryNotes.totalAmount') }}:</span> {{ formatCurrency(deliveryNote.totalAmount) }}</div>
                    <div><span class="text-gray-500">{{ t('deliveryNotes.dateCreated') }}:</span> {{ formatDate(deliveryNote.createdOn) }}</div>
                  </div>
                  <div v-if="deliveryNote.note" class="mt-2">
                    <span class="text-gray-500">{{ t('common.note') }}:</span> {{ deliveryNote.note }}
                  </div>
                </div>

                <!-- Orders List -->
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <div class="flex items-center justify-between">
                    <h4 class="font-medium text-gray-900 dark:text-white">{{ t('deliveryNotes.includedOrders') }} ({{ deliveryNote.orders?.length || 0 }})</h4>
                    <button
                      v-if="selectedOrderIds.length > 0"
                      class="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                      @click="handleRemoveOrders"
                    >
                      <TrashIcon class="h-4 w-4" />
                      {{ t('deliveryNotes.removeOrders') }} ({{ selectedOrderIds.length }})
                    </button>
                  </div>
                  <div v-if="deliveryNote.orders && deliveryNote.orders.length > 0" class="mt-2 max-h-64 overflow-y-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead>
                        <tr>
                          <th class="w-10 px-2 py-1"></th>
                          <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">{{ t('orders.orderNumber') }}</th>
                          <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">{{ t('orders.customer') }}</th>
                          <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">{{ t('orders.city') }}</th>
                          <th class="px-2 py-1 text-right text-xs font-medium text-gray-500">{{ t('orders.total') }}</th>
                          <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">{{ t('orders.status') }}</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                        <tr v-for="order in deliveryNote.orders" :key="order.orderId">
                          <td class="px-2 py-1">
                            <input
                              type="checkbox"
                              :checked="selectedOrderIds.includes(order.orderId)"
                              class="h-4 w-4 rounded border-gray-300"
                              @change="toggleOrder(order.orderId)"
                            />
                          </td>
                          <td class="px-2 py-1 text-sm text-primary-600">{{ order.orderCode }}</td>
                          <td class="px-2 py-1 text-sm">
                            <div>{{ order.customerName }}</div>
                            <div class="text-xs text-gray-500">{{ order.customerPhone }}</div>
                          </td>
                          <td class="px-2 py-1 text-sm text-gray-500">{{ order.city || '-' }}</td>
                          <td class="px-2 py-1 text-right text-sm">{{ formatCurrency(order.price) }}</td>
                          <td class="px-2 py-1 text-sm">
                            <span class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-600 dark:text-gray-300">
                              {{ order.state || '-' }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p v-else class="mt-2 text-sm text-gray-500">{{ t('deliveryNotes.noOrders') }}</p>
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
