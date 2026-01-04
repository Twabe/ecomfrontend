<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { DeliveryCompany } from '~/types/deliverycompany'

const props = defineProps<{
  show: boolean
  orderCount: number
  deliveryCompanies: DeliveryCompany[]
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [data: { deliveryCompanyId: string }]
}>()

const { t } = useI18n()

const formData = ref({
  deliveryCompanyId: ''
})

// Reset form when modal opens
watch(() => props.show, (val) => {
  if (val) {
    formData.value = {
      deliveryCompanyId: ''
    }
  }
})

// Check if form is valid
const isFormValid = computed(() => {
  return !!formData.value.deliveryCompanyId
})

const handleSubmit = () => {
  if (!isFormValid.value) return
  emit('submit', formData.value)
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
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('worker.bulkAssignDeliveryTitle') }}
              </DialogTitle>

              <!-- Order Count Summary -->
              <div class="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-orange-600 dark:text-orange-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  <span class="text-sm font-medium text-orange-800 dark:text-orange-200">
                    {{ t('worker.bulkAssignDeliveryDesc', { count: orderCount }) }}
                  </span>
                </div>
              </div>

              <div class="mt-4 space-y-4">
                <!-- Delivery Company Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('nav.deliveryCompanies') }} <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="formData.deliveryCompanyId"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    :disabled="isSubmitting"
                  >
                    <option value="">{{ t('common.select') }}</option>
                    <option v-for="dc in deliveryCompanies" :key="dc.id" :value="dc.id">{{ dc.name }}</option>
                  </select>
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 disabled:opacity-50"
                  :disabled="isSubmitting"
                  @click="handleClose"
                >
                  {{ t('common.cancel') }}
                </button>
                <button
                  type="button"
                  class="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                  :disabled="!isFormValid || isSubmitting"
                  @click="handleSubmit"
                >
                  <span v-if="isSubmitting" class="flex items-center gap-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {{ t('common.saving') }}
                  </span>
                  <span v-else class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    {{ t('worker.assignDelivery') }}
                  </span>
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
