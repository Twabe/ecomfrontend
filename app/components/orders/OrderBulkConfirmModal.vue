<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import type { ConfirmOrderRequest } from '~/types/order'
import type { DeliveryCompany } from '~/types/deliveryCompany'

const props = defineProps<{
  show: boolean
  selectedCount: number
  deliveryCompanies?: DeliveryCompany[]
}>()

const emit = defineEmits<{
  close: []
  confirm: [data: Omit<ConfirmOrderRequest, 'orderId'>]
}>()

const { t } = useI18n()

const confirmData = ref({
  moveToShipping: true,
  deliveryCompanyId: '',
  comment: ''
})

watch(() => props.show, (val) => {
  if (val) {
    confirmData.value = {
      moveToShipping: true,
      deliveryCompanyId: '',
      comment: ''
    }
  }
})

const handleConfirm = () => {
  emit('confirm', {
    moveToShipping: confirmData.value.moveToShipping,
    deliveryCompanyId: confirmData.value.deliveryCompanyId || undefined,
    comment: confirmData.value.comment || undefined
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
            <DialogPanel class="w-full max-w-md transform rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircleIcon class="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ t('orders.bulkConfirmTitle') }}
                </DialogTitle>
              </div>

              <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {{ t('orders.bulkConfirmMessage', { count: selectedCount }) }}
              </p>

              <div class="mt-4 space-y-4">
                <div class="flex items-center gap-2">
                  <input
                    id="moveToShipping"
                    v-model="confirmData.moveToShipping"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300"
                  />
                  <label for="moveToShipping" class="text-sm text-gray-700 dark:text-gray-300">
                    {{ t('orders.moveToShipping') }}
                  </label>
                </div>

                <!-- Delivery Company (optional) -->
                <div v-if="confirmData.moveToShipping && deliveryCompanies?.length">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('nav.deliveryCompanies') }} ({{ t('common.optional') }})
                  </label>
                  <select
                    v-model="confirmData.deliveryCompanyId"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{{ t('common.select') }}</option>
                    <option v-for="dc in deliveryCompanies" :key="dc.id" :value="dc.id">
                      {{ dc.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('common.note') }}
                  </label>
                  <textarea
                    v-model="confirmData.comment"
                    rows="2"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    :placeholder="t('orders.bulkConfirmComment')"
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
                  class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  @click="handleConfirm"
                >
                  {{ t('orders.confirmOrders', { count: selectedCount }) }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
