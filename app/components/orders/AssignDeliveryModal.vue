<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { Order, AssignDeliveryCompanyRequest } from '~/types/order'
import type { DeliveryCompany } from '~/types/deliverycompany'

const props = defineProps<{
  show: boolean
  order: Order | null
  deliveryCompanies: DeliveryCompany[]
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [data: AssignDeliveryCompanyRequest]
}>()

const { t } = useI18n()

const formData = ref<AssignDeliveryCompanyRequest>({
  orderId: '',
  deliveryCompanyId: ''
})

watch(() => props.show, (val) => {
  if (val && props.order) {
    formData.value = {
      orderId: props.order.id,
      deliveryCompanyId: props.order.deliveryCompanyId || ''
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
                {{ t('worker.assignDelivery') }}
              </DialogTitle>

              <!-- Order Info Summary -->
              <div v-if="order" class="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="font-mono text-sm font-semibold text-primary-600">{{ order.code }}</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ order.fullName }}</span>
                </div>
                <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ order.phone }} - {{ order.cityName || '-' }}
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
                  class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                  :disabled="!isFormValid || isSubmitting"
                  @click="handleSubmit"
                >
                  <span v-if="isSubmitting" class="flex items-center gap-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {{ t('common.saving') }}
                  </span>
                  <span v-else>{{ t('common.save') }}</span>
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
