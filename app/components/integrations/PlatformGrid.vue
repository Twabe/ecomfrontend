<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
    <IntegrationsPlatformCard
      v-for="platform in platforms"
      :key="platform.type"
      :platform="platform"
      :is-connecting="connectingPlatform === platform.type"
      @select="handleSelect"
      @oauth-connect="handleOAuthConnect"
    />
  </div>
</template>

<script setup lang="ts">
import type { PlatformConfig } from '~/composables/usePlatformConfig'

defineProps<{
  platforms: PlatformConfig[]
  connectingPlatform?: string | null
}>()

const emit = defineEmits<{
  (e: 'select', platform: PlatformConfig): void
  (e: 'oauth-connect', platform: PlatformConfig): void
}>()

const handleSelect = (platform: PlatformConfig) => {
  emit('select', platform)
}

const handleOAuthConnect = (platform: PlatformConfig) => {
  emit('oauth-connect', platform)
}
</script>
