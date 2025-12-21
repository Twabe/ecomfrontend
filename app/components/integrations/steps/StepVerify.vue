<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ $t('integrations.wizard.verify') }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        {{ $t('integrations.wizard.verifyDesc', { platform: platformName }) }}
      </p>
    </div>

    <!-- Connection Status Box -->
    <div
      class="p-6 rounded-xl border-2 text-center"
      :class="statusBoxClasses"
    >
      <!-- Status Icon -->
      <div class="mb-4">
        <div
          v-if="isChecking"
          class="w-16 h-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
        >
          <ArrowPathIcon class="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
        <div
          v-else-if="status === 'connected'"
          class="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
        >
          <CheckCircleIcon class="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <div
          v-else-if="status === 'error'"
          class="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
        >
          <ExclamationCircleIcon class="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <div
          v-else
          class="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
        >
          <ClockIcon class="w-10 h-10 text-gray-400" />
        </div>
      </div>

      <!-- Status Text -->
      <h4 class="text-lg font-semibold" :class="statusTextClasses">
        {{ statusTitle }}
      </h4>
      <p class="text-sm mt-2" :class="statusDescClasses">
        {{ statusDescription }}
      </p>

      <!-- Last Synced Info -->
      <p v-if="lastSyncedAt" class="text-xs text-gray-500 dark:text-gray-400 mt-3">
        {{ $t('integrations.wizard.lastSync', { date: formatDate(lastSyncedAt) }) }}
      </p>

      <!-- Verify Button -->
      <button
        v-if="status !== 'connected'"
        type="button"
        class="mt-4 px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isChecking"
        @click="emit('verify')"
      >
        <span v-if="isChecking" class="flex items-center gap-2">
          <ArrowPathIcon class="w-4 h-4 animate-spin" />
          {{ $t('integrations.wizard.checking') }}
        </span>
        <span v-else class="flex items-center gap-2">
          <ArrowPathIcon class="w-4 h-4" />
          {{ $t('integrations.wizard.checkConnection') }}
        </span>
      </button>
    </div>

    <!-- Confirmation Checkbox -->
    <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <label class="flex items-start gap-3 cursor-pointer">
        <input
          v-model="confirmed"
          type="checkbox"
          class="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <div>
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            {{ $t('integrations.wizard.understood', { platform: platformName }) }}
          </span>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('integrations.wizard.understoodDesc') }}
          </p>
        </div>
      </label>
    </div>

    <!-- Help Link -->
    <div v-if="helpUrl" class="text-center">
      <a
        :href="helpUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
      >
        <QuestionMarkCircleIcon class="w-4 h-4" />
        {{ $t('integrations.wizard.needHelp') }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon
} from '@heroicons/vue/24/outline'
import type { ConnectionStatusType } from '../ConnectionStatus.vue'

const props = defineProps<{
  platformName: string
  status: ConnectionStatusType
  isChecking: boolean
  lastSyncedAt?: string | null
  helpUrl?: string
}>()

const emit = defineEmits<{
  (e: 'verify'): void
  (e: 'update:confirmed', value: boolean): void
}>()

const confirmed = ref(false)

watch(confirmed, (value) => {
  emit('update:confirmed', value)
})

const { t } = useI18n()

const statusBoxClasses = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
    case 'error':
      return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
    default:
      return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
  }
})

const statusTextClasses = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'text-green-700 dark:text-green-300'
    case 'error':
      return 'text-red-700 dark:text-red-300'
    default:
      return 'text-gray-700 dark:text-gray-300'
  }
})

const statusDescClasses = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'text-green-600 dark:text-green-400'
    case 'error':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-500 dark:text-gray-400'
  }
})

const statusTitle = computed(() => {
  if (props.isChecking) {
    return t('integrations.wizard.checkingConnection')
  }
  switch (props.status) {
    case 'connected':
      return t('integrations.wizard.connectionSuccess')
    case 'error':
      return t('integrations.wizard.connectionError')
    default:
      return t('integrations.wizard.awaitingConnection')
  }
})

const statusDescription = computed(() => {
  if (props.isChecking) {
    return t('integrations.wizard.checkingConnectionDesc')
  }
  switch (props.status) {
    case 'connected':
      return t('integrations.wizard.connectionSuccessDesc')
    case 'error':
      return t('integrations.wizard.connectionErrorDesc')
    default:
      return t('integrations.wizard.awaitingConnectionDesc')
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}
</script>
