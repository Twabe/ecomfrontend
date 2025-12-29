<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ $t('deliveryProviders.admin.title') }}
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t('deliveryProviders.admin.subtitle') }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
        <p class="mt-4 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
      </div>
    </div>

    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Providers -->
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('deliveryProviders.admin.totalProviders') }}</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats?.totalProviders ?? 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <TruckIcon class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <!-- Total Connections -->
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('deliveryProviders.admin.totalConnections') }}</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats?.totalConnections ?? 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <LinkIcon class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <!-- Active Connections -->
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('deliveryProviders.admin.activeConnections') }}</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats?.activeConnections ?? 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircleIcon class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <!-- Stale Connections -->
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('deliveryProviders.admin.staleConnections') }}</p>
              <p class="text-3xl font-bold" :class="(webhookHealth?.staleCount ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'">
                {{ webhookHealth?.staleCount ?? 0 }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-lg flex items-center justify-center" :class="(webhookHealth?.staleCount ?? 0) > 0 ? 'bg-amber-100 dark:bg-amber-900' : 'bg-gray-100 dark:bg-gray-700'">
              <ExclamationTriangleIcon class="w-6 h-6" :class="(webhookHealth?.staleCount ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'" />
            </div>
          </div>
        </div>
      </div>

      <!-- Provider Statistics Table -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('deliveryProviders.admin.providerStats') }}
          </h3>
          <button
            @click="refreshStats"
            class="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            :disabled="isRefreshing"
          >
            <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
            {{ $t('common.refresh') }}
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('deliveryProviders.admin.provider') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('deliveryProviders.admin.connections') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('deliveryProviders.admin.active') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('deliveryProviders.admin.lastWebhook') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="!stats?.providerStats?.length">
                <td colspan="4" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {{ $t('common.noData') }}
                </td>
              </tr>
              <tr v-for="provider in stats?.providerStats" :key="provider.templateId" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="provider.logoUrl"
                      :src="provider.logoUrl"
                      :alt="provider.name"
                      class="w-8 h-8 rounded-lg object-contain"
                    />
                    <TruckIcon v-else class="w-8 h-8 text-gray-400" />
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ provider.name }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ provider.code }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                  {{ provider.connectionCount }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="provider.activeCount > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
                  >
                    {{ provider.activeCount }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ provider.lastWebhookAt ? formatRelativeTime(provider.lastWebhookAt) : $t('deliveryProviders.admin.never') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Webhook Health Panel -->
      <div v-if="webhookHealth" class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('deliveryProviders.admin.webhookHealth') }}
          </h3>
        </div>

        <!-- Health Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircleIcon class="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ webhookHealth.healthyCount }}</p>
              <p class="text-sm text-green-700 dark:text-green-300">{{ $t('deliveryProviders.admin.healthy') }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <ExclamationTriangleIcon class="w-8 h-8 text-amber-600 dark:text-amber-400" />
            <div>
              <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ webhookHealth.staleCount }}</p>
              <p class="text-sm text-amber-700 dark:text-amber-300">{{ $t('deliveryProviders.admin.stale') }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <ClockIcon class="w-8 h-8 text-gray-600 dark:text-gray-400" />
            <div>
              <p class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ webhookHealth.neverReceivedCount }}</p>
              <p class="text-sm text-gray-700 dark:text-gray-300">{{ $t('deliveryProviders.admin.neverReceived') }}</p>
            </div>
          </div>
        </div>

        <!-- Stale Connections Alert -->
        <div v-if="webhookHealth.staleConnections?.length" class="border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden">
          <div class="bg-amber-50 dark:bg-amber-900/20 px-4 py-3 border-b border-amber-200 dark:border-amber-800">
            <div class="flex items-center gap-2">
              <ExclamationTriangleIcon class="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span class="font-medium text-amber-800 dark:text-amber-200">
                {{ $t('deliveryProviders.admin.staleAlert', { count: webhookHealth.staleCount }) }}
              </span>
            </div>
          </div>
          <div class="divide-y divide-amber-100 dark:divide-amber-900">
            <div
              v-for="connection in webhookHealth.staleConnections"
              :key="connection.connectionId"
              class="px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ connection.tenantName }} → {{ connection.providerName }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('deliveryProviders.admin.lastReceived') }}: {{ formatRelativeTime(connection.lastWebhookAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- All Healthy -->
        <div v-else class="flex items-center justify-center py-8 text-center">
          <div>
            <CheckCircleIcon class="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p class="text-lg font-medium text-gray-900 dark:text-white">{{ $t('deliveryProviders.admin.allHealthy') }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('deliveryProviders.admin.allHealthyDesc') }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  TruckIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'
import { useDeliveryProviderTemplatesService } from '~/services'

definePageMeta({
  layout: 'super-admin',
  middleware: ['auth', 'super-admin'],
})

const { t } = useI18n()
const templatesService = useDeliveryProviderTemplatesService()

// Data
const isRefreshing = ref(false)

// Queries
const { data: stats, isLoading: isLoadingStats, refetch: refetchStats } = templatesService.useStats()
const { data: webhookHealth, isLoading: isLoadingHealth, refetch: refetchHealth } = templatesService.useWebhookHealth()

const isLoading = computed(() => isLoadingStats.value || isLoadingHealth.value)

// Refresh
const refreshStats = async () => {
  isRefreshing.value = true
  try {
    await Promise.all([refetchStats(), refetchHealth()])
  } finally {
    isRefreshing.value = false
  }
}

// Format relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t('common.justNow') || 'Just now'
  if (diffMins < 60) return t('common.minutesAgo', { count: diffMins }) || `${diffMins}m ago`
  if (diffHours < 24) return t('common.hoursAgo', { count: diffHours }) || `${diffHours}h ago`
  return t('common.daysAgo', { count: diffDays }) || `${diffDays}d ago`
}
</script>

<style scoped>
.card {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700;
}
</style>
