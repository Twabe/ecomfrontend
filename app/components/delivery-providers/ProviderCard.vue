<template>
  <div
    class="relative flex flex-col rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-800"
    :class="[
      connection
        ? 'border-primary-500 dark:border-primary-400'
        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600',
      'hover:shadow-lg'
    ]"
  >
    <!-- Connected Ribbon -->
    <div
      v-if="connection?.isActive"
      class="absolute -top-1 -right-1 overflow-hidden w-24 h-24 pointer-events-none"
    >
      <div
        class="absolute top-4 -right-8 w-32 text-center text-xs font-semibold text-white py-1 transform rotate-45 bg-green-500 shadow-sm"
      >
        {{ $t('deliveryProviders.connected') }}
      </div>
    </div>

    <!-- Inactive Badge -->
    <div
      v-else-if="connection && !connection.isActive"
      class="absolute top-2 right-2"
    >
      <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
        {{ $t('deliveryProviders.inactive') }}
      </span>
    </div>

    <!-- Card Content -->
    <div class="p-4 flex flex-col items-center">
      <!-- Provider Logo -->
      <div class="w-16 h-16 rounded-xl flex items-center justify-center mb-3 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <img
          v-if="template.logoUrl"
          :src="template.logoUrl"
          :alt="template.name"
          class="w-full h-full object-contain p-2"
        />
        <TruckIcon v-else class="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>

      <!-- Provider Name -->
      <span class="font-medium text-gray-900 dark:text-white text-center">
        {{ template.name }}
      </span>

      <!-- Website Link -->
      <a
        v-if="template.websiteUrl"
        :href="template.websiteUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-1"
        @click.stop
      >
        <LinkIcon class="w-3 h-3" />
        {{ $t('common.website') }}
      </a>

      <!-- Cities Count -->
      <span class="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {{ $t('deliveryProviders.citiesCount', { count: template.citiesCount || 0 }) }}
      </span>

      <!-- Webhook Badge -->
      <span
        v-if="template.hasWebhook"
        class="mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1"
      >
        <BoltIcon class="w-3 h-3" />
        Webhook
      </span>
    </div>

    <!-- Action Buttons -->
    <div class="px-4 pb-4 mt-auto">
      <div class="flex gap-2">
        <!-- Connect Button (when not connected) -->
        <button
          v-if="!connection"
          type="button"
          class="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-2"
          :disabled="isLoading"
          @click="$emit('connect', template)"
        >
          <LinkIcon class="w-4 h-4" />
          {{ $t('deliveryProviders.connect') }}
        </button>

        <!-- Manage Buttons (when connected) -->
        <template v-else>
          <button
            type="button"
            class="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-2"
            :disabled="isLoading"
            @click="$emit('manage', connection)"
          >
            <Cog6ToothIcon class="w-4 h-4" />
            {{ $t('deliveryProviders.manage') }}
          </button>

          <!-- How to Connect Link -->
          <a
            v-if="template.howToConnectUrl"
            :href="template.howToConnectUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-ghost text-sm py-2 px-3 flex items-center gap-1"
            @click.stop
          >
            <VideoCameraIcon class="w-4 h-4" />
          </a>
        </template>

        <!-- How to Connect (when not connected) -->
        <a
          v-if="!connection && template.howToConnectUrl"
          :href="template.howToConnectUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-ghost text-sm py-2 px-3 flex items-center gap-1 text-primary-600 dark:text-primary-400"
          @click.stop
          :title="$t('common.help')"
        >
          <VideoCameraIcon class="w-4 h-4" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  TruckIcon,
  LinkIcon,
  BoltIcon,
  Cog6ToothIcon,
  VideoCameraIcon,
} from '@heroicons/vue/24/outline'
import type { DeliveryProviderTemplateDto, TenantDeliveryConnectionDto } from '~/services'

defineProps<{
  template: DeliveryProviderTemplateDto
  connection?: TenantDeliveryConnectionDto
  isLoading?: boolean
}>()

defineEmits<{
  (e: 'connect', template: DeliveryProviderTemplateDto): void
  (e: 'manage', connection: TenantDeliveryConnectionDto): void
}>()
</script>

<style scoped>
.btn-primary {
  @apply bg-primary-600 text-white rounded-lg font-medium
         hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
         disabled:opacity-50 disabled:cursor-not-allowed
         dark:focus:ring-offset-gray-800;
}

.btn-secondary {
  @apply border border-gray-300 text-gray-700 rounded-lg font-medium bg-white
         hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
         disabled:opacity-50 disabled:cursor-not-allowed
         dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700
         dark:focus:ring-offset-gray-800;
}

.btn-ghost {
  @apply text-gray-600 rounded-lg font-medium
         hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
         dark:text-gray-400 dark:hover:bg-gray-700
         dark:focus:ring-offset-gray-800;
}
</style>
