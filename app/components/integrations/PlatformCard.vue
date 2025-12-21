<template>
  <button
    type="button"
    class="group flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200
           border-gray-200 hover:border-primary-500 hover:shadow-lg
           dark:border-gray-700 dark:hover:border-primary-400
           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
           dark:focus:ring-offset-gray-900"
    :disabled="isConnecting"
    @click="handleClick"
  >
    <!-- Platform Icon -->
    <div
      class="w-16 h-16 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200
             group-hover:scale-110"
      :style="iconStyle"
    >
      <component
        :is="platformIcon"
        class="w-8 h-8"
        :style="{ color: platform.color }"
      />
    </div>

    <!-- Platform Name -->
    <span class="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
      {{ platform.name }}
    </span>

    <!-- Platform Description -->
    <span class="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
      {{ $t(platform.description) }}
    </span>

    <!-- OAuth Badge (for YouCan) -->
    <span
      v-if="platform.isOAuth"
      class="mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1"
    >
      <LinkIcon v-if="!isConnecting" class="w-3 h-3" />
      <div v-else class="animate-spin rounded-full h-3 w-3 border-b-2 border-green-800 dark:border-green-200" />
      {{ isConnecting ? $t('integrations.connecting') : $t('integrations.oauth') }}
    </span>

    <!-- Script Badge (for Google Sheets) -->
    <span
      v-else-if="platform.isScriptBased"
      class="mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    >
      Script
    </span>
  </button>
</template>

<script setup lang="ts">
import {
  CloudIcon,
  ShoppingCartIcon,
  TableCellsIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  BoltIcon,
  LinkIcon
} from '@heroicons/vue/24/outline'
import type { PlatformConfig } from '~/composables/usePlatformConfig'
import { PlatformType } from '~/types/platformintegration'

const props = defineProps<{
  platform: PlatformConfig
  isConnecting?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', platform: PlatformConfig): void
  (e: 'oauth-connect', platform: PlatformConfig): void
}>()

const colorMode = useColorMode()

const iconStyle = computed(() => {
  const isDark = colorMode.value === 'dark'
  return {
    backgroundColor: isDark ? props.platform.darkBgColor : props.platform.bgColor
  }
})

// Handle click - emit different events based on platform type
const handleClick = () => {
  if (props.platform.isOAuth) {
    emit('oauth-connect', props.platform)
  } else {
    emit('select', props.platform)
  }
}

// Map platform type to icon component
const platformIcon = computed(() => {
  switch (props.platform.icon) {
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
</script>
