<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/super-admin/city-mappings"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeftIcon class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ company?.name ?? $t('common.loading') }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ $t('cityMappings.manageMappings', 'Manage city mappings for this provider') }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="syncCompany"
          :disabled="isSyncing"
          class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
        >
          <ArrowPathIcon v-if="isSyncing" class="w-4 h-4 animate-spin" />
          <CloudArrowDownIcon v-else class="w-4 h-4" />
          {{ $t('cityMappings.sync', 'Sync Cities') }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
        <p class="mt-4 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
      </div>
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <MapPinIcon class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('cityMappings.totalCities', 'Total Cities') }}</p>
          </div>
        </div>
        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <CheckCircleIcon class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.matched }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('cityMappings.matched', 'Matched') }}</p>
          </div>
        </div>
        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
            <ExclamationTriangleIcon class="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ stats.unmatched }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('cityMappings.unmatched', 'Unmatched') }}</p>
          </div>
        </div>
        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <HandRaisedIcon class="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ stats.manual }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('cityMappings.manual', 'Manual') }}</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <input
              v-model="searchTerm"
              type="text"
              :placeholder="$t('cityMappings.searchPlaceholder', 'Search cities...')"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div class="flex gap-2">
            <button
              @click="filterStatus = 'all'"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                filterStatus === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              {{ $t('common.all', 'All') }}
            </button>
            <button
              @click="filterStatus = 'matched'"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                filterStatus === 'matched'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              {{ $t('cityMappings.matched', 'Matched') }}
            </button>
            <button
              @click="filterStatus = 'unmatched'"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                filterStatus === 'unmatched'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              {{ $t('cityMappings.unmatched', 'Unmatched') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Mappings List -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('cityMappings.providerCity', 'Provider City') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('cityMappings.localCity', 'Local City') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('cityMappings.fees', 'Delivery Fee') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('cityMappings.status', 'Status') }}
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('cityMappings.actions', 'Actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="!filteredMappings.length">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {{ $t('common.noData', 'No mappings found') }}
                </td>
              </tr>
              <tr v-for="mapping in paginatedMappings" :key="mapping.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ mapping.externalName }}</p>
                    <p v-if="mapping.externalRegion" class="text-sm text-gray-500 dark:text-gray-400">
                      {{ mapping.externalRegion }}
                    </p>
                    <p class="text-xs text-gray-400 dark:text-gray-500">ID: {{ mapping.externalId }}</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div v-if="mapping.cityId" class="flex items-center gap-2">
                    <CheckCircleIcon class="w-5 h-5 text-green-500" />
                    <span class="text-gray-900 dark:text-white">{{ mapping.cityName }}</span>
                  </div>
                  <div v-else class="flex items-center gap-2">
                    <select
                      v-if="editingMappingId === mapping.id"
                      v-model="selectedCityId"
                      class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">{{ $t('cityMappings.selectCity', 'Select city...') }}</option>
                      <option v-for="city in localCities" :key="city.id" :value="city.id">
                        {{ city.name }}
                      </option>
                    </select>
                    <span v-else class="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <ExclamationTriangleIcon class="w-5 h-5" />
                      {{ $t('cityMappings.notMapped', 'Not mapped') }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="mapping.deliveryFee" class="text-gray-900 dark:text-white">
                    {{ mapping.deliveryFee }} DH
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getMappingStatusClass(mapping)"
                  >
                    {{ getMappingStatusText(mapping) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <template v-if="editingMappingId === mapping.id">
                      <button
                        @click="saveMapping(mapping)"
                        :disabled="!selectedCityId || isSavingMapping"
                        class="px-2 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
                      >
                        {{ $t('common.save', 'Save') }}
                      </button>
                      <button
                        @click="cancelEdit"
                        class="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {{ $t('common.cancel', 'Cancel') }}
                      </button>
                    </template>
                    <template v-else>
                      <button
                        v-if="!mapping.cityId"
                        @click="startEdit(mapping)"
                        class="px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      >
                        {{ $t('cityMappings.map', 'Map') }}
                      </button>
                      <button
                        v-else
                        @click="unmapCity(mapping)"
                        class="px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {{ $t('cityMappings.unmap', 'Unmap') }}
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('common.showing', 'Showing {from} to {to} of {total}', { from: (currentPage - 1) * pageSize + 1, to: Math.min(currentPage * pageSize, filteredMappings.length), total: filteredMappings.length }) }}
          </p>
          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
            >
              {{ $t('common.previous', 'Previous') }}
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
            >
              {{ $t('common.next', 'Next') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeftIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CloudArrowDownIcon,
  HandRaisedIcon,
} from '@heroicons/vue/24/outline'
import {
  useDeliveryCompaniesGet,
} from '~/api/generated/endpoints/delivery-companies/delivery-companies'
import {
  useCityLocationMappingsSearch,
  useCityLocationMappingsSync,
  useCityLocationMappingsUpdate,
} from '~/api/generated/endpoints/city-location-mappings/city-location-mappings'
import {
  useCitiesSearch,
} from '~/api/generated/endpoints/cities/cities'
import type { CityLocationMappingDto } from '~/api/generated/models/cityLocationMappingDto'
import type { CityDto } from '~/api/generated/models/cityDto'

definePageMeta({
  layout: 'super-admin',
  middleware: ['auth', 'super-admin'],
})

const route = useRoute()
const { t } = useI18n()
const companyId = computed(() => route.params.id as string)

// Queries
const { data: company, isLoading: isLoadingCompany } = useDeliveryCompaniesGet(companyId)
const searchMappings = useCityLocationMappingsSearch()
const searchCities = useCitiesSearch()
const syncMutation = useCityLocationMappingsSync()
const updateMutation = useCityLocationMappingsUpdate()

// Data
const mappings = ref<CityLocationMappingDto[]>([])
const localCities = ref<CityDto[]>([])
const isLoading = ref(true)
const isSyncing = ref(false)
const isSavingMapping = ref(false)
const editingMappingId = ref<string | null>(null)
const selectedCityId = ref('')
const searchTerm = ref('')
const filterStatus = ref<'all' | 'matched' | 'unmatched'>('all')
const currentPage = ref(1)
const pageSize = 20

// Computed
const stats = computed(() => {
  const total = mappings.value.length
  const matched = mappings.value.filter(m => m.cityId).length
  const unmatched = total - matched
  const manual = mappings.value.filter(m => m.isManuallyMapped).length
  return { total, matched, unmatched, manual }
})

const filteredMappings = computed(() => {
  let result = mappings.value

  // Filter by status
  if (filterStatus.value === 'matched') {
    result = result.filter(m => m.cityId)
  } else if (filterStatus.value === 'unmatched') {
    result = result.filter(m => !m.cityId)
  }

  // Filter by search term
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter(m =>
      m.externalName?.toLowerCase().includes(term) ||
      m.cityName?.toLowerCase().includes(term) ||
      m.externalRegion?.toLowerCase().includes(term)
    )
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredMappings.value.length / pageSize))

const paginatedMappings = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredMappings.value.slice(start, start + pageSize)
})

// Watch for filter changes to reset page
watch([filterStatus, searchTerm], () => {
  currentPage.value = 1
})

// Load data
const loadData = async () => {
  isLoading.value = true
  try {
    // Load mappings for this company
    const mappingsResult = await searchMappings.mutateAsync({
      data: {
        pageNumber: 1,
        pageSize: 5000,
        advancedFilter: {
          field: 'deliveryCompanyId',
          operator: 'eq',
          value: companyId.value
        },
        keyword: null,
        advancedSearch: null,
        orderBy: null
      }
    })
    mappings.value = mappingsResult.data ?? []

    // Load local cities for mapping dropdown
    const citiesResult = await searchCities.mutateAsync({
      data: { pageNumber: 1, pageSize: 2000, advancedFilter: null, keyword: null, advancedSearch: null, orderBy: ['name'] }
    })
    localCities.value = citiesResult.data ?? []
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    isLoading.value = false
  }
}

// Sync cities
const syncCompany = async () => {
  isSyncing.value = true
  try {
    await syncMutation.mutateAsync({ deliveryCompanyId: companyId.value })
    await loadData()
  } catch (error) {
    console.error('Sync failed:', error)
  } finally {
    isSyncing.value = false
  }
}

// Edit mapping
const startEdit = (mapping: CityLocationMappingDto) => {
  editingMappingId.value = mapping.id!
  selectedCityId.value = ''
}

const cancelEdit = () => {
  editingMappingId.value = null
  selectedCityId.value = ''
}

const saveMapping = async (mapping: CityLocationMappingDto) => {
  if (!selectedCityId.value) return
  isSavingMapping.value = true
  try {
    await updateMutation.mutateAsync({
      id: mapping.id!,
      data: {
        id: mapping.id!,
        cityId: selectedCityId.value,
        isManuallyMapped: true,
      }
    })
    await loadData()
    cancelEdit()
  } catch (error) {
    console.error('Failed to save mapping:', error)
  } finally {
    isSavingMapping.value = false
  }
}

const unmapCity = async (mapping: CityLocationMappingDto) => {
  try {
    await updateMutation.mutateAsync({
      id: mapping.id!,
      data: {
        id: mapping.id!,
        cityId: null,
        isManuallyMapped: false,
      }
    })
    await loadData()
  } catch (error) {
    console.error('Failed to unmap city:', error)
  }
}

// Status helpers
const getMappingStatusClass = (mapping: CityLocationMappingDto) => {
  if (mapping.cityId && mapping.isManuallyMapped) {
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
  if (mapping.cityId) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }
  return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
}

const getMappingStatusText = (mapping: CityLocationMappingDto) => {
  if (mapping.cityId && mapping.isManuallyMapped) {
    return t('cityMappings.manuallyMapped', 'Manual')
  }
  if (mapping.cityId) {
    return t('cityMappings.autoMapped', 'Auto')
  }
  return t('cityMappings.pending', 'Pending')
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
