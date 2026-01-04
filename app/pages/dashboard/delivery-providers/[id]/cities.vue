<template>
  <div class="space-y-6">
    <!-- Header with Back Button -->
    <div class="flex items-center gap-4">
      <NuxtLink
        to="/dashboard/delivery-providers"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <ArrowLeftIcon class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t('deliveryProviders.viewCities') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ connection?.displayName || $t('common.loading') }}
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingConnection || isLoadingCities" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        <p class="mt-4 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
      </div>
    </div>

    <template v-else-if="connection">
      <!-- Connection Info Card -->
      <div class="card">
        <div class="flex items-center gap-4">
          <img
            v-if="connection.templateLogoUrl"
            :src="connection.templateLogoUrl"
            :alt="connection.templateName"
            class="w-12 h-12 rounded-lg object-contain"
          />
          <TruckIcon v-else class="w-12 h-12 text-gray-400" />
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ connection.displayName }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ connection.templateName }} ({{ connection.templateCode }})
            </p>
          </div>
          <div class="text-right">
            <div v-if="connection.hubCityName" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPinIcon class="w-4 h-4" />
              <span>Hub: {{ connection.hubCityName }}</span>
            </div>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="connection.isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'"
            >
              {{ connection.isActive ? $t('common.active') : $t('common.inactive') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Cities Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card">
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('providerCities.citiesConfigured') }}</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ cities.length }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('common.active') }}</p>
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ activeCities.length }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('common.inactive') }}</p>
          <p class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ inactiveCities.length }}</p>
        </div>
      </div>

      <!-- Cities Table -->
      <div class="card overflow-hidden p-0">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('providerCities.title') }}
          </h3>
          <button
            @click="refetch"
            class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-2"
            :disabled="isFetching"
          >
            <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': isFetching }" />
            {{ $t('common.refresh') }}
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('providerCities.cityName') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('providerCities.externalId') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('providerCities.deliveredFee') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('providerCities.refusedFee') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('common.status') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="!cities.length">
                <td colspan="5" class="px-6 py-12 text-center">
                  <MapPinIcon class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p class="text-gray-500 dark:text-gray-400">{{ $t('providerCities.noCities') }}</p>
                </td>
              </tr>
              <tr
                v-for="city in cities"
                :key="city.cityId"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <MapPinIcon class="w-5 h-5 text-gray-400" />
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ city.cityName }}</p>
                      <p v-if="city.externalZone" class="text-sm text-gray-500 dark:text-gray-400">
                        {{ city.externalZone }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ city.externalCityId || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ formatCurrency(city.defaultDeliveredFee) }}
                    </span>
                    <span
                      v-if="city.hasCustomFee"
                      class="ml-2 text-xs text-blue-600 dark:text-blue-400"
                      :title="$t('providerCities.customFee')"
                    >
                      ({{ formatCurrency(city.tenantFee) }})
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ formatCurrency(city.defaultRefusedFee) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
                    :class="city.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="city.isActive ? 'bg-green-500' : 'bg-gray-400'" />
                    {{ city.isActive ? $t('common.active') : $t('common.inactive') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Error State -->
    <div v-else class="card text-center py-12">
      <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p class="text-lg font-medium text-gray-900 dark:text-white mb-2">{{ $t('common.error') }}</p>
      <p v-if="errorMessage" class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ errorMessage }}</p>
      <NuxtLink
        to="/dashboard/delivery-providers"
        class="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400"
      >
        <ArrowLeftIcon class="w-4 h-4 mr-2" />
        {{ $t('common.back') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeftIcon,
  MapPinIcon,
  TruckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { useTenantDeliveryConnectionsService } from '~/services'
import { useTenantDeliveryConnectionsGetCities } from '~/api/generated/endpoints/tenant-delivery-connections/tenant-delivery-connections'
import type { ConnectionCityDto } from '~/api/generated/models'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.TenantDeliveryConnections.View',
})

const route = useRoute()
const connectionId = computed(() => route.params.id as string)

// Get connection details
const connectionsService = useTenantDeliveryConnectionsService()
const { getById } = connectionsService

const connectionQuery = getById(connectionId.value)
const connection = computed(() => connectionQuery.data.value)
const isLoadingConnection = computed(() => connectionQuery.isLoading.value)
const connectionError = computed(() => connectionQuery.error.value)

// Get cities for this connection
const citiesQuery = useTenantDeliveryConnectionsGetCities(connectionId)
const cities = computed<ConnectionCityDto[]>(() => citiesQuery.data.value ?? [])
const activeCities = computed(() => cities.value.filter(c => c.isActive))
const inactiveCities = computed(() => cities.value.filter(c => !c.isActive))
const isLoadingCities = computed(() => citiesQuery.isLoading.value)
const isFetching = computed(() => citiesQuery.isFetching.value)
const citiesError = computed(() => citiesQuery.error.value)

// Combined error message
const errorMessage = computed(() => {
  const err = connectionError.value || citiesError.value
  if (!err) return null
  return (err as any)?.response?.data?.message || (err as any)?.message || t('common.errorOccurred')
})

const { t } = useI18n()

const refetch = () => {
  citiesQuery.refetch()
}

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-'
  return `${value.toFixed(2)} DH`
}
</script>

<style scoped>
.card {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700;
}
</style>
