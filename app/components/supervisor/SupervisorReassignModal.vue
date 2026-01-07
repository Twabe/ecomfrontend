<script setup lang="ts">
/**
 * SupervisorReassignModal - Extracted from supervisor/index.vue
 * Modal for reassigning orders to different workers with service type selection
 *
 * Features:
 * - Service type checkboxes from active assignments
 * - Worker selection dropdown
 * - Optional notes textarea
 * - Permission guard: Permissions.OrderAssignments.Reassign
 */
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { ExclamationTriangleIcon, ArrowsRightLeftIcon } from '@heroicons/vue/24/outline'

interface ActiveServiceInfo {
  serviceType: string
  workerName: string | null
  status: string
  orderId?: string
}

interface Worker {
  id: string
  firstName?: string
  lastName?: string
  userName?: string
}

const props = defineProps<{
  show: boolean
  orderIds: string[]
  workers: Worker[]
  activeServices: ActiveServiceInfo[]
  isLoadingServices?: boolean
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [data: {
    orderIds: string[]
    workerId: string
    serviceTypes: string[]
    notes?: string
  }]
}>()

const { t } = useI18n()
const { hasPermission } = useAuth()

// Permission check
const canReassign = computed(() => hasPermission('Permissions.OrderAssignments.Reassign'))

// Form state
const selectedServicesToReassign = ref<string[]>([])
const workerId = ref('')
const notes = ref('')

// Reset form when modal opens
watch(() => props.show, (val) => {
  if (val) {
    selectedServicesToReassign.value = []
    workerId.value = ''
    notes.value = ''
  }
})

// Validation
const canSubmit = computed(() => {
  return !props.isSubmitting &&
    canReassign.value &&
    selectedServicesToReassign.value.length > 0 &&
    workerId.value !== ''
})

// Get status label for display
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: t('worker.pending', 'En attente'),
    taken: t('worker.active', 'En cours'),
    completed: t('worker.completed', 'Termine'),
    released: t('worker.released', 'Libere'),
    reassigned: t('worker.reassigned', 'Reassigne'),
    expired: t('worker.expired', 'Expire'),
    unassigned: t('worker.unassigned', 'Non assigne'),
    new: t('worker.new', 'Nouveau')
  }
  return labels[status] || status
}

// Get worker display name
const getWorkerName = (worker: Worker): string => {
  if (worker.firstName && worker.lastName) {
    return `${worker.firstName} ${worker.lastName}`
  }
  return worker.userName || worker.id
}

const handleConfirm = () => {
  if (!canSubmit.value) return

  emit('confirm', {
    orderIds: props.orderIds,
    workerId: workerId.value,
    serviceTypes: selectedServicesToReassign.value,
    notes: notes.value || undefined
  })
}

const handleClose = () => {
  if (!props.isSubmitting) {
    emit('close')
  }
}
</script>

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
            <DialogPanel class="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ArrowsRightLeftIcon class="w-5 h-5 text-primary-600" />
                {{ t('supervisor.reassignOrders') }}
              </DialogTitle>

              <form @submit.prevent="handleConfirm">
                <!-- Order Count -->
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {{ t('supervisor.reassigningCount', { count: orderIds.length }) }}
                </p>

                <!-- Permission Warning -->
                <div v-if="!canReassign" class="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                  <ExclamationTriangleIcon class="h-5 w-5 flex-shrink-0 text-red-500" />
                  <div class="text-sm text-red-700 dark:text-red-300">
                    <p class="font-medium">{{ t('common.noPermission', 'Permission insuffisante') }}</p>
                  </div>
                </div>

                <!-- Service Selection for existing assignments -->
                <div class="mb-4">
                  <!-- Loading state -->
                  <div v-if="isLoadingServices" class="text-center py-4">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                    <p class="text-sm text-gray-500 mt-2">{{ t('common.loading') }}...</p>
                  </div>

                  <!-- Services to reassign -->
                  <div v-else-if="activeServices.length > 0">
                    <label class="label">{{ t('supervisor.servicesToReassign') }} *</label>
                    <p class="text-xs text-gray-500 mb-2">{{ t('supervisor.selectServicesToReassign') }}</p>
                    <div class="space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <label
                        v-for="service in activeServices"
                        :key="service.serviceType"
                        class="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600/50"
                      >
                        <input
                          type="checkbox"
                          :value="service.serviceType"
                          v-model="selectedServicesToReassign"
                          class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          :disabled="!canReassign || isSubmitting"
                        />
                        <div class="flex-1">
                          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {{ service.serviceType }}
                          </span>
                          <span
                            v-if="service.workerName"
                            class="ml-2 text-xs text-gray-500"
                          >
                            ({{ service.workerName }} - {{ getStatusLabel(service.status) }})
                          </span>
                          <span
                            v-else
                            class="ml-2 text-xs text-gray-400"
                          >
                            ({{ getStatusLabel(service.status) }})
                          </span>
                        </div>
                      </label>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ t('supervisor.reassignHint') }}
                    </p>
                  </div>

                  <!-- No active services -->
                  <div v-else class="text-center py-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <ExclamationTriangleIcon class="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p class="text-sm text-yellow-700 dark:text-yellow-300">{{ t('supervisor.noActiveServices') }}</p>
                  </div>
                </div>

                <!-- Worker Selection -->
                <div class="mb-4">
                  <label class="label">{{ t('supervisor.selectWorker') }} *</label>
                  <select
                    v-model="workerId"
                    class="input"
                    required
                    :disabled="!canReassign || isSubmitting"
                  >
                    <option value="">{{ t('common.select') }}...</option>
                    <option
                      v-for="worker in workers"
                      :key="worker.id"
                      :value="worker.id"
                    >
                      {{ getWorkerName(worker) }}
                    </option>
                  </select>
                </div>

                <!-- Notes -->
                <div class="mb-4">
                  <label class="label">{{ t('supervisor.notes') }}</label>
                  <textarea
                    v-model="notes"
                    class="input"
                    rows="2"
                    :disabled="!canReassign || isSubmitting"
                  ></textarea>
                </div>

                <div class="flex justify-end gap-3">
                  <button
                    type="button"
                    class="btn-secondary"
                    :disabled="isSubmitting"
                    @click="handleClose"
                  >
                    {{ t('common.cancel') }}
                  </button>
                  <button
                    type="submit"
                    class="btn-primary"
                    :disabled="!canSubmit"
                  >
                    <span v-if="isSubmitting" class="flex items-center gap-2">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {{ t('common.loading') }}
                    </span>
                    <span v-else class="flex items-center gap-2">
                      <ArrowsRightLeftIcon class="w-4 h-4" />
                      {{ t('supervisor.reassign') }}
                    </span>
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
