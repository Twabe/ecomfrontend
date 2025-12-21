<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { Reason } from '~/types/reason'

interface ReturnedData {
  reasonId: string
  customReason: string
  comment?: string
}

const props = defineProps<{
  show: boolean
  reasons: Reason[]
}>()

const emit = defineEmits<{
  close: []
  confirm: [data: ReturnedData]
}>()

const { t } = useI18n()

const returnedData = ref<ReturnedData>({
  reasonId: '',
  customReason: '',
  comment: ''
})

watch(() => props.show, (val) => {
  if (val) {
    returnedData.value = {
      reasonId: '',
      customReason: '',
      comment: ''
    }
  }
})

const returnReasons = computed(() => {
  return props.reasons.filter(r => r.type === 'return' || r.type === 'both')
})

const handleConfirm = () => {
  emit('confirm', returnedData.value)
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
                {{ t('orders.returnOrder') }}
              </DialogTitle>

              <div class="mt-4 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('nav.reasons') }}
                  </label>
                  <select
                    v-model="returnedData.reasonId"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{{ t('common.select') }}</option>
                    <option v-for="reason in returnReasons" :key="reason.id" :value="reason.id">{{ reason.title }}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('orders.customReason') }}
                  </label>
                  <input
                    v-model="returnedData.customReason"
                    type="text"
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
                  class="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                  @click="handleConfirm"
                >
                  {{ t('orders.returnOrder') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
