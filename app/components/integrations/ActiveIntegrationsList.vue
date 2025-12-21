<template>
  <div>
    <!-- Section Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('integrations.activeIntegrations') }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ integrations.length }} {{ $t('common.records') }}
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="integrations.length === 0"
      class="card text-center py-12"
    >
      <LinkIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ $t('integrations.noIntegrations') }}
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        {{ $t('integrations.noIntegrationsDesc') }}
      </p>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Mobile View: Cards -->
      <div class="block lg:hidden space-y-4">
        <IntegrationsActiveIntegrationCard
          v-for="integration in integrations"
          :key="integration.id"
          :integration="integration"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
          @toggle="emit('toggle', $event)"
          @view-webhook="emit('viewWebhook', $event)"
        />
      </div>

      <!-- Desktop View: Table -->
      <div class="hidden lg:block">
        <IntegrationsActiveIntegrationsTable
          :integrations="integrations"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
          @toggle="emit('toggle', $event)"
          @view-webhook="emit('viewWebhook', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LinkIcon } from '@heroicons/vue/24/outline'
import type { PlatformIntegrationDto } from '~/api/generated/models'

defineProps<{
  integrations: PlatformIntegrationDto[]
}>()

const emit = defineEmits<{
  (e: 'edit', integration: PlatformIntegrationDto): void
  (e: 'delete', integration: PlatformIntegrationDto): void
  (e: 'toggle', integration: PlatformIntegrationDto): void
  (e: 'viewWebhook', integration: PlatformIntegrationDto): void
}>()
</script>
