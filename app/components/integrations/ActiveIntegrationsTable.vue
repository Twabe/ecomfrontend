<template>
  <div class="card overflow-hidden p-0">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ $t('common.name') }}
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ $t('platformIntegrations.type') }}
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ $t('platformIntegrations.defaultStore') }}
            </th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ $t('common.status') }}
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ $t('platformIntegrations.lastSynced') }}
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ $t('common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="integration in integrations"
            :key="integration.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <!-- Name -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  :style="getIconStyle(integration)"
                >
                  <component
                    :is="getPlatformIcon(integration)"
                    class="w-5 h-5"
                    :style="{ color: getPlatformColorValue(integration) }"
                  />
                </div>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ integration.name }}
                </span>
              </div>
            </td>

            <!-- Type -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2.5 py-1 text-xs font-medium rounded"
                :style="{
                  backgroundColor: getPlatformBgColor(integration),
                  color: getPlatformColorValue(integration)
                }"
              >
                {{ getPlatformName(integration) }}
              </span>
            </td>

            <!-- Store -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-if="integration.defaultStoreName" class="text-gray-600 dark:text-gray-400">
                {{ integration.defaultStoreName }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <button
                type="button"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="integration.isActive ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'"
                role="switch"
                :aria-checked="integration.isActive"
                @click="emit('toggle', integration)"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="integration.isActive ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'"
                />
              </button>
            </td>

            <!-- Last Synced -->
            <td class="px-6 py-4 whitespace-nowrap">
              <IntegrationsConnectionStatus
                :status="getConnectionStatus(integration)"
                :last-synced-at="integration.lastSyncedAt"
                :show-last-sync="false"
              />
              <span v-if="integration.lastSyncedAt" class="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ formatDate(integration.lastSyncedAt) }}
              </span>
              <span v-else class="block text-xs text-gray-400 mt-1">
                {{ $t('integrations.wizard.neverSynced') }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  type="button"
                  class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  :title="$t('integrations.card.viewWebhook')"
                  @click="emit('viewWebhook', integration)"
                >
                  <LinkIcon class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  :title="$t('integrations.card.edit')"
                  @click="emit('edit', integration)"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  class="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  :title="$t('integrations.card.delete')"
                  @click="emit('delete', integration)"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PencilIcon,
  TrashIcon,
  LinkIcon,
  CloudIcon,
  ShoppingCartIcon,
  TableCellsIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  BoltIcon
} from '@heroicons/vue/24/outline'
import type { PlatformIntegrationDto } from '~/api/generated/models'
import type { ConnectionStatusType } from './ConnectionStatus.vue'

defineProps<{
  integrations: PlatformIntegrationDto[]
}>()

const emit = defineEmits<{
  (e: 'edit', integration: PlatformIntegrationDto): void
  (e: 'delete', integration: PlatformIntegrationDto): void
  (e: 'toggle', integration: PlatformIntegrationDto): void
  (e: 'viewWebhook', integration: PlatformIntegrationDto): void
}>()

const { getPlatformConfig } = usePlatformConfig()
const colorMode = useColorMode()

const getPlatformName = (integration: PlatformIntegrationDto) => {
  if (integration.type) {
    const config = getPlatformConfig(integration.type)
    return config?.name || 'Unknown'
  }
  return 'Unknown'
}

const getPlatformColorValue = (integration: PlatformIntegrationDto) => {
  if (integration.type) {
    const config = getPlatformConfig(integration.type)
    return config?.color || '#6B7280'
  }
  return '#6B7280'
}

const getPlatformBgColor = (integration: PlatformIntegrationDto) => {
  if (integration.type) {
    const config = getPlatformConfig(integration.type)
    const isDark = colorMode.value === 'dark'
    return isDark ? config?.darkBgColor || '#374151' : config?.bgColor || '#F3F4F6'
  }
  return '#F3F4F6'
}

const getIconStyle = (integration: PlatformIntegrationDto) => ({
  backgroundColor: getPlatformBgColor(integration)
})

const getPlatformIcon = (integration: PlatformIntegrationDto) => {
  if (integration.type) {
    const config = getPlatformConfig(integration.type)
    switch (config?.icon) {
      case 'youcan':
        return ShoppingCartIcon
      case 'shopify':
        return ShoppingCartIcon
      case 'woocommerce':
        return GlobeAltIcon
      case 'lightfunnels':
        return RocketLaunchIcon
      case 'storeep':
        return CloudIcon
      case 'sheets':
        return TableCellsIcon
      default:
        return BoltIcon
    }
  }
  return BoltIcon
}

const getConnectionStatus = (integration: PlatformIntegrationDto): ConnectionStatusType => {
  if (!integration.isActive) {
    return 'disconnected'
  }
  if (integration.lastSyncedAt) {
    return 'connected'
  }
  return 'pending'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
