<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import type { Order } from '~/types/order'

interface Worker {
  id: string
  firstName?: string
  lastName?: string
  userName?: string
}

type ServiceType = 'confirmation' | 'quality' | 'suivi'

const props = defineProps<{
  show: boolean
  orders: Order[]
  workers: Worker[]
  isQualityEnabled: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [data: {
    orderIds: string[]
    workerId?: string
    serviceTypes: string[]
    individualAssignments?: Record<string, string>
    notes?: string
  }]
}>()

const { t } = useI18n()

// Form state
const isIndividualMode = ref(false)
const selectedWorkerId = ref('')
const selectedServiceTypes = ref<ServiceType[]>([])
const individualAssignments = ref<Record<ServiceType, string>>({
  confirmation: '',
  quality: '',
  suivi: ''
})
const notes = ref('')
const isSubmitting = ref(false)

// Get available service types based on orders' phases and quality setting
const availableServiceTypes = computed((): Array<{ value: ServiceType; label: string }> => {
  const services: Array<{ value: ServiceType; label: string }> = []

  // Analyze selected orders to determine which services are available
  const phases = new Set(validOrders.value.map(o => o.phase?.toLowerCase()))
  const states = new Set(validOrders.value.map(o => o.state?.toLowerCase()))

  // Confirmation is available for new and confirmation phase orders
  if (phases.has('new') || phases.has('confirmation')) {
    services.push({ value: 'confirmation', label: t('supervisor.confirmation') })
  }

  // Quality is available for confirmed orders or quality phase (if enabled)
  if (props.isQualityEnabled) {
    if (states.has('confirmed') || phases.has('quality') || phases.has('shipping')) {
      services.push({ value: 'quality', label: t('supervisor.quality') })
    }
  }

  // Suivi is available for confirmed orders or shipping/suivi phase
  if (states.has('confirmed') || phases.has('quality') || phases.has('shipping') || phases.has('suivi')) {
    services.push({ value: 'suivi', label: t('supervisor.suivi') })
  }

  return services
})

// Filter orders that can have workers assigned (not in terminal states)
const validOrders = computed(() => {
  return props.orders.filter(order => {
    const state = order.state?.toLowerCase()
    return !['cancelled', 'canceled', 'delivered', 'returned'].includes(state || '')
  })
})

const invalidOrders = computed(() => {
  return props.orders.filter(order => !validOrders.value.includes(order))
})

// Reset form when modal opens
watch(() => props.show, (val) => {
  if (val) {
    isIndividualMode.value = false
    selectedWorkerId.value = ''
    selectedServiceTypes.value = []
    individualAssignments.value = {
      confirmation: '',
      quality: '',
      suivi: ''
    }
    notes.value = ''
    isSubmitting.value = false
  }
})

// Reset individual assignments when mode changes
watch(isIndividualMode, () => {
  selectedServiceTypes.value = []
  individualAssignments.value = {
    confirmation: '',
    quality: '',
    suivi: ''
  }
})

// Validation
const canSubmit = computed(() => {
  if (isSubmitting.value || validOrders.value.length === 0) return false

  if (isIndividualMode.value) {
    // At least one service must have a worker assigned
    return Object.values(individualAssignments.value).some(workerId => workerId !== '')
  } else {
    // Chain mode: worker and at least one service must be selected
    return selectedWorkerId.value !== '' && selectedServiceTypes.value.length > 0
  }
})

const getWorkerName = (worker: Worker) => {
  if (worker.firstName && worker.lastName) {
    return `${worker.firstName} ${worker.lastName}`
  }
  return worker.userName || worker.id
}

const handleConfirm = () => {
  if (!canSubmit.value) return
  isSubmitting.value = true

  const orderIds = validOrders.value.map(o => o.id)

  if (isIndividualMode.value) {
    // Individual mode: send individual assignments
    const activeAssignments: Record<string, string> = {}
    for (const [service, workerId] of Object.entries(individualAssignments.value)) {
      if (workerId) {
        activeAssignments[service] = workerId
      }
    }
    emit('confirm', {
      orderIds,
      serviceTypes: Object.keys(activeAssignments),
      individualAssignments: activeAssignments,
      notes: notes.value || undefined
    })
  } else {
    // Chain mode: send worker and service types
    emit('confirm', {
      orderIds,
      workerId: selectedWorkerId.value,
      serviceTypes: selectedServiceTypes.value,
      notes: notes.value || undefined
    })
  }
}

