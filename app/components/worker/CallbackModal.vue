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
                <PhoneArrowUpRightIcon class="w-5 h-5 text-purple-500" />
                {{ $t('worker.scheduleCallback') }}
              </DialogTitle>

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
                <div v-if="assignment.callbackAttemptNumber > 0" class="mt-2 flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                  <ArrowPathIcon class="w-3 h-3" />
                  {{ $t('worker.callbackAttempt', { n: assignment.callbackAttemptNumber }) }}
                </div>
              </div>

              <form @submit.prevent="submit">
                <div class="mb-4">
                  <label class="label">{{ $t('worker.callbackDate') }} *</label>
                  <input
                    v-model="form.date"
                    type="date"
                    class="input"
                    :min="minDate"
                    required
                  />
                </div>

                <div class="mb-4">
                  <label class="label">{{ $t('worker.callbackTime') }} *</label>
                  <input
                    v-model="form.time"
                    type="time"
                    class="input"
                    required
                  />
                </div>

                <div class="mb-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    class="btn-secondary text-xs py-2"
                    @click="setQuickTime(1)"
                  >
                    +1h
                  </button>
                  <button
                    type="button"
                    class="btn-secondary text-xs py-2"
                    @click="setQuickTime(3)"
                  >
                    +3h
                  </button>
                  <button
                    type="button"
                    class="btn-secondary text-xs py-2"
                    @click="setQuickTime(24)"
                  >
                    {{ $t('worker.tomorrow') }}
                  </button>
                </div>

                <div class="mb-4">
                  <label class="label">{{ $t('orders.notes') }}</label>
                  <textarea
                    v-model="form.notes"
                    class="input"
                    rows="2"
                    :placeholder="$t('worker.callbackNotesPlaceholder')"
                  ></textarea>
                </div>

                <div v-if="maxAttempts && assignment" class="mb-4 text-sm">
                  <span
                    :class="[
                      'flex items-center gap-1',
                      isLastAttempt ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                    ]"
                  >
                    <ExclamationCircleIcon v-if="isLastAttempt" class="w-4 h-4" />
                    {{ $t('worker.callbackAttemptsRemaining', { n: maxAttempts - assignment.callbackAttemptNumber }) }}
                  </span>
                </div>

                <div class="flex justify-end gap-3">
                  <button type="button" class="btn-secondary" @click="close">
                    {{ $t('common.cancel') }}
                  </button>
                  <button
                    type="submit"
                    class="btn-primary bg-purple-600 hover:bg-purple-700"
                    :disabled="isSubmitting || !isValidDateTime"
                  >
                    <ClockIcon v-if="!isSubmitting" class="w-4 h-4 mr-2" />
                    <span v-if="isSubmitting" class="animate-spin mr-2">...</span>
                    {{ $t('worker.scheduleCallback') }}
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
  PhoneArrowUpRightIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline'
import type { WorkerAssignmentDto } from '~/types/orderAssignment'

const props = defineProps<{
  modelValue: boolean
  assignment: WorkerAssignmentDto | null
  maxAttempts?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: { scheduledAt: string; notes?: string }): void
}>()

const { t } = useI18n()

const form = ref({
  date: '',
  time: '',
  notes: ''
})

const isSubmitting = ref(false)

// Minimum date is today
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Check if this would be the last attempt
const isLastAttempt = computed(() => {
  if (!props.maxAttempts || !props.assignment) return false
  return props.assignment.callbackAttemptNumber >= props.maxAttempts - 1
})

// Validate datetime is in the future
const isValidDateTime = computed(() => {
  if (!form.value.date || !form.value.time) return false
  const scheduledAt = new Date(`${form.value.date}T${form.value.time}`)
  return scheduledAt > new Date()
})

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount)
}

// Quick time setters
const setQuickTime = (hoursToAdd: number) => {
  const future = new Date()
  future.setHours(future.getHours() + hoursToAdd)
  form.value.date = future.toISOString().split('T')[0]
  form.value.time = future.toTimeString().slice(0, 5)
}

const close = () => {
  emit('update:modelValue', false)
  form.value = { date: '', time: '', notes: '' }
}

const submit = () => {
  if (!isValidDateTime.value) return

  const scheduledAt = new Date(`${form.value.date}T${form.value.time}`).toISOString()
  emit('submit', {
    scheduledAt,
    notes: form.value.notes || undefined
  })
}

// Initialize with default values when opened
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    // Default to +1 hour
    setQuickTime(1)
  }
})
</script>
