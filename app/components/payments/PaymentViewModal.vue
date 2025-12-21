<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import type { PaymentDetails } from '~/types/payment'

const props = defineProps<{
  show: boolean
  payment: PaymentDetails | null
}>()

const emit = defineEmits<{
  close: []
  deallocate: [allocationIds: string[]]
}>()

const { t } = useI18n()

const selectedAllocationIds = ref<string[]>([])

watch(() => props.show, (val) => {
  if (val) {
    selectedAllocationIds.value = []
  }
})

const toggleAllocation = (allocationId: string) => {
  const index = selectedAllocationIds.value.indexOf(allocationId)
  if (index === -1) {
    selectedAllocationIds.value.push(allocationId)
  } else {
    selectedAllocationIds.value.splice(index, 1)
  }
}

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

const getMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    cash: t('payments.methods.cash'),
    bank_transfer: t('payments.methods.bankTransfer'),
    check: t('payments.methods.check')
  }
  return labels[method] || method
}

const handleDeallocate = () => {
  if (selectedAllocationIds.value.length === 0) return
  emit('deallocate', selectedAllocationIds.value)
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
            <DialogPanel v-if="payment" class="w-full max-w-3xl transform rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('payments.paymentDetails') }} - {{ payment.code }}
              </DialogTitle>

              <div class="mt-4 space-y-4">
                <!-- Payment Info -->
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ t('payments.information') }}</h4>
                  <div class="mt-2 grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                    <div><span class="text-gray-500">{{ t('nav.deliveryCompanies') }}:</span> {{ payment.deliveryCompanyName || '-' }}</div>
                    <div><span class="text-gray-500">{{ t('payments.paymentMethod') }}:</span> {{ getMethodLabel(payment.paymentMethod) }}</div>
                    <div><span class="text-gray-500">{{ t('payments.paymentDate') }}:</span> {{ formatDate(payment.paymentDate) }}</div>
                    <div><span class="text-gray-500">{{ t('payments.amount') }}:</span> <strong>{{ formatCurrency(payment.amount) }}</strong></div>
                    <div><span class="text-gray-500">{{ t('payments.allocatedAmount') }}:</span> <span class="text-green-600">{{ formatCurrency(payment.allocatedAmount) }}</span></div>
                    <div><span class="text-gray-500">{{ t('payments.unallocatedAmount') }}:</span> <span class="text-orange-500">{{ formatCurrency(payment.unallocatedAmount) }}</span></div>
                  </div>
                  <div v-if="payment.bankReference" class="mt-2">
                    <span class="text-gray-500">{{ t('payments.bankReference') }}:</span> {{ payment.bankReference }}
                  </div>
                  <div v-if="payment.note" class="mt-2">
                    <span class="text-gray-500">{{ t('common.note') }}:</span> {{ payment.note }}
                  </div>
                </div>

                <!-- Allocations List -->
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <div class="flex items-center justify-between">
                    <h4 class="font-medium text-gray-900 dark:text-white">{{ t('payments.allocations') }} ({{ payment.allocations?.length || 0 }})</h4>
                    <button
                      v-if="selectedAllocationIds.length > 0"
                      class="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                      @click="handleDeallocate"
                    >
                      <TrashIcon class="h-4 w-4" />
                      {{ t('payments.deallocate') }} ({{ selectedAllocationIds.length }})
                    </button>
                  </div>
                  <div v-if="payment.allocations && payment.allocations.length > 0" class="mt-2 max-h-64 overflow-y-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead>
                        <tr>
                          <th class="w-10 px-2 py-1"></th>
                          <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">{{ t('orders.orderNumber') }}</th>
                          <th class="px-2 py-1 text-right text-xs font-medium text-gray-500">{{ t('payments.allocatedAmount') }}</th>
                          <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">{{ t('common.date') }}</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                        <tr v-for="allocation in payment.allocations" :key="allocation.id">
                          <td class="px-2 py-1">
                            <input
                              type="checkbox"
                              :checked="selectedAllocationIds.includes(allocation.id)"
                              class="h-4 w-4 rounded border-gray-300"
                              @change="toggleAllocation(allocation.id)"
                            />
                          </td>
                          <td class="px-2 py-1 text-sm text-primary-600">{{ allocation.orderCode }}</td>
                          <td class="px-2 py-1 text-right text-sm font-medium">{{ formatCurrency(allocation.amount) }}</td>
                          <td class="px-2 py-1 text-sm text-gray-500">{{ formatDate(allocation.createdOn) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p v-else class="mt-2 text-sm text-gray-500">{{ t('payments.noAllocations') }}</p>
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
