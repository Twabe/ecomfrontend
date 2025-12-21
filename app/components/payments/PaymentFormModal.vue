<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { Payment, CreatePaymentRequest, UpdatePaymentRequest } from '~/types/payment'
import type { DeliveryCompany } from '~/types/deliveryCompany'

const props = defineProps<{
  show: boolean
  payment: Payment | null
  deliveryCompanies: DeliveryCompany[]
}>()

const emit = defineEmits<{
  close: []
  create: [data: CreatePaymentRequest]
  update: [id: string, data: UpdatePaymentRequest]
}>()

const { t } = useI18n()

const isEditMode = computed(() => !!props.payment)

const formData = ref<CreatePaymentRequest>({
  deliveryCompanyId: '',
  paymentCode: '',
  amount: 0,
  paymentDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'Cash',
  bankReference: undefined,
  notes: undefined
})

watch(() => props.show, (val) => {
  if (val) {
    if (props.payment) {
      // For editing, we use data from the summary DTO
      formData.value = {
        deliveryCompanyId: '',  // Need to be set from details
        paymentCode: props.payment.paymentCode,
        amount: props.payment.amount,
        paymentDate: props.payment.paymentDate,
        paymentMethod: 'Cash',  // Default - details would have actual value
        bankReference: undefined,
        notes: undefined
      }
    } else {
      formData.value = {
        deliveryCompanyId: '',
        paymentCode: '',
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        bankReference: undefined,
        notes: undefined
      }
    }
  }
})

const handleSubmit = () => {
  if (isEditMode.value && props.payment) {
    emit('update', props.payment.id, formData.value)
  } else {
    emit('create', formData.value)
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
            <DialogPanel class="w-full max-w-lg transform rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ isEditMode ? t('payments.editPayment') : t('payments.createPayment') }}
              </DialogTitle>

              <form class="mt-4 space-y-4" @submit.prevent="handleSubmit">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('payments.code') }} *
                    </label>
                    <input
                      v-model="formData.paymentCode"
                      type="text"
                      required
                      class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('payments.amount') }} *
                    </label>
                    <input
                      v-model.number="formData.amount"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('nav.deliveryCompanies') }} *
                  </label>
                  <select
                    v-model="formData.deliveryCompanyId"
                    required
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option :value="undefined">{{ t('common.select') }}</option>
                    <option v-for="dc in deliveryCompanies" :key="dc.id" :value="dc.id">{{ dc.name }}</option>
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('payments.paymentMethod') }} *
                    </label>
                    <select
                      v-model="formData.paymentMethod"
                      required
                      class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Cash">{{ t('payments.methods.cash') }}</option>
                      <option value="BankTransfer">{{ t('payments.methods.bankTransfer') }}</option>
                      <option value="Check">{{ t('payments.methods.check') }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('payments.paymentDate') }}
                    </label>
                    <input
                      v-model="formData.paymentDate"
                      type="date"
                      class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div v-if="formData.paymentMethod !== 'Cash'">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('payments.bankReference') }}
                  </label>
                  <input
                    v-model="formData.bankReference"
                    type="text"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('common.note') }}
                  </label>
                  <textarea
                    v-model="formData.notes"
                    rows="3"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
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
                    type="submit"
                    class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    {{ isEditMode ? t('common.update') : t('common.create') }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
