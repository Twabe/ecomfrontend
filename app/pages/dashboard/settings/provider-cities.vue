<script setup lang="ts">
import { useProviderCities, type DeliveryCompanyType } from '~/composables/useProviderCities'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { t } = useI18n()

// Available providers with city support
const providers: { value: DeliveryCompanyType; label: string }[] = [
  { value: 'ForceLog', label: 'ForceLog' },
  { value: 'Ameex', label: 'Ameex' },
  { value: 'Digylog', label: 'Digylog' },
  { value: 'Sendit', label: 'Sendit' },
  { value: 'Onessta', label: 'Onessta' },
  { value: 'KargoExpress', label: 'Kargo Express' },
]

const selectedProvider = ref<DeliveryCompanyType>('ForceLog')
const searchTerm = ref('')
const debouncedSearch = refDebounced(searchTerm, 300)

const { data: cities, isLoading, error, refetch } = useProviderCities(
  selectedProvider,
  debouncedSearch,
  { enabled: computed(() => !!selectedProvider.value) }
)

// Filter cities locally for instant feedback
const filteredCities = computed(() => {
  if (!cities.value) return []
  if (!searchTerm.value) return cities.value

  const term = searchTerm.value.toLowerCase()
  return cities.value.filter(c =>
    c.name.toLowerCase().includes(term) ||
    c.district?.toLowerCase().includes(term)
  )
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('settings.providerCities', 'Provider Cities') }}
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ t('settings.providerCitiesDesc', 'View cities supported by delivery providers. Use this to verify city names match.') }}
      </p>
    </div>

    <!-- Provider Selection -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="w-full sm:w-64">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ t('common.provider', 'Provider') }}
        </label>
        <select
          v-model="selectedProvider"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option v-for="p in providers" :key="p.value" :value="p.value">
            {{ p.label }}
          </option>
        </select>
      </div>

      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ t('common.search', 'Search') }}
        </label>
        <input
          v-model="searchTerm"
          type="text"
          :placeholder="t('settings.searchCities', 'Search cities...')"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div class="flex items-end">
        <button
          @click="refetch()"
          :disabled="isLoading"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <span v-if="isLoading" class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {{ t('common.loading', 'Loading...') }}
          </span>
          <span v-else>{{ t('common.refresh', 'Refresh') }}</span>
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-red-600 dark:text-red-400">
        {{ t('common.error', 'Error') }}: {{ (error as Error).message }}
      </p>
    </div>

    <!-- Cities Count -->
    <div v-if="cities" class="mb-4 text-sm text-gray-600 dark:text-gray-400">
      {{ t('settings.citiesFound', '{count} cities found', { count: filteredCities.length }) }}
    </div>

    <!-- Cities Grid -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    </div>

    <div v-else-if="filteredCities.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <div
        v-for="city in filteredCities"
        :key="city.name"
        class="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
      >
        <div class="font-medium text-gray-900 dark:text-white">{{ city.name }}</div>
        <div v-if="city.district" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ city.district }}
        </div>
      </div>
    </div>

    <div v-else-if="cities" class="text-center py-12 text-gray-500 dark:text-gray-400">
      {{ t('common.noResults', 'No cities found') }}
    </div>
  </div>
</template>
