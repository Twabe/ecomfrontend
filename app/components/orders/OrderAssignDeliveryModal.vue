<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import type { Order } from '~/types/order'

interface DeliveryCompany {
  id: string
  name: string
}

interface SubDeliveryCompany {
  id: string
  name: string
  deliveryCompanyId?: string
}

const props = defineProps<{
  show: boolean
  orders: Order[]
  deliveryCompanies: DeliveryCompany[]
  subDeliveryCompanies: SubDeliveryCompany[]
}>()

const emit = defineEmits<{
  close: []
  confirm: [data: { orderIds: string[]; deliveryCompanyId: string; subDeliveryCompanyId?: string }]
}>()

const { t } = useI18n()

const deliveryCompanyId = ref('')
const subDeliveryCompanyId = ref('')
const isSubmitting = ref(false)

// Filter orders that can have delivery assigned
const validOrders = computed(() => {
  return props.orders.filter(order => {
    const phase = order.phase?.toLowerCase()
    const state = order.state?.toLowerCase()
    // Block terminal states
    if (['cancelled', 'canceled', 'delivered', 'returned'].includes(state || '')) return false
    // Only allow for shipping phase or confirmed orders
    return ['suivi', 'shipping', 'quality'].includes(phase || '') || state === 'confirmed'
  })
})

const invalidOrders = computed(() => {
  return props.orders.filter(order => !validOrders.value.includes(order))
})

// Filter sub-delivery companies based on selected delivery company
const filteredSubDeliveryCompanies = computed(() => {
  if (!deliveryCompanyId.value) return []
  return props.subDeliveryCompanies.filter(sub =>
    sub.deliveryCompanyId === deliveryCompanyId.value
  )
})

// Reset form when modal opens
watch(() => props.show, (val) => {
  if (val) {
    deliveryCompanyId.value = ''
    subDeliveryCompanyId.value = ''
    isSubmitting.value = false
  }
})

// Reset sub-delivery when delivery company changes
watch(deliveryCompanyId, () => {
  subDeliveryCompanyId.value = ''
})

const canSubmit = computed(() => {
  return deliveryCompanyId.value && validOrders.value.length > 0 && !isSubmitting.value
})

const handleConfirm = () => {
  if (!canSubmit.value) return
  isSubmitting.value = true
  emit('confirm', {
    orderIds: validOrders.value.map(o => o.id),
    deliveryCompanyId: deliveryCompanyId.value,
    subDeliveryCompanyId: subDeliveryCompanyId.value || undefined
  })
}

const handleClose = () => {
  if (!isSubmitting.value) {
    emit('close')
  }
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
            <DialogPanel class="w-full max-w-md transform rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('orders.assignDelivery') }}
              </DialogTitle>

              <div class="mt-4 space-y-4">
                <!-- Summary -->
                <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    {{ t('orders.assignDeliveryToOrders', { count: validOrders.length }) }}
                  </p>
                </div>

                <!-- Warning for invalid orders -->
                <div v-if="invalidOrders.length > 0" class="flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                  <ExclamationTriangleIcon class="h-5 w-5 flex-shrink-0 text-amber-500" />
                  <div class="text-sm text-amber-700 dark:text-amber-300">
                    <p class="font-medium">{{ t('orders.someOrdersCannotAssign') }}</p>
                    <p class="mt-1">
                      {{ invalidOrders.length }} {{ t('orders.ordersSkipped') }}
                    </p>
                  </div>
                </div>

                <!-- Delivery Company -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('orders.deliveryCompany') }} *
                  </label>
                  <select
                    v-model="deliveryCompanyId"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    :disabled="isSubmitting"
                  >
                    <option value="">{{ t('common.select') }}</option>
                    <option v-for="dc in deliveryCompanies" :key="dc.id" :value="dc.id">
                      {{ dc.name }}
                    </option>
                  </select>
                </div>

                <!-- Sub-Delivery Company -->
                <div v-if="filteredSubDeliveryCompanies.length > 0">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('orders.subDeliveryCompany') }}
                  </label>
                  <select
                    v-model="subDeliveryCompanyId"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    :disabled="isSubmitting"
                  >
                    <option value="">{{ t('common.none') }}</option>
                    <option v-for="sub in filteredSubDeliveryCompanies" :key="sub.id" :value="sub.id">
                      {{ sub.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
                  :disabled="isSubmitting"
                  @click="handleClose"
                >
                  {{ t('common.cancel') }}
                </button>
                <button
                  type="button"
                  class="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                  :disabled="!canSubmit"
                  @click="handleConfirm"
                >
                  <span v-if="isSubmitting">{{ t('common.processing') }}</span>
                  <span v-else>{{ t('orders.assign') }}</span>
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
