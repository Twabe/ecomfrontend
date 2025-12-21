<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { GenerateInvoiceRequest } from '~/types/invoice'
import type { DeliveryCompany } from '~/types/deliveryCompany'
import type { Store } from '~/types/store'
import type { Order } from '~/types/order'

const props = defineProps<{
  show: boolean
  deliveryCompanies: DeliveryCompany[]
  stores: Store[]
  availableOrders: Order[]
  isLoadingOrders: boolean
}>()

const emit = defineEmits<{
  close: []
  generate: [data: GenerateInvoiceRequest]
  searchOrders: [params: { deliveryCompanyId?: string; storeId?: string }]
}>()

const { t } = useI18n()

const selectedOrderIds = ref<string[]>([])
const deliveryCompanyId = ref<string>('')
const storeId = ref<string>('')
const note = ref<string>('')

watch(() => props.show, (val) => {
  if (val) {
    selectedOrderIds.value = []
    deliveryCompanyId.value = ''
    storeId.value = ''
    note.value = ''
  }
})

watch([deliveryCompanyId, storeId], () => {
  emit('searchOrders', {
    deliveryCompanyId: deliveryCompanyId.value || undefined,
    storeId: storeId.value || undefined
  })
})

const selectAll = ref(false)

watch(selectAll, (val) => {
  selectedOrderIds.value = val ? props.availableOrders.map(o => o.id) : []
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

const totalAmount = computed(() => {
  return props.availableOrders
    .filter(o => selectedOrderIds.value.includes(o.id))
    .reduce((sum, o) => sum + o.price, 0)
})

const handleGenerate = () => {
  if (selectedOrderIds.value.length === 0) return

  emit('generate', {
    orderIds: selectedOrderIds.value,
    deliveryCompanyId: deliveryCompanyId.value || undefined,
    storeId: storeId.value || undefined,
    note: note.value || undefined
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
            <DialogPanel class="w-full max-w-4xl transform rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('invoices.generateFromOrders') }}
              </DialogTitle>

              <div class="mt-4 space-y-4">
                <!-- Filters -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('nav.deliveryCompanies') }}
                    </label>
                    <select
                      v-model="deliveryCompanyId"
                      class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">{{ t('common.all') }}</option>
                      <option v-for="dc in deliveryCompanies" :key="dc.id" :value="dc.id">{{ dc.name }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('nav.stores') }}
                    </label>
                    <select
                      v-model="storeId"
                      class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">{{ t('common.all') }}</option>
                      <option v-for="store in stores" :key="store.id" :value="store.id">{{ store.name }}</option>
                    </select>
                  </div>
                </div>

                <!-- Orders list -->
                <div class="rounded-lg border border-gray-200 dark:border-gray-700">
                  <div class="max-h-80 overflow-y-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead class="bg-gray-50 dark:bg-gray-900 sticky top-0">
                        <tr>
                          <th class="w-12 px-4 py-3">
                            <input
                              v-model="selectAll"
                              type="checkbox"
                              class="h-4 w-4 rounded border-gray-300"
                            />
                          </th>
                          <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">{{ t('orders.orderNumber') }}</th>
                          <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">{{ t('orders.customer') }}</th>
                          <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">{{ t('orders.city') }}</th>
                          <th class="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">{{ t('orders.total') }}</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr v-if="isLoadingOrders">
                          <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                            {{ t('common.loading') }}
                          </td>
                        </tr>
                        <tr v-else-if="availableOrders.length === 0">
                          <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                            {{ t('invoices.noDeliveredOrders') }}
                          </td>
                        </tr>
                        <tr
                          v-for="order in availableOrders"
                          :key="order.id"
                          class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td class="px-4 py-3">
                            <input
                              type="checkbox"
                              :checked="selectedOrderIds.includes(order.id)"
                              class="h-4 w-4 rounded border-gray-300"
                              @change="toggleOrder(order.id)"
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
                            {{ order.cityName }}
                          </td>
                          <td class="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                            {{ formatCurrency(order.price) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Summary -->
                <div class="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <div class="text-sm text-gray-600 dark:text-gray-300">
                    {{ t('invoices.selectedOrders') }}: <strong>{{ selectedOrderIds.length }}</strong>
                  </div>
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ t('invoices.totalPrice') }}: {{ formatCurrency(totalAmount) }}
                  </div>
                </div>

                <!-- Note -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('common.note') }}
                  </label>
                  <textarea
                    v-model="note"
                    rows="2"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
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
                  :disabled="selectedOrderIds.length === 0"
                  class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                  @click="handleGenerate"
                >
                  {{ t('invoices.generate') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
