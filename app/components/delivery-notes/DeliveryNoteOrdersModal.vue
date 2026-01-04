<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { CreateDeliveryNoteWithOrdersRequest } from '~/types/deliveryNote'
import type { DeliveryCompany } from '~/types/deliveryCompany'
import type { Order } from '~/types/order'

const props = defineProps<{
  show: boolean
  deliveryCompanies: DeliveryCompany[]
  availableOrders: Order[]
  isLoadingOrders: boolean
  mode: 'create' | 'add'
  deliveryNoteId?: string
}>()

const emit = defineEmits<{
  close: []
  createWithOrders: [data: CreateDeliveryNoteWithOrdersRequest]
  addOrders: [orderIds: string[]]
  searchOrders: [params: { deliveryCompanyId?: string }]
}>()

const { t } = useI18n()

const selectedOrderIds = ref<string[]>([])
const deliveryCompanyId = ref<string>('')
const autoGenerateCode = ref(true)
const code = ref<string>('')

watch(() => props.show, (val) => {
  if (val) {
    selectedOrderIds.value = []
    deliveryCompanyId.value = ''
    autoGenerateCode.value = true
    code.value = ''
  }
})

watch(deliveryCompanyId, () => {
  emit('searchOrders', {
    deliveryCompanyId: deliveryCompanyId.value || undefined
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

const handleSubmit = () => {
  if (selectedOrderIds.value.length === 0) return
  if (props.mode === 'create' && !deliveryCompanyId.value) return

  if (props.mode === 'create') {
    emit('createWithOrders', {
      orderIds: selectedOrderIds.value,
      autoGenerateCode: autoGenerateCode.value,
      code: autoGenerateCode.value ? undefined : code.value,
      deliveryCompanyId: deliveryCompanyId.value
    })
  } else {
    emit('addOrders', selectedOrderIds.value)
  }
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
                {{ mode === 'create' ? t('deliveryNotes.createWithOrders') : t('deliveryNotes.addOrders') }}
              </DialogTitle>

              <div class="mt-4 space-y-4">
                <!-- Code and options for create mode -->
                <div v-if="mode === 'create'" class="grid grid-cols-2 gap-4">
                  <div class="col-span-2 flex items-center gap-2">
                    <input
                      v-model="autoGenerateCode"
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300"
                    />
                    <label class="text-sm text-gray-700 dark:text-gray-300">{{ t('deliveryNotes.autoGenerateCode') }}</label>
                  </div>
                  <div v-if="!autoGenerateCode">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('deliveryNotes.code') }}
                    </label>
                    <input
                      v-model="code"
                      type="text"
                      class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <!-- Filters -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('nav.deliveryCompanies') }} {{ mode === 'create' ? '*' : '' }}
                  </label>
                  <select
                    v-model="deliveryCompanyId"
                    :required="mode === 'create'"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{{ mode === 'create' ? t('common.select') : t('common.all') }}</option>
                    <option v-for="dc in deliveryCompanies" :key="dc.id" :value="dc.id">{{ dc.name }}</option>
                  </select>
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
                            {{ t('deliveryNotes.noAvailableOrders') }}
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
                    {{ t('deliveryNotes.selectedOrders') }}: <strong>{{ selectedOrderIds.length }}</strong>
                  </div>
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ t('deliveryNotes.totalAmount') }}: {{ formatCurrency(totalAmount) }}
                  </div>
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
                  :disabled="selectedOrderIds.length === 0 || (mode === 'create' && !deliveryCompanyId)"
                  class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                  @click="handleSubmit"
                >
                  {{ mode === 'create' ? t('common.create') : t('deliveryNotes.addOrders') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
