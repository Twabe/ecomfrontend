<template>
  <div class="card">
    <div class="flex items-start justify-between">
      <!-- Left: Platform Info -->
      <div class="flex items-center gap-4">
        <!-- Platform Icon -->
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          :style="iconStyle"
        >
          <component
            :is="platformIcon"
            class="w-6 h-6"
            :style="{ color: platformColor }"
          />
        </div>

        <!-- Integration Info -->
        <div class="min-w-0">
          <h3 class="font-medium text-gray-900 dark:text-white truncate">
            {{ integration.name }}
          </h3>
          <div class="flex items-center gap-2 mt-1">
            <span
              class="px-2 py-0.5 text-xs font-medium rounded"
              :style="{ backgroundColor: platformBgColor, color: platformColor }"
            >
              {{ platformName }}
            </span>
            <span v-if="integration.defaultStoreName" class="text-xs text-gray-500 dark:text-gray-400">
              {{ integration.defaultStoreName }}
            </span>
          </div>
          <IntegrationsConnectionStatus
            class="mt-2"
            :status="connectionStatus"
            :last-synced-at="integration.lastSyncedAt"
          />
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-2">
        <!-- Toggle Switch -->
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

        <!-- Menu Button -->
        <Menu as="div" class="relative">
          <MenuButton
            class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <EllipsisVerticalIcon class="w-5 h-5" />
          </MenuButton>

          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems
              class="absolute right-0 rtl:right-auto rtl:left-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <div class="py-1">
                <MenuItem v-slot="{ active }">
                  <button
                    type="button"
                    class="flex w-full items-center gap-2 px-4 py-2 text-sm"
                    :class="active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'"
                    @click="emit('edit', integration)"
                  >
                    <PencilIcon class="w-4 h-4" />
                    {{ $t('integrations.card.edit') }}
                  </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    type="button"
                    class="flex w-full items-center gap-2 px-4 py-2 text-sm"
                    :class="active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'"
                    @click="emit('viewWebhook', integration)"
                  >
                    <LinkIcon class="w-4 h-4" />
                    {{ $t('integrations.card.viewWebhook') }}
                  </button>
                </MenuItem>
                <div class="border-t border-gray-200 dark:border-gray-700 my-1" />
                <MenuItem v-slot="{ active }">
                  <button
                    type="button"
                    class="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400"
                    :class="active ? 'bg-red-50 dark:bg-red-900/20' : ''"
                    @click="emit('delete', integration)"
                  >
                    <TrashIcon class="w-4 h-4" />
                    {{ $t('integrations.card.delete') }}
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import {
  EllipsisVerticalIcon,
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
import { PlatformType, PLATFORM_TYPES } from '~/types/platformintegration'

const props = defineProps<{
  integration: PlatformIntegrationDto
}>()

const emit = defineEmits<{
  (e: 'edit', integration: PlatformIntegrationDto): void
  (e: 'delete', integration: PlatformIntegrationDto): void
  (e: 'toggle', integration: PlatformIntegrationDto): void
  (e: 'viewWebhook', integration: PlatformIntegrationDto): void
}>()

const { getPlatformConfig, getPlatformColor } = usePlatformConfig()
const colorMode = useColorMode()

const platformConfig = computed(() => {
  if (props.integration.type) {
    return getPlatformConfig(props.integration.type)
  }
  return null
})

const platformName = computed(() => {
  return platformConfig.value?.name || 'Unknown'
})

const platformColor = computed(() => {
  return platformConfig.value?.color || '#6B7280'
})

const platformBgColor = computed(() => {
  const isDark = colorMode.value === 'dark'
  return isDark
    ? platformConfig.value?.darkBgColor || '#374151'
    : platformConfig.value?.bgColor || '#F3F4F6'
})

const iconStyle = computed(() => ({
  backgroundColor: platformBgColor.value
}))

const platformIcon = computed(() => {
  switch (platformConfig.value?.icon) {
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
})

const connectionStatus = computed<ConnectionStatusType>(() => {
  if (!props.integration.isActive) {
    return 'disconnected'
  }
  if (props.integration.lastSyncedAt) {
    return 'connected'
  }
  return 'pending'
})
</script>
