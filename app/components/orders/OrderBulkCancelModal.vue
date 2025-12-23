<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { XCircleIcon } from '@heroicons/vue/24/outline'
import type { CancelOrderRequest } from '~/types/order'
import type { Reason } from '~/types/reason'

const props = defineProps<{
  show: boolean
  selectedCount: number
  reasons: Reason[]
}>()

const emit = defineEmits<{
  close: []
  cancel: [data: Omit<CancelOrderRequest, 'orderId'>]
}>()

const { t } = useI18n()

const cancelData = ref({
  reasonId: '',
  customReason: '',
  comment: ''
})

watch(() => props.show, (val) => {
  if (val) {
    cancelData.value = {
      reasonId: '',
      customReason: '',
      comment: ''
    }
  }
})

const cancellationReasons = computed(() => {
  return props.reasons.filter(r => r.type === 'cancellation' || r.type === 'both')
})

const canSubmit = computed(() => {
  return cancelData.value.reasonId || cancelData.value.customReason
})

const handleCancel = () => {
  if (!canSubmit.value) return
  emit('cancel', {
    reasonId: cancelData.value.reasonId || undefined,
    customReason: cancelData.value.customReason || undefined,
    comment: cancelData.value.comment || undefined
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
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircleIcon class="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ t('orders.bulkCancelTitle') }}
                </DialogTitle>
              </div>

              <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {{ t('orders.bulkCancelMessage', { count: selectedCount }) }}
              </p>

              <div class="mt-4 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('nav.reasons') }} *
                  </label>
                  <select
                    v-model="cancelData.reasonId"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{{ t('common.select') }}</option>
                    <option v-for="reason in cancellationReasons" :key="reason.id" :value="reason.id">
                      {{ reason.title }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('orders.customReason') }}
                  </label>
                  <input
                    v-model="cancelData.customReason"
                    type="text"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    :placeholder="t('orders.customReasonPlaceholder')"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    {{ t('orders.reasonOrCustomRequired') }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('common.note') }}
                  </label>
                  <textarea
                    v-model="cancelData.comment"
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
                  {{ t('common.back') }}
                </button>
                <button
                  type="button"
                  :disabled="!canSubmit"
                  class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  @click="handleCancel"
                >
                  {{ t('orders.cancelOrders', { count: selectedCount }) }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
