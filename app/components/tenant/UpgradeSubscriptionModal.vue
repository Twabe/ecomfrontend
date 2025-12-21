<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <!-- Header -->
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 mb-4"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span>Upgrade Subscription</span>
                  </div>
                  <button
                    @click="closeModal"
                    class="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </DialogTitle>

              <!-- Tenant Info -->
              <div v-if="tenant" class="bg-gray-50 rounded-lg p-4 mb-4">
                <div class="flex items-center space-x-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ tenant.name }}
                    </p>
                    <p class="text-xs text-gray-600 truncate">
                      {{ tenant.identifier }}
                    </p>
                  </div>
                  <span
                    :class="tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ tenant.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>

                <!-- Current Expiry Date -->
                <div v-if="tenant.validUpto" class="mt-3 pt-3 border-t border-gray-200">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-600">Current expiry:</span>
                    <span class="font-medium text-gray-900">{{ formatDate(tenant.validUpto) }}</span>
                  </div>
                  <div v-if="daysRemaining !== null" class="mt-1">
                    <span
                      :class="[
                        'text-xs font-medium',
                        daysRemaining < 7 ? 'text-red-600' : daysRemaining < 30 ? 'text-amber-600' : 'text-green-600'
                      ]"
                    >
                      {{ daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Form -->
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Date Picker -->
                <div>
                  <label for="expiryDate" class="block text-sm font-medium text-gray-700 mb-2">
                    New Expiry Date
                  </label>
                  <input
                    v-model="form.extendedExpiryDate"
                    type="date"
                    id="expiryDate"
                    required
                    :min="minDate"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    Select a date to extend the subscription
                  </p>
                </div>

                <!-- Quick Date Options -->
                <div>
                  <p class="text-sm font-medium text-gray-700 mb-2">Quick Options:</p>
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      v-for="option in quickOptions"
                      :key="option.label"
                      type="button"
                      @click="setQuickDate(option.months)"
                      class="px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      {{ option.label }}
                    </button>
                  </div>
                </div>

                <!-- Duration Info -->
                <div v-if="form.extendedExpiryDate" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div class="flex items-start space-x-2">
                    <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="flex-1">
                      <p class="text-xs font-medium text-blue-900">
                        Extension Details
                      </p>
                      <p class="text-xs text-blue-700 mt-1">
                        {{ extensionInfo }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="isLoading || !form.extendedExpiryDate"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ isLoading ? 'Upgrading...' : 'Confirm Upgrade' }}
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
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import type { Tenant } from '~/types/tenant'

interface Props {
  isOpen: boolean
  tenant: Tenant | null
}

interface Emits {
  (e: 'close'): void
  (e: 'upgrade', data: { tenantId: string; extendedExpiryDate: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isLoading = ref(false)

// Quick date options
const quickOptions = [
  { label: '1 Month', months: 1 },
  { label: '3 Months', months: 3 },
  { label: '6 Months', months: 6 },
  { label: '1 Year', months: 12 },
  { label: '2 Years', months: 24 },
  { label: '5 Years', months: 60 }
]

// Form data
const form = reactive({
  extendedExpiryDate: ''
})

// Minimum date (today)
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Calculate days remaining
const daysRemaining = computed(() => {
  if (!props.tenant?.validUpto) return null

  const today = new Date()
  const expiry = new Date(props.tenant.validUpto)
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
})

// Extension info
const extensionInfo = computed(() => {
  if (!form.extendedExpiryDate) return ''

  const selectedDate = new Date(form.extendedExpiryDate)
  const currentExpiry = props.tenant?.validUpto ? new Date(props.tenant.validUpto) : new Date()
  const baseDate = currentExpiry > new Date() ? currentExpiry : new Date()

  const diffTime = selectedDate.getTime() - baseDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) {
    return 'Selected date must be after current expiry'
  }

  const months = Math.floor(diffDays / 30)
  const days = diffDays % 30

  let result = 'Extending subscription by '
  if (months > 0) {
    result += `${months} month${months > 1 ? 's' : ''}`
    if (days > 0) {
      result += ` and ${days} day${days > 1 ? 's' : ''}`
    }
  } else {
    result += `${days} day${days > 1 ? 's' : ''}`
  }

  return result
})

// Set quick date
const setQuickDate = (months: number) => {
  const currentExpiry = props.tenant?.validUpto ? new Date(props.tenant.validUpto) : new Date()
  const baseDate = currentExpiry > new Date() ? currentExpiry : new Date()

  const newDate = new Date(baseDate)
  newDate.setMonth(newDate.getMonth() + months)

  form.extendedExpiryDate = newDate.toISOString().split('T')[0]
}

// Format date
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Close modal
const closeModal = () => {
  if (!isLoading.value) {
    emit('close')
    // Reset form
    form.extendedExpiryDate = ''
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!props.tenant || !form.extendedExpiryDate) return

  isLoading.value = true

  try {
    emit('upgrade', {
      tenantId: props.tenant.id,
      extendedExpiryDate: form.extendedExpiryDate
    })

    // Close modal after a short delay to show success
    setTimeout(() => {
      closeModal()
      isLoading.value = false
    }, 500)
  } catch (error) {
    console.error('Upgrade failed:', error)
    isLoading.value = false
  }
}

// Reset form when modal closes
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    form.extendedExpiryDate = ''
  }
})
</script>
