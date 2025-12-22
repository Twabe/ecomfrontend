<template>
  <TransitionRoot :show="show" as="template">
    <Dialog as="div" class="relative z-50" @close="handleClose">
      <TransitionChild
        enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-300" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
            leave="ease-in duration-200" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl">
              <!-- Header -->
              <div class="flex items-center gap-3 p-4 border-b dark:border-gray-700">
                <div class="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <TruckIcon class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ $t('purchases.updateStatus') }}
                </DialogTitle>
              </div>

              <!-- Purchase Info Card -->
              <div v-if="purchase" class="mx-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-semibold text-gray-900 dark:text-white">{{ purchase.code }}</span>
                  <span class="font-bold text-primary-600 dark:text-primary-400">
                    {{ formatCurrency(purchase.totalCost) }}
                  </span>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ purchase.supplierName }}
                </div>
                <div class="mt-2 flex items-center gap-2">
                  <span class="text-xs text-gray-500">{{ $t('purchases.currentStatus') }}:</span>
                  <span :class="getStatusClass(purchase.status)" class="text-xs">
                    {{ getStatusLabel(purchase.status) }}
                  </span>
                </div>
              </div>

              <!-- Status Selection -->
              <div class="p-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {{ $t('purchases.newStatus') }} *
                </label>

                <div class="grid grid-cols-2 gap-3">
                  <!-- Confirmed -->
                  <button
                    v-if="canTransitionTo('Confirmed')"
                    type="button"
                    :class="[
                      'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all',
                      selectedStatus === 'Confirmed'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                    ]"
                    @click="selectedStatus = 'Confirmed'"
                  >
                    <CheckCircleIcon class="w-8 h-8 text-blue-500 mb-2" />
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ $t('purchases.statusConfirmed') }}
                    </span>
                  </button>

                  <!-- Shipped -->
                  <button
                    v-if="canTransitionTo('Shipped')"
                    type="button"
                    :class="[
                      'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all',
                      selectedStatus === 'Shipped'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/10'
                    ]"
                    @click="selectedStatus = 'Shipped'"
                  >
                    <TruckIcon class="w-8 h-8 text-purple-500 mb-2" />
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ $t('purchases.statusShipped') }}
                    </span>
                  </button>

                  <!-- Received -->
                  <button
                    v-if="canTransitionTo('Received')"
                    type="button"
                    :class="[
                      'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all',
                      selectedStatus === 'Received'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300 hover:bg-green-50/50 dark:hover:bg-green-900/10'
                    ]"
                    @click="selectedStatus = 'Received'"
                  >
                    <ArchiveBoxArrowDownIcon class="w-8 h-8 text-green-500 mb-2" />
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ $t('purchases.statusReceived') }}
                    </span>
                  </button>

                  <!-- Cancelled -->
                  <button
                    v-if="canTransitionTo('Cancelled')"
                    type="button"
                    :class="[
                      'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all',
                      selectedStatus === 'Cancelled'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-red-300 hover:bg-red-50/50 dark:hover:bg-red-900/10'
                    ]"
                    @click="selectedStatus = 'Cancelled'"
                  >
                    <XCircleIcon class="w-8 h-8 text-red-500 mb-2" />
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ $t('purchases.statusCancelled') }}
                    </span>
                  </button>
                </div>

                <!-- Receive Date (only for Received status) -->
                <div v-if="selectedStatus === 'Received'" class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ $t('purchases.actualDeliveryDate') }}
                  </label>
                  <input
                    v-model="receiveDate"
                    type="date"
                    class="input"
                  />
                </div>

                <!-- Notes -->
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ $t('common.note') }}
                  </label>
                  <textarea
                    v-model="notes"
                    class="input"
                    rows="2"
                    :placeholder="$t('purchases.statusNotePlaceholder')"
                  ></textarea>
                </div>

                <!-- Stock Warning for Received -->
                <div v-if="selectedStatus === 'Received'" class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div class="flex items-start gap-2">
                    <InformationCircleIcon class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p class="text-sm text-blue-700 dark:text-blue-300">
                      {{ $t('purchases.receiveStockWarning') }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-3 p-4 border-t dark:border-gray-700">
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  @click="handleClose"
                >
                  {{ $t('common.cancel') }}
                </button>
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  :disabled="!selectedStatus || isLoading"
                  @click="handleSubmit"
                >
                  <CheckIcon v-if="!isLoading" class="w-4 h-4" />
                  <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {{ $t('common.update') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import {
  TruckIcon,
  CheckCircleIcon,
  ArchiveBoxArrowDownIcon,
  XCircleIcon,
  InformationCircleIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'
import type { PurchaseDto } from '~/api/generated/models'

const props = defineProps<{
  show: boolean
  purchase: PurchaseDto | null
}>()

const emit = defineEmits<{
  close: []
  update: [status: string, notes: string, receiveDate?: string]
}>()

const { t } = useI18n()

// Form state
const selectedStatus = ref<string | null>(null)
const notes = ref('')
const receiveDate = ref(new Date().toISOString().split('T')[0])
const isLoading = ref(false)

// Reset form when modal opens
watch(() => props.show, (val) => {
  if (val) {
    selectedStatus.value = null
    notes.value = ''
    receiveDate.value = new Date().toISOString().split('T')[0]
    isLoading.value = false
  }
})

// Status transition rules
const canTransitionTo = (targetStatus: string): boolean => {
  if (!props.purchase) return false
  const currentStatus = props.purchase.status

  // Terminal statuses cannot transition
  if (currentStatus === 'Received' || currentStatus === 'Cancelled') {
    return false
  }

  // Can't transition to current status
  if (currentStatus === targetStatus) {
    return false
  }

  // All non-terminal statuses can transition to any other status
  return true
}

// Format currency
const formatCurrency = (value?: number): string => {
  if (value === undefined || value === null) return '0.00 MAD'
  return `${value.toFixed(2)} MAD`
}

// Get status class
const getStatusClass = (status?: string): string => {
  const baseClass = 'inline-flex items-center px-2 py-0.5 rounded-full font-medium'
  switch (status) {
    case 'Pending':
      return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`
    case 'Confirmed':
      return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`
    case 'Shipped':
      return `${baseClass} bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400`
    case 'Received':
      return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`
    case 'Cancelled':
      return `${baseClass} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`
    default:
      return `${baseClass} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`
  }
}

// Get status label
const getStatusLabel = (status?: string): string => {
  switch (status) {
    case 'Pending': return t('purchases.statusPending')
    case 'Confirmed': return t('purchases.statusConfirmed')
    case 'Shipped': return t('purchases.statusShipped')
    case 'Received': return t('purchases.statusReceived')
    case 'Cancelled': return t('purchases.statusCancelled')
    default: return status || ''
  }
}

// Handle close
const handleClose = () => {
  if (!isLoading.value) {
    emit('close')
  }
}

// Handle submit
const handleSubmit = () => {
  if (!selectedStatus.value) return

  isLoading.value = true
  emit('update', selectedStatus.value, notes.value, selectedStatus.value === 'Received' ? receiveDate.value : undefined)
}

// Reset loading state from parent
defineExpose({
  resetLoading: () => {
    isLoading.value = false
  }
})
</script>
