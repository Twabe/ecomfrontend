<template>
  <TransitionRoot :show="modelValue" as="template">
    <Dialog as="div" class="relative z-50" @close="close">
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
            <DialogPanel class="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TruckIcon class="w-5 h-5 text-blue-500" />
                {{ $t('worker.completeSuivi') }}
              </DialogTitle>

              <!-- Order Info -->
              <div v-if="assignment" class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-mono text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {{ assignment.orderCode }}
                  </span>
                  <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {{ formatCurrency(assignment.totalPrice || assignment.orderPrice) }}
                  </span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300">{{ assignment.customerName }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ assignment.customerCity }}</p>
              </div>

              <form @submit.prevent="submit">
                <!-- Result Selection -->
                <div class="mb-4">
                  <label class="label">{{ $t('worker.suiviResult') }} *</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      v-for="option in resultOptions"
                      :key="option.value"
                      type="button"
                      @click="form.result = option.value"
                      :class="[
                        'p-3 rounded-lg border-2 text-sm font-medium transition-all',
                        form.result === option.value
                          ? option.selectedClass
                          : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      ]"
                    >
                      <component :is="option.icon" class="w-5 h-5 mx-auto mb-1" />
                      {{ option.label }}
                    </button>
                  </div>
                </div>

                <!-- Tracking State (for non-delivered) -->
                <div v-if="form.result && form.result !== SuiviResult.Delivered" class="mb-4">
                  <label class="label">{{ $t('worker.trackingState') }} *</label>
                  <select v-model="form.trackingStateId" class="input" required>
                    <option value="">{{ $t('common.select') }}...</option>
                    <option
                      v-for="state in trackingStates"
                      :key="state.id"
                      :value="state.id"
                    >
                      {{ state.state }}
                    </option>
                  </select>
                </div>

                <!-- COD Amount (for delivered) -->
                <div v-if="form.result === SuiviResult.Delivered" class="mb-4">
                  <label class="label">{{ $t('worker.codAmount') }}</label>
                  <div class="relative">
                    <input
                      v-model.number="form.codAmountCollected"
                      type="number"
                      class="input pr-12"
                      :placeholder="assignment ? String(assignment.totalPrice || assignment.orderPrice) : '0'"
                      min="0"
                      step="0.01"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                      DH
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ $t('worker.codAmountHint') }}
                  </p>
                </div>

                <!-- Callback Date (for postponed) -->
                <div v-if="form.result === SuiviResult.Postponed" class="mb-4">
                  <label class="label">{{ $t('worker.callbackDate') }} *</label>
                  <input
                    v-model="form.postponedUntil"
                    type="datetime-local"
                    class="input"
                    :min="minDateTime"
                    required
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ $t('worker.callbackDateHint') }}
                  </p>
                </div>

                <!-- Notes -->
                <div class="mb-4">
                  <label class="label">{{ $t('orders.notes') }}</label>
                  <textarea
                    v-model="form.notes"
                    class="input"
                    rows="2"
                    :placeholder="$t('worker.suiviNotesPlaceholder')"
                  ></textarea>
                </div>

                <div class="flex justify-end gap-3">
                  <button type="button" class="btn-secondary" @click="close">
                    {{ $t('common.cancel') }}
                  </button>
                  <button
                    type="submit"
                    :class="[
                      'btn-primary',
                      form.result === SuiviResult.Delivered ? 'bg-emerald-600 hover:bg-emerald-700' : '',
                      form.result === SuiviResult.Returned ? 'bg-orange-600 hover:bg-orange-700' : ''
                    ]"
                    :disabled="isSubmitting || !isValid"
                  >
                    <CheckIcon v-if="!isSubmitting" class="w-4 h-4 mr-2" />
                    <span v-if="isSubmitting" class="animate-spin mr-2">...</span>
                    {{ submitLabel }}
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

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import {
  TruckIcon,
  CheckIcon,
  CheckCircleIcon,
  ArrowUturnLeftIcon,
  ClockIcon,
  PhoneXMarkIcon,
  XCircleIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'
import { SuiviResult } from '~/constants/order'
import type { SuiviResultType } from '~/constants/order'
import type { WorkerAssignmentDto } from '~/types/orderAssignment'

interface TrackingState {
  id: string
  state: string
}

const props = defineProps<{
  modelValue: boolean
  assignment: WorkerAssignmentDto | null
  trackingStates: TrackingState[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: {
    trackingStateId: string
    result: SuiviResultType
    notes?: string
    codAmountCollected?: number
    postponedUntil?: string
  }): void
}>()

const { t } = useI18n()

const form = ref<{
  result: SuiviResultType | ''
  trackingStateId: string
  notes: string
  codAmountCollected: number | undefined
  postponedUntil: string
}>({
  result: '',
  trackingStateId: '',
  notes: '',
  codAmountCollected: undefined,
  postponedUntil: ''
})

// Minimum datetime for callback (now + 5 minutes)
const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 5)
  return now.toISOString().slice(0, 16)
})

