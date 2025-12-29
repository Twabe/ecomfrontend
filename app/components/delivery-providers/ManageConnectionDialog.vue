<template>
  <TransitionRoot :show="modelValue" as="template">
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
            <DialogPanel class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl">
              <!-- Header -->
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <img
                      v-if="connection?.templateLogoUrl"
                      :src="connection.templateLogoUrl"
                      :alt="connection.templateName || ''"
                      class="w-8 h-8 rounded-lg object-contain"
                    />
                    <TruckIcon v-else class="w-8 h-8 text-gray-400" />
                    <div>
                      <span>{{ connection?.templateName }}</span>
                      <p class="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {{ connection?.displayName || connection?.storeName || $t('deliveryProviders.allStores') }}
                      </p>
                    </div>
                  </DialogTitle>
                  <button
                    type="button"
                    class="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    @click="handleClose"
                  >
                    <XMarkIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="px-6 py-6 space-y-6">
                <!-- Status Section -->
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center"
                      :class="connection?.isActive ? 'bg-green-100 dark:bg-green-900' : 'bg-amber-100 dark:bg-amber-900'"
                    >
                      <CheckCircleIcon
                        v-if="connection?.isActive"
                        class="w-6 h-6 text-green-600 dark:text-green-400"
                      />
                      <ExclamationTriangleIcon
                        v-else
                        class="w-6 h-6 text-amber-600 dark:text-amber-400"
                      />
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ connection?.isActive ? $t('deliveryProviders.statusActive') : $t('deliveryProviders.statusInactive') }}
                      </p>
                      <p v-if="connection?.lastTestedAt" class="text-xs text-gray-500 dark:text-gray-400">
                        {{ $t('deliveryProviders.lastTest') }}: {{ formatDate(connection.lastTestedAt) }}
                      </p>
                    </div>
                  </div>

                  <!-- Toggle Active -->
                  <button
                    type="button"
                    class="text-sm px-3 py-1.5 rounded-lg"
                    :class="connection?.isActive
                      ? 'text-amber-700 bg-amber-100 hover:bg-amber-200 dark:text-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800'
                      : 'text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-900 dark:hover:bg-green-800'"
                    :disabled="isToggling"
                    @click="handleToggleActive"
                  >
                    <span v-if="isToggling" class="flex items-center gap-1">
                      <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                    </span>
                    <span v-else>
                      {{ connection?.isActive ? $t('deliveryProviders.deactivate') : $t('deliveryProviders.activate') }}
                    </span>
                  </button>
                </div>

                <!-- Last Test Result -->
                <div v-if="connection?.lastTestedAt" class="p-4 rounded-lg" :class="testResultClass">
                  <div class="flex items-center gap-2">
                    <CheckCircleIcon v-if="connection.lastTestSuccessful" class="w-5 h-5 text-green-600 dark:text-green-400" />
                    <XCircleIcon v-else class="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span class="font-medium">
                      {{ connection.lastTestSuccessful ? $t('deliveryProviders.testSuccess') : $t('deliveryProviders.testFailed') }}
                    </span>
                  </div>
                  <p v-if="connection.lastTestError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ connection.lastTestError }}
                  </p>
                </div>

                <!-- Test Result (after testing) -->
                <div v-if="testResult" class="p-4 rounded-lg" :class="testResult.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'">
                  <div class="flex items-center gap-2">
                    <CheckCircleIcon v-if="testResult.success" class="w-5 h-5 text-green-600 dark:text-green-400" />
                    <XCircleIcon v-else class="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span class="font-medium" :class="testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'">
                      {{ testResult.success ? $t('deliveryProviders.testSuccess') : $t('deliveryProviders.testFailed') }}
                    </span>
                  </div>
                  <p v-if="testResult.message" class="mt-1 text-sm" :class="testResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'">
                    {{ testResult.message }}
                  </p>
                </div>

                <!-- Actions -->
                <div class="grid grid-cols-2 gap-3">
                  <!-- Test Connection -->
                  <button
                    type="button"
                    class="btn-secondary flex items-center justify-center gap-2"
                    :disabled="isTesting"
                    @click="handleTest"
                  >
                    <div v-if="isTesting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    <BeakerIcon v-else class="w-4 h-4" />
                    {{ $t('deliveryProviders.testConnection') }}
                  </button>

                  <!-- Sync Statuses -->
                  <button
                    type="button"
                    class="btn-secondary flex items-center justify-center gap-2"
                    :disabled="isSyncing"
                    @click="handleSync"
                  >
                    <div v-if="isSyncing" class="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    <ArrowPathIcon v-else class="w-4 h-4" />
                    {{ $t('deliveryProviders.syncStatuses') }}
                  </button>
                </div>

                <!-- Sync Result -->
                <div v-if="syncResult" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p class="text-sm text-blue-800 dark:text-blue-200">
                    {{ $t('deliveryProviders.syncResult', { count: syncResult.ordersUpdated || 0 }) }}
                  </p>
                </div>

                <!-- Webhook URL -->
                <div v-if="fullWebhookUrl" class="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ $t('deliveryProviders.webhookUrl') }}
                  </label>
                  <div class="flex items-center gap-2">
                    <input
                      :value="fullWebhookUrl"
                      type="text"
                      class="input w-full bg-gray-50 dark:bg-gray-700 text-sm"
                      readonly
                    />
                    <button
                      type="button"
                      class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      @click="copyWebhookUrl"
                    >
                      <ClipboardDocumentIcon class="w-5 h-5" />
                    </button>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ $t('deliveryProviders.webhookHelp') }}
                  </p>
                </div>

                <!-- Danger Zone -->
                <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 class="text-sm font-medium text-red-600 dark:text-red-400 mb-3">
                    {{ $t('deliveryProviders.dangerZone') }}
                  </h4>
                  <button
                    type="button"
                    class="btn-danger w-full flex items-center justify-center gap-2"
                    :disabled="isDisconnecting"
                    @click="handleDisconnect"
                  >
                    <div v-if="isDisconnecting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <TrashIcon v-else class="w-4 h-4" />
                    {{ $t('deliveryProviders.disconnect') }}
                  </button>
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                    {{ $t('deliveryProviders.disconnectWarning') }}
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
                <button
                  type="button"
                  class="btn-secondary"
                  @click="handleClose"
                >
                  {{ $t('common.close') }}
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
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import {
  XMarkIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  ArrowPathIcon,
  TrashIcon,
  ClipboardDocumentIcon,
} from '@heroicons/vue/24/outline'
import type { TenantDeliveryConnectionDto, TestConnectionResponse, SyncConnectionResponse } from '~/services'