const handleClose = () => {
  if (!isSubmitting.value) {
    emit('close')
  }
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
                {{ t('orders.assignWorker') }}
              </DialogTitle>

              <div class="mt-4 space-y-4">
                <!-- Summary -->
                <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    {{ t('orders.assignWorkerToOrders', { count: validOrders.length }) }}
                  </p>
                </div>

                <!-- Warning for invalid orders -->
                <div v-if="invalidOrders.length > 0" class="flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                  <ExclamationTriangleIcon class="h-5 w-5 flex-shrink-0 text-amber-500" />
                  <div class="text-sm text-amber-700 dark:text-amber-300">
                    <p class="font-medium">{{ t('orders.someOrdersCannotAssign') }}</p>
                    <p class="mt-1">
                      {{ invalidOrders.length }} {{ t('orders.ordersSkipped') }}
                    </p>
                  </div>
                </div>

                <!-- No available services warning -->
                <div v-if="availableServiceTypes.length === 0" class="flex items-start gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                  <ExclamationTriangleIcon class="h-5 w-5 flex-shrink-0 text-red-500" />
                  <div class="text-sm text-red-700 dark:text-red-300">
                    <p class="font-medium">{{ t('orders.noServicesAvailable') }}</p>
                    <p class="mt-1">{{ t('orders.noServicesAvailableHint') }}</p>
                  </div>
                </div>

                <!-- Mode Toggle -->
                <div v-if="availableServiceTypes.length > 0" class="flex items-center justify-between border-b pb-3 dark:border-gray-600">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('supervisor.assignmentMode') }}
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <span class="text-xs text-gray-500">{{ t('supervisor.chainMode') }}</span>
                    <input
                      type="checkbox"
                      v-model="isIndividualMode"
                      class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      :disabled="isSubmitting"
                    />
                    <span class="text-xs text-gray-500">{{ t('supervisor.individualMode') }}</span>
                  </label>
                </div>

                <!-- Chain Mode: Single Worker for All Services -->
                <template v-if="!isIndividualMode && availableServiceTypes.length > 0">
                  <!-- Worker Selection -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('supervisor.worker') }} *
                    </label>
                    <select
                      v-model="selectedWorkerId"
                      class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      :disabled="isSubmitting"
                    >
                      <option value="">{{ t('common.select') }}</option>
                      <option v-for="worker in workers" :key="worker.id" :value="worker.id">
                        {{ getWorkerName(worker) }}
                      </option>
                    </select>
                  </div>

                  <!-- Service Types -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('supervisor.serviceTypes') }} *
                    </label>
                    <div class="mt-2 space-y-2">
                      <label
                        v-for="service in availableServiceTypes"
                        :key="service.value"
                        class="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          :value="service.value"
                          v-model="selectedServiceTypes"
                          class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          :disabled="isSubmitting"
                        />
                        <span class="text-sm text-gray-700 dark:text-gray-300">
                          {{ service.label }}
                        </span>
                      </label>
                    </div>
                    <p class="mt-1 text-xs text-gray-500">
                      {{ t('supervisor.serviceTypesHint') }}
                    </p>
                  </div>
                </template>

                <!-- Individual Mode: Different Worker for Each Service -->
                <template v-else-if="isIndividualMode && availableServiceTypes.length > 0">
                  <p class="text-xs text-gray-500">
                    {{ t('supervisor.individualModeHint') }}
                  </p>
                  <div class="space-y-3">
                    <div
                      v-for="service in availableServiceTypes"
                      :key="service.value"
                      class="flex items-center gap-3"
                    >
                      <span class="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {{ service.label }}
                      </span>
                      <select
                        v-model="individualAssignments[service.value]"
                        class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        :disabled="isSubmitting"
                      >
                        <option value="">-- {{ t('supervisor.noAssignment') }} --</option>
                        <option v-for="worker in workers" :key="worker.id" :value="worker.id">
                          {{ getWorkerName(worker) }}
                        </option>
                      </select>
                    </div>
                  </div>
                </template>

                <!-- Notes -->
                <div v-if="availableServiceTypes.length > 0">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('supervisor.notes') }}
                  </label>
                  <textarea
                    v-model="notes"
                    rows="2"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    :disabled="isSubmitting"
                  />
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
                  :disabled="isSubmitting"
                  @click="handleClose"
                >
                  {{ t('common.cancel') }}
                </button>
                <button
                  type="button"
                  class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  :disabled="!canSubmit"
                  @click="handleConfirm"
                >
                  <span v-if="isSubmitting">{{ t('common.processing') }}</span>
                  <span v-else>{{ t('orders.assign') }}</span>
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
