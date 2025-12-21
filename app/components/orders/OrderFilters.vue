<script setup lang="ts">
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import type { City } from '~/types/city'
import type { DeliveryCompany } from '~/types/deliveryCompany'
import type { Store } from '~/types/store'
import type { Source } from '~/types/source'

interface Filters {
  phase: string
  state: string
  cityId: string
  deliveryCompanyId: string
  storeId: string
  sourceId: string
}

const props = defineProps<{
  cities: City[]
  deliveryCompanies: DeliveryCompany[]
  stores: Store[]
  sources: Source[]
  hidePhaseStatus?: boolean
}>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const filters = defineModel<Filters>('filters', {
  default: () => ({
    phase: '',
    state: '',
    cityId: '',
    deliveryCompanyId: '',
    storeId: '',
    sourceId: ''
  })
})

const { t } = useI18n()
const showFilters = ref(false)
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-4">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('common.search')"
          class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        @click="showFilters = !showFilters"
      >
        <FunnelIcon class="h-5 w-5" />
        {{ t('common.filter') }}
        <ChevronDownIcon class="h-4 w-4 transition-transform" :class="{ 'rotate-180': showFilters }" />
      </button>
    </div>

    <!-- Filter Panel -->
    <div v-if="showFilters" class="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 md:grid-cols-3 lg:grid-cols-6">
      <select
        v-if="!hidePhaseStatus"
        v-model="filters.phase"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">{{ t('orders.phase') }}</option>
        <option value="confirmation">{{ t('orders.phases.confirmation') }}</option>
        <option value="shipping">{{ t('orders.phases.shipping') }}</option>
      </select>

      <select
        v-if="!hidePhaseStatus"
        v-model="filters.state"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">{{ t('orders.status') }}</option>
        <option value="new">{{ t('orders.statuses.new') }}</option>
        <option value="pending">{{ t('orders.statuses.pending') }}</option>
        <option value="confirmed">{{ t('orders.statuses.confirmed') }}</option>
        <option value="shipped">{{ t('orders.statuses.shipped') }}</option>
        <option value="delivered">{{ t('orders.statuses.delivered') }}</option>
        <option value="cancelled">{{ t('orders.statuses.cancelled') }}</option>
        <option value="returned">{{ t('orders.statuses.returned') }}</option>
      </select>

      <select
        v-model="filters.cityId"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">{{ t('orders.city') }}</option>
        <option v-for="city in cities" :key="city.id" :value="city.id">{{ city.name }}</option>
      </select>

      <select
        v-model="filters.deliveryCompanyId"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">{{ t('nav.deliveryCompanies') }}</option>
        <option v-for="dc in deliveryCompanies" :key="dc.id" :value="dc.id">{{ dc.name }}</option>
      </select>

      <select
        v-model="filters.storeId"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">{{ t('nav.stores') }}</option>
        <option v-for="store in stores" :key="store.id" :value="store.id">{{ store.name }}</option>
      </select>

      <select
        v-model="filters.sourceId"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">{{ t('nav.sources') }}</option>
        <option v-for="source in sources" :key="source.id" :value="source.id">{{ source.title }}</option>
      </select>
    </div>
  </div>
</template>
