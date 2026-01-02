<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t('cityMappings.title', 'City Mappings') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('cityMappings.subtitle', 'Sync and map delivery provider cities to local cities') }}
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingCompanies" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
        <p class="mt-4 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
      </div>
    </div>

    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('cityMappings.totalCompanies', 'Delivery Companies') }}</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ deliveryCompanies?.length ?? 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <TruckIcon class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('cityMappings.totalMappings', 'Total Mappings') }}</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ mappingsStats.total }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <MapPinIcon class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('cityMappings.matched', 'Matched') }}</p>
              <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ mappingsStats.matched }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircleIcon class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('cityMappings.unmatched', 'Unmatched') }}</p>
              <p class="text-3xl font-bold" :class="mappingsStats.unmatched > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'">
                {{ mappingsStats.unmatched }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-lg flex items-center justify-center" :class="mappingsStats.unmatched > 0 ? 'bg-amber-100 dark:bg-amber-900' : 'bg-gray-100 dark:bg-gray-700'">
              <ExclamationTriangleIcon class="w-6 h-6" :class="mappingsStats.unmatched > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'" />
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery Companies with Sync -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('cityMappings.syncProviders', 'Sync Provider Cities') }}
          </h3>
          <button
            @click="refreshAll"
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
                  {{ $t('cityMappings.provider', 'Provider') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('cityMappings.type', 'Type') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('cityMappings.mappings', 'Mappings') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('cityMappings.lastSync', 'Last Sync') }}
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('cityMappings.actions', 'Actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="!deliveryCompanies?.length">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {{ $t('common.noData') }}
                </td>
              </tr>
              <tr v-for="company in deliveryCompanies" :key="company.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <TruckIcon class="w-8 h-8 text-gray-400" />
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ company.name }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ company.phone }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {{ company.type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-900 dark:text-white">{{ getCompanyMappingsCount(company.id!) }}</span>
                    <span v-if="getCompanyUnmatchedCount(company.id!) > 0" class="text-xs text-amber-600 dark:text-amber-400">
                      ({{ getCompanyUnmatchedCount(company.id!) }} {{ $t('cityMappings.unmatched', 'unmatched') }})
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ getLastSyncDate(company.id!) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="syncCompany(company.id!)"
                      :disabled="syncingCompanyId === company.id"
                      class="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center gap-1"
                    >
                      <ArrowPathIcon v-if="syncingCompanyId === company.id" class="w-4 h-4 animate-spin" />
                      <CloudArrowDownIcon v-else class="w-4 h-4" />
                      {{ $t('cityMappings.sync', 'Sync') }}
                    </button>
                    <button
                      @click="autoMatchCompany(company.id!)"
                      :disabled="autoMatchingCompanyId === company.id"
                      class="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg disabled:opacity-50 flex items-center gap-1"
                    >
                      <ArrowPathIcon v-if="autoMatchingCompanyId === company.id" class="w-4 h-4 animate-spin" />
                      <SparklesIcon v-else class="w-4 h-4" />
                      {{ $t('cityMappings.autoMatch', 'Auto-Match') }}
                    </button>
                    <NuxtLink
                      :to="`/super-admin/city-mappings/${company.id}`"
                      class="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-1"
                    >
                      <EyeIcon class="w-4 h-4" />
                      {{ $t('common.view', 'View') }}
                    </NuxtLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Sync Results -->
      <div v-if="recentSyncResults.length > 0" class="card">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ $t('cityMappings.recentSyncs', 'Recent Sync Results') }}
        </h3>
        <div class="space-y-3">
          <div
            v-for="result in recentSyncResults"
            :key="result.deliveryCompanyId"
            class="flex items-center justify-between p-4 rounded-lg"
            :class="result.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'"
          >
            <div class="flex items-center gap-3">
              <CheckCircleIcon v-if="result.success" class="w-6 h-6 text-green-600 dark:text-green-400" />
              <XCircleIcon v-else class="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <p class="font-medium" :class="result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'">
                  {{ result.providerCode }}
                </p>
                <p class="text-sm" :class="result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  {{ result.success
                    ? $t('cityMappings.syncSuccess', '{total} cities: {new} new, {updated} updated', { total: result.totalCities, new: result.newMappings, updated: result.updatedMappings })
                    : result.errorMessage
                  }}
                </p>
              </div>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatRelativeTime(result.syncedAt!) }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  TruckIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CloudArrowDownIcon,
  SparklesIcon,
  EyeIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline'
import {
  useDeliveryCompaniesSearch,
} from '~/api/generated/endpoints/delivery-companies/delivery-companies'
import {
  useCityLocationMappingsSearch,
  useCityLocationMappingsSync,
  useCityLocationMappingsAutoMatch,
} from '~/api/generated/endpoints/city-location-mappings/city-location-mappings'
import type { DeliveryCompanyDto } from '~/api/generated/models/deliveryCompanyDto'
import type { CityLocationMappingDto } from '~/api/generated/models/cityLocationMappingDto'
import type { LocationSyncResultDto } from '~/api/generated/models/locationSyncResultDto'

