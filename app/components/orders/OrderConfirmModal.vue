<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import type { Order, ConfirmOrderRequest } from '~/types/order'
import { useAutoAssignmentSettingsService, useActiveQualityChecklistItems } from '~/services'

const props = defineProps<{
  show: boolean
  order: Order | null
}>()

const emit = defineEmits<{
  close: []
  confirm: [data: ConfirmOrderRequest]
}>()

const { t, locale } = useI18n()

// Fetch settings and checklist items
const { settings } = useAutoAssignmentSettingsService()
const { data: checklistItems, isLoading: isLoadingChecklist } = useActiveQualityChecklistItems()

// Quality check settings
const enableQualityCheck = computed(() => settings.value?.enableQualityCheck ?? false)

// Quality checks state (key -> checked)
const qualityChecks = ref<Record<string, boolean>>({})

const confirmData = ref<ConfirmOrderRequest>({
  orderId: '',
  moveToShipping: true,
  comment: ''
})

// Initialize quality checks when modal opens or items change
watch([() => props.show, checklistItems], ([showVal, items]) => {
  if (showVal && items) {
    // Reset quality checks for each item
    const checks: Record<string, boolean> = {}
    items.forEach(item => {
      checks[item.key] = false
    })
    qualityChecks.value = checks
  }
}, { immediate: true })

watch(() => props.show, (val) => {
  if (val && props.order) {
    confirmData.value = {
      orderId: props.order.id,
      moveToShipping: true,
      comment: ''
    }
  }
})

// Validation: all required items must be checked
const allRequiredChecked = computed(() => {
  if (!enableQualityCheck.value || !checklistItems.value) return true
  return checklistItems.value
    .filter(item => item.isRequired)
    .every(item => qualityChecks.value[item.key] === true)
})

// Can confirm: either quality check is disabled, or all required items are checked
const canConfirm = computed(() => {
  if (!enableQualityCheck.value) return true
  if (!checklistItems.value || checklistItems.value.length === 0) return true
  return allRequiredChecked.value
})

// Get label based on locale
const getItemLabel = (item: { labelAr: string; labelFr: string }) => {
  return locale.value === 'ar' ? item.labelAr : item.labelFr
}

const handleConfirm = () => {
  // Include quality checks in the confirm data if enabled
  if (enableQualityCheck.value && checklistItems.value && checklistItems.value.length > 0) {
    confirmData.value.qualityChecks = { ...qualityChecks.value }
  }
  emit('confirm', confirmData.value)
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
                {{ t('orders.confirmOrder') }}
              </DialogTitle>

              <div class="mt-4 space-y-4">
                <!-- Quality Checklist Section -->
                <div v-if="enableQualityCheck && checklistItems && checklistItems.length > 0" class="space-y-3">
                  <div class="flex items-center gap-2">
                    <CheckCircleIcon class="w-5 h-5 text-primary-600" />
                    <h4 class="font-medium text-gray-900 dark:text-white">
                      {{ t('worker.qualityChecklist') }}
                    </h4>
                  </div>

                  <!-- Loading state -->
                  <div v-if="isLoadingChecklist" class="text-center py-3">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mx-auto"></div>
                  </div>

                  <!-- Checklist items -->
                  <div v-else class="space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <label
                      v-for="item in checklistItems"
                      :key="item.key"
                      class="flex items-start gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <input
                        v-model="qualityChecks[item.key]"
                        type="checkbox"
                        class="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span
                        :class="[
                          'text-sm',
                          item.isRequired && !qualityChecks[item.key]
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-700 dark:text-gray-300'
                        ]"
                      >
                        {{ getItemLabel(item) }}
                        <span v-if="item.isRequired" class="text-red-500 ml-1">*</span>
                      </span>
                    </label>

                    <!-- Validation warning -->
                    <div
                      v-if="!allRequiredChecked"
                      class="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-700 dark:text-amber-300 text-sm mt-2"
                    >
                      <ExclamationTriangleIcon class="w-4 h-4 flex-shrink-0" />
                      <span>{{ t('worker.completeChecklist') }}</span>
                    </div>
                  </div>
                </div>

                <!-- Note: Delivery company assignment is now done by Suivi agents after confirmation -->
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

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('common.note') }}
                  </label>
                  <textarea
                    v-model="confirmData.comment"
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
                  :disabled="!canConfirm"
                  :class="[
                    'rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
                    canConfirm
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  ]"
                  @click="handleConfirm"
                >
                  {{ t('orders.confirmOrder') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
