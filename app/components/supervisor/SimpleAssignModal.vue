<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { UserGroupIcon } from '@heroicons/vue/24/outline'

interface Worker {
  id: string
  firstName?: string
  lastName?: string
  userName?: string
}

interface Order {
  id: string
  code?: string
}

const props = defineProps<{
  show: boolean
  orders: Order[]
  workers: Worker[]
}>()

const emit = defineEmits<{
  close: []
  confirm: [data: {
    orderIds: string[]
    confirmationWorkerId?: string
    suiviWorkerId?: string
  }]
}>()

const { t } = useI18n()

// Simple state: just 2 worker IDs
const confirmationWorkerId = ref('')
const suiviWorkerId = ref('')
const isSubmitting = ref(false)

// Must select at least one worker
const canSubmit = computed(() =>
  !isSubmitting.value && (confirmationWorkerId.value !== '' || suiviWorkerId.value !== '')
)

// Reset on open
watch(() => props.show, (val) => {
  if (val) {
    confirmationWorkerId.value = ''
    suiviWorkerId.value = ''
    isSubmitting.value = false
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
  emit('confirm', {
    orderIds: props.orders.map(o => o.id),
    confirmationWorkerId: confirmationWorkerId.value || undefined,
    suiviWorkerId: suiviWorkerId.value || undefined
  })
}

const handleClose = () => {
  if (!isSubmitting.value) {
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
            <DialogPanel class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <UserGroupIcon class="w-5 h-5 text-primary-600" />
                {{ t('supervisor.assignOrders') }}
              </DialogTitle>

              <!-- Order summary -->
              <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  {{ t('supervisor.assigningCount', { count: orders.length }) }}
                </p>
              </div>

              <div class="space-y-4">
                <!-- Confirmation Worker -->
                <div>
                  <label class="label flex items-center gap-2">
                    <span class="text-lg">🎯</span>
                    {{ t('supervisor.confirmation') }}
                  </label>
                  <select
                    v-model="confirmationWorkerId"
                    class="input"
                    :disabled="isSubmitting"
                  >
                    <option value="">{{ t('supervisor.noAssignment') }}</option>
                    <option
                      v-for="worker in workers"
                      :key="worker.id"
                      :value="worker.id"
                    >
                      {{ getWorkerName(worker) }}
                    </option>
                  </select>
                </div>

                <!-- Suivi Worker -->
                <div>
                  <label class="label flex items-center gap-2">
                    <span class="text-lg">🚚</span>
                    {{ t('supervisor.suivi') }}
                  </label>
                  <select
                    v-model="suiviWorkerId"
                    class="input"
                    :disabled="isSubmitting"
                  >
                    <option value="">{{ t('supervisor.noAssignment') }}</option>
                    <option
                      v-for="worker in workers"
                      :key="worker.id"
                      :value="worker.id"
                    >
                      {{ getWorkerName(worker) }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Hint -->
              <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {{ t('supervisor.simpleAssignHint') }}
              </p>

              <!-- Actions -->
              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  class="btn-secondary"
                  :disabled="isSubmitting"
                  @click="handleClose"
                >
                  {{ t('common.cancel') }}
                </button>
                <button
                  type="button"
                  class="btn-primary"
                  :disabled="!canSubmit"
                  @click="handleConfirm"
                >
                  {{ isSubmitting ? t('common.loading') : t('supervisor.assign') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
