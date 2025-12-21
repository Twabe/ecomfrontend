<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { Invoice, MarkInvoicePaidRequest } from '~/types/invoice'

const props = defineProps<{
  show: boolean
  invoice: Invoice | null
}>()

const emit = defineEmits<{
  close: []
  confirm: [data: MarkInvoicePaidRequest]
}>()

const { t } = useI18n()

const receivedDate = ref<string>('')

watch(() => props.show, (val) => {
  if (val) {
    receivedDate.value = new Date().toISOString().split('T')[0]
  }
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)
}

const handleConfirm = () => {
  if (!props.invoice) return
  emit('confirm', {
    invoiceId: props.invoice.id,
    receivedDate: receivedDate.value || undefined
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
            <DialogPanel v-if="invoice" class="w-full max-w-md transform rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('invoices.markAsPaid') }}
              </DialogTitle>

              <div class="mt-4 space-y-4">
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div><span class="text-gray-500">{{ t('invoices.code') }}:</span> {{ invoice.code }}</div>
                    <div><span class="text-gray-500">{{ t('invoices.ordersCount') }}:</span> {{ invoice.ordersCount }}</div>
                    <div class="col-span-2"><span class="text-gray-500">{{ t('invoices.totalPrice') }}:</span> <strong>{{ formatCurrency(invoice.totalPrice) }}</strong></div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('invoices.dateReceived') }}
                  </label>
                  <input
                    v-model="receivedDate"
                    type="date"
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
                  class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  @click="handleConfirm"
                >
                  {{ t('invoices.markAsPaid') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