const props = defineProps<{
  modelValue: boolean
  connection?: TenantDeliveryConnectionDto
  isTesting?: boolean
  isSyncing?: boolean
  isToggling?: boolean
  isDisconnecting?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'test', id: string): void
  (e: 'sync', id: string): void
  (e: 'activate', id: string): void
  (e: 'deactivate', id: string): void
  (e: 'disconnect', id: string): void
}>()

const { notify } = useNotification()
const config = useRuntimeConfig()

// Full webhook URL with domain (use backend API URL, not frontend)
const fullWebhookUrl = computed(() => {
  if (!props.connection?.webhookUrl) return ''
  const baseUrl = config.public.apiBaseUrl || 'http://localhost:5001'
  return `${baseUrl}${props.connection.webhookUrl}`
})

// Test and sync results
const testResult = ref<TestConnectionResponse | null>(null)
const syncResult = ref<SyncConnectionResponse | null>(null)

// Reset results when dialog opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    testResult.value = null
    syncResult.value = null
  }
})

// Computed
const testResultClass = computed(() => {
  if (!props.connection?.lastTestedAt) return ''
  return props.connection.lastTestSuccessful
    ? 'bg-green-50 dark:bg-green-900/20'
    : 'bg-red-50 dark:bg-red-900/20'
})

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

// Handlers
const handleClose = () => {
  if (!props.isTesting && !props.isSyncing && !props.isDisconnecting) {
    emit('update:modelValue', false)
  }
}

const handleTest = () => {
  if (props.connection?.id) {
    emit('test', props.connection.id)
  }
}

const handleSync = () => {
  if (props.connection?.id) {
    emit('sync', props.connection.id)
  }
}

const handleToggleActive = () => {
  if (props.connection?.id) {
    if (props.connection.isActive) {
      emit('deactivate', props.connection.id)
    } else {
      emit('activate', props.connection.id)
    }
  }
}

const handleDisconnect = () => {
  if (props.connection?.id && confirm('Are you sure you want to disconnect this provider?')) {
    emit('disconnect', props.connection.id)
  }
}

const copyWebhookUrl = async () => {
  if (fullWebhookUrl.value) {
    try {
      await navigator.clipboard.writeText(fullWebhookUrl.value)
      notify.success('Webhook URL copied!')
    } catch {
      notify.error('Failed to copy')
    }
  }
}

// Expose methods for parent to update results
defineExpose({
  setTestResult: (result: TestConnectionResponse) => {
    testResult.value = result
  },
  setSyncResult: (result: SyncConnectionResponse) => {
    syncResult.value = result
  },
})
</script>

<style scoped>
.input {
  @apply block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
         text-gray-900 placeholder-gray-400
         focus:border-primary-500 focus:ring-1 focus:ring-primary-500
         dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
         dark:focus:border-primary-400 dark:focus:ring-primary-400;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium bg-white
         hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
         disabled:opacity-50 disabled:cursor-not-allowed
         dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700
         dark:focus:ring-offset-gray-800;
}

.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-lg font-medium
         hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
         disabled:opacity-50 disabled:cursor-not-allowed
         dark:focus:ring-offset-gray-800;
}
</style>
