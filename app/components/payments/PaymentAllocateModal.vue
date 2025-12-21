<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { Payment, UnallocatedOrder, AllocatePaymentRequest } from '~/types/payment'

const props = defineProps<{
  show: boolean
  payment: Payment | null
  unallocatedOrders: UnallocatedOrder[]
  isLoadingOrders: boolean
}>()

const emit = defineEmits<{
  close: []
  allocate: [data: AllocatePaymentRequest]
}>()

const { t } = useI18n()

interface OrderAllocation {
  orderId: string
  amount: number
  selected: boolean
}

const orderAllocations = ref<OrderAllocation[]>([])

watch(() => props.show, (val) => {
  if (val && props.unallocatedOrders) {
    orderAllocations.value = props.unallocatedOrders.map(order => ({
      orderId: order.id,
      amount: order.price,
      selected: false
    }))
  }
})

watch(() => props.unallocatedOrders, (orders) => {
  if (orders && props.show) {
    orderAllocations.value = orders.map(order => ({
      orderId: order.id,
      amount: order.price,
      selected: false
    }))
  }
}, { deep: true })

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

const toggleOrder = (index: number) => {
  orderAllocations.value[index].selected = !orderAllocations.value[index].selected
}

const selectedTotalAmount = computed(() => {
  return orderAllocations.value
    .filter(a => a.selected)
    .reduce((sum, a) => sum + a.amount, 0)
})

const remainingAmount = computed(() => {
  if (!props.payment) return 0
  return props.payment.unallocatedAmount - selectedTotalAmount.value
})

const canAllocate = computed(() => {
  return selectedTotalAmount.value > 0 && remainingAmount.value >= 0
})

const handleAllocate = () => {
  if (!props.payment || !canAllocate.value) return

  const selectedAllocations = orderAllocations.value
    .filter(a => a.selected)
    .map(a => ({
      orderId: a.orderId,
      amount: a.amount
    }))

  emit('allocate', {
    paymentId: props.payment.id,
    orderAllocations: selectedAllocations
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
            <DialogPanel v-if="payment" class="w-full max-w-4xl transform rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('payments.allocatePayment') }} - {{ payment.paymentCode }}
              </DialogTitle>

              <div class="mt-4 space-y-4">
                <!-- Payment summary -->
                <div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div class="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span class="text-gray-500">{{ t('payments.unallocatedAmount') }}:</span>
                      <div class="text-lg font-semibold text-blue-600">{{ formatCurrency(payment.unallocatedAmount) }}</div>
                    </div>
                    <div>
                      <span class="text-gray-500">{{ t('payments.selectedAmount') }}:</span>
                      <div class="text-lg font-semibold" :class="selectedTotalAmount > payment.unallocatedAmount ? 'text-red-600' : 'text-green-600'">
                        {{ formatCurrency(selectedTotalAmount) }}
                      </div>
                    </div>
                    <div>
                      <span class="text-gray-500">{{ t('payments.remainingAfter') }}:</span>
                      <div class="text-lg font-semibold" :class="remainingAmount < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'">
                        {{ formatCurrency(remainingAmount) }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Orders list -->
                <div class="rounded-lg border border-gray-200 dark:border-gray-700">
                  <div class="max-h-80 overflow-y-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead class="bg-gray-50 dark:bg-gray-900 sticky top-0">
                        <tr>
                          <th class="w-12 px-4 py-3"></th>
                          <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">{{ t('orders.orderNumber') }}</th>
                          <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">{{ t('orders.customer') }}</th>
                          <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">{{ t('orders.state') }}</th>
                          <th class="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">{{ t('orders.total') }}</th>
                          <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">{{ t('payments.deliveredDate') }}</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr v-if="isLoadingOrders">
                          <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                            {{ t('common.loading') }}
                          </td>
                        </tr>
                        <tr v-else-if="unallocatedOrders.length === 0">
                          <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                            {{ t('payments.noUnallocatedOrders') }}
                          </td>
                        </tr>
                        <tr
                          v-for="(order, index) in unallocatedOrders"
                          :key="order.id"
                          class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          :class="{ 'bg-green-50 dark:bg-green-900/10': orderAllocations[index]?.selected }"
                        >
                          <td class="px-4 py-3">
                            <input
                              type="checkbox"
                              :checked="orderAllocations[index]?.selected"
                              class="h-4 w-4 rounded border-gray-300"
                              @change="toggleOrder(index)"
                            />
                          </td>
                          <td class="whitespace-nowrap px-4 py-3 text-sm font-medium text-primary-600">
                            {{ order.code }}
                          </td>
                          <td class="px-4 py-3 text-sm">
                            <div>{{ order.fullName }}</div>
                            <div class="text-xs text-gray-500">{{ order.phone }}</div>
                          </td>
                          <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                            {{ order.state || '-' }}
                          </td>
                          <td class="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                            {{ formatCurrency(order.price) }}
                          </td>
                          <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                            {{ formatDate(order.dateValidated) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Warning if over-allocating -->
                <div v-if="remainingAmount < 0" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {{ t('payments.overAllocationWarning') }}
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                  @click="handleClose"
                >
                  {{ t('common.cancel') }}
                </button>
                <button
                  type="button"
                  :disabled="!canAllocate"
                  class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  @click="handleAllocate"
                >
                  {{ t('payments.allocate') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
