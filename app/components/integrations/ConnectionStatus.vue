<template>
  <div class="flex items-center gap-2">
    <!-- Status Icon -->
    <span
      class="relative flex h-2.5 w-2.5"
      :class="statusClasses.container"
    >
      <span
        v-if="status === 'connected'"
        class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
        :class="statusClasses.ping"
      />
      <span
        class="relative inline-flex h-2.5 w-2.5 rounded-full"
        :class="statusClasses.dot"
      />
    </span>

    <!-- Status Text -->
    <div class="flex flex-col">
      <span class="text-sm font-medium" :class="statusClasses.text">
        {{ statusLabel }}
      </span>
      <span v-if="showLastSync && lastSyncedAt" class="text-xs text-gray-500 dark:text-gray-400">
        {{ $t('integrations.wizard.lastSync', { date: formatDate(lastSyncedAt) }) }}
      </span>
      <span v-else-if="showLastSync && !lastSyncedAt" class="text-xs text-gray-500 dark:text-gray-400">
        {{ $t('integrations.wizard.neverSynced') }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
export type ConnectionStatusType = 'connected' | 'pending' | 'disconnected' | 'error'

const props = withDefaults(defineProps<{
  status: ConnectionStatusType
  lastSyncedAt?: string | null
  showLastSync?: boolean
}>(), {
  showLastSync: true
})

const { t } = useI18n()

const statusClasses = computed(() => {
  switch (props.status) {
    case 'connected':
      return {
        container: '',
        ping: 'bg-green-400',
        dot: 'bg-green-500',
        text: 'text-green-600 dark:text-green-400'
      }
    case 'pending':
      return {
        container: '',
        ping: '',
        dot: 'bg-yellow-500',
        text: 'text-yellow-600 dark:text-yellow-400'
      }
    case 'error':
      return {
        container: '',
        ping: '',
        dot: 'bg-red-500',
        text: 'text-red-600 dark:text-red-400'
      }
    case 'disconnected':
    default:
      return {
        container: '',
        ping: '',
        dot: 'bg-gray-400',
        text: 'text-gray-500 dark:text-gray-400'
      }
  }
})

const statusLabel = computed(() => {
  switch (props.status) {
    case 'connected':
      return t('integrations.wizard.connected')
    case 'pending':
      return t('integrations.wizard.pending')
    case 'error':
      return t('integrations.wizard.error')
    case 'disconnected':
    default:
      return t('integrations.wizard.notConnected')
  }
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return t('common.justNow')
  } else if (diffMins < 60) {
    return t('common.minutesAgo', { count: diffMins })
  } else if (diffHours < 24) {
    return t('common.hoursAgo', { count: diffHours })
  } else if (diffDays < 7) {
    return t('common.daysAgo', { count: diffDays })
  } else {
    return date.toLocaleDateString()
  }
}
</script>