const isSubmitting = ref(false)

// Result options
const resultOptions = [
  {
    value: SuiviResult.Delivered,
    label: t('worker.delivered'),
    icon: CheckCircleIcon,
    selectedClass: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
  },
  {
    value: SuiviResult.Returned,
    label: t('worker.returned'),
    icon: ArrowUturnLeftIcon,
    selectedClass: 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
  },
  {
    value: SuiviResult.InProgress,
    label: t('worker.inProgress'),
    icon: ClockIcon,
    selectedClass: 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
  },
  {
    value: SuiviResult.NoResponse,
    label: t('worker.noResponse'),
    icon: PhoneXMarkIcon,
    selectedClass: 'border-gray-500 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  },
  {
    value: SuiviResult.Refused,
    label: t('worker.refused'),
    icon: XCircleIcon,
    selectedClass: 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  },
  {
    value: SuiviResult.Postponed,
    label: t('worker.postponed'),
    icon: CalendarIcon,
    selectedClass: 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
  }
]

// Validation
const isValid = computed(() => {
  if (!form.value.result) return false
  if (form.value.result === SuiviResult.Delivered) {
    // Delivered doesn't require tracking state selection
    return true
  }
  if (form.value.result === SuiviResult.Postponed) {
    // Postponed requires callback date
    return !!form.value.postponedUntil
  }
  return !!form.value.trackingStateId
})

// Submit label
const submitLabel = computed(() => {
  if (form.value.result === SuiviResult.Delivered) return t('worker.confirmDelivery')
  if (form.value.result === SuiviResult.Returned) return t('worker.confirmReturn')
  if (form.value.result === SuiviResult.Postponed) return t('worker.scheduleCallback')
  return t('worker.updateStatus')
})

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount)
}

const close = () => {
  emit('update:modelValue', false)
  form.value = { result: '', trackingStateId: '', notes: '', codAmountCollected: undefined, postponedUntil: '' }
}

const submit = () => {
  if (!isValid.value || !form.value.result) return

  // For delivered, find or use a "delivered" tracking state
  let trackingStateId = form.value.trackingStateId
  if (form.value.result === SuiviResult.Delivered && !trackingStateId) {
    // Try to find a delivered state
    const deliveredState = props.trackingStates.find(s =>
      s.state.toLowerCase().includes('livré') ||
      s.state.toLowerCase().includes(SuiviResult.Delivered)
    )
    trackingStateId = deliveredState?.id || props.trackingStates[0]?.id || ''
  }

  // Validate trackingStateId is not empty
  if (!trackingStateId) {
    console.error('[CompleteSuiviModal] Cannot submit: no tracking state available')
    return
  }

  console.log('[CompleteSuiviModal] Submitting:', { trackingStateId, result: form.value.result })

  emit('submit', {
    trackingStateId,
    result: form.value.result,
    notes: form.value.notes || undefined,
    codAmountCollected: form.value.result === SuiviResult.Delivered ? form.value.codAmountCollected : undefined,
    postponedUntil: form.value.result === SuiviResult.Postponed ? form.value.postponedUntil : undefined
  })
}

// Pre-fill COD amount when assignment changes
watch(() => props.assignment, (assignment) => {
  if (assignment) {
    form.value.codAmountCollected = assignment.totalPrice || assignment.orderPrice
  }
}, { immediate: true })
</script>