definePageMeta({
  layout: 'super-admin',
  middleware: ['auth', 'super-admin'],
})

const { t } = useI18n()

// Queries
const searchCompanies = useDeliveryCompaniesSearch()
const searchMappings = useCityLocationMappingsSearch()
const syncMutation = useCityLocationMappingsSync()
const autoMatchMutation = useCityLocationMappingsAutoMatch()

// Data
const deliveryCompanies = ref<DeliveryCompanyDto[]>([])
const allMappings = ref<CityLocationMappingDto[]>([])
const isLoadingCompanies = ref(true)
const isRefreshing = ref(false)
const syncingCompanyId = ref<string | null>(null)
const autoMatchingCompanyId = ref<string | null>(null)
const recentSyncResults = ref<LocationSyncResultDto[]>([])

// Computed
const mappingsStats = computed(() => {
  const total = allMappings.value.length
  const matched = allMappings.value.filter(m => m.cityId).length
  const unmatched = total - matched
  return { total, matched, unmatched }
})

// Mappings by company
const mappingsByCompany = computed(() => {
  const map = new Map<string, CityLocationMappingDto[]>()
  for (const m of allMappings.value) {
    if (!m.deliveryCompanyId) continue
    const list = map.get(m.deliveryCompanyId) ?? []
    list.push(m)
    map.set(m.deliveryCompanyId, list)
  }
  return map
})

const getCompanyMappingsCount = (companyId: string) => {
  return mappingsByCompany.value.get(companyId)?.length ?? 0
}

const getCompanyUnmatchedCount = (companyId: string) => {
  return mappingsByCompany.value.get(companyId)?.filter(m => !m.cityId).length ?? 0
}

const getLastSyncDate = (companyId: string) => {
  const mappings = mappingsByCompany.value.get(companyId)
  if (!mappings?.length) return t('common.never', 'Never')
  const latestSync = mappings
    .filter(m => m.lastSyncedAt)
    .map(m => new Date(m.lastSyncedAt!))
    .sort((a, b) => b.getTime() - a.getTime())[0]
  return latestSync ? formatRelativeTime(latestSync.toISOString()) : t('common.never', 'Never')
}

// Load data
const loadData = async () => {
  isLoadingCompanies.value = true
  try {
    // Load delivery companies
    const companiesResult = await searchCompanies.mutateAsync({
      data: { pageNumber: 1, pageSize: 100, advancedFilter: null, keyword: null, advancedSearch: null, orderBy: null }
    })
    deliveryCompanies.value = companiesResult.data ?? []

    // Load all mappings
    const mappingsResult = await searchMappings.mutateAsync({
      data: { pageNumber: 1, pageSize: 5000, advancedFilter: null, keyword: null, advancedSearch: null, orderBy: null }
    })
    allMappings.value = mappingsResult.data ?? []
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    isLoadingCompanies.value = false
  }
}

const refreshAll = async () => {
  isRefreshing.value = true
  await loadData()
  isRefreshing.value = false
}

// Sync company
const syncCompany = async (companyId: string) => {
  syncingCompanyId.value = companyId
  try {
    const result = await syncMutation.mutateAsync({ deliveryCompanyId: companyId })
    recentSyncResults.value.unshift(result)
    if (recentSyncResults.value.length > 5) {
      recentSyncResults.value.pop()
    }
    // Refresh mappings
    await loadData()
  } catch (error) {
    console.error('Sync failed:', error)
    recentSyncResults.value.unshift({
      deliveryCompanyId: companyId,
      providerCode: deliveryCompanies.value.find(c => c.id === companyId)?.type ?? 'Unknown',
      success: false,
      errorMessage: (error as Error).message,
      syncedAt: new Date().toISOString(),
    })
  } finally {
    syncingCompanyId.value = null
  }
}

// Auto-match company
const autoMatchCompany = async (companyId: string) => {
  autoMatchingCompanyId.value = companyId
  try {
    const matchedCount = await autoMatchMutation.mutateAsync({ deliveryCompanyId: companyId })
    // Show success message
    recentSyncResults.value.unshift({
      deliveryCompanyId: companyId,
      providerCode: deliveryCompanies.value.find(c => c.id === companyId)?.type ?? 'Unknown',
      success: true,
      totalCities: matchedCount,
      newMappings: matchedCount,
      updatedMappings: 0,
      syncedAt: new Date().toISOString(),
    })
    // Refresh mappings
    await loadData()
  } catch (error) {
    console.error('Auto-match failed:', error)
  } finally {
    autoMatchingCompanyId.value = null
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

  if (diffMins < 1) return t('common.justNow', 'Just now')
  if (diffMins < 60) return t('common.minutesAgo', '{count}m ago', { count: diffMins })
  if (diffHours < 24) return t('common.hoursAgo', '{count}h ago', { count: diffHours })
  return t('common.daysAgo', '{count}d ago', { count: diffDays })
}

// Initial load
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700;
}
</style>
