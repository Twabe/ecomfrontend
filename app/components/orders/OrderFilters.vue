<script setup lang="ts">
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import { OrderPhase, OrderState } from '~/constants/order'
import type { City } from '~/types/city'
import type { DeliveryCompany } from '~/types/deliveryCompany'
import type { Store } from '~/types/store'
import type { Source } from '~/types/source'
import type { DateRange, DatePreset } from '~/utils/date'

interface Filters {
  phase: string
  state: string
  trackingState?: string
  cityId: string
  deliveryCompanyId: string
  storeId: string
  sourceId: string
  isArchived?: boolean | null
}

const props = defineProps<{
  cities: City[]
  deliveryCompanies: DeliveryCompany[]
  stores: Store[]
  sources: Source[]
  hidePhaseStatus?: boolean
  showDateFilter?: boolean
}>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const filters = defineModel<Filters>('filters', {
  default: () => ({
    phase: '',
    state: '',
    trackingState: '',
    cityId: '',
    deliveryCompanyId: '',
    storeId: '',
    sourceId: '',
    isArchived: null
  })
})
const dateRange = defineModel<DateRange>('dateRange', {
  default: () => ({ from: null, to: null })
})
const datePreset = defineModel<DatePreset>('datePreset', {
  default: 'this_month'
})

const { t } = useI18n()
const showFilters = ref(false)
</script>

<template>
  <div class="space-y-4">
    <!-- Date Range Filter -->
    <UiDateRangeFilter
      v-if="showDateFilter"
      v-model="dateRange"
      v-model:preset="datePreset"
    />

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
        <option :value="OrderPhase.Confirmation">{{ t('orders.phases.confirmation') }}</option>
        <option :value="OrderPhase.Shipping">{{ t('orders.phases.shipping') }}</option>
      </select>

      <select
        v-if="!hidePhaseStatus"
        v-model="filters.state"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">{{ t('orders.status') }}</option>
        <option :value="OrderState.New">{{ t('orders.statuses.new') }}</option>
        <option :value="OrderState.Pending">{{ t('orders.statuses.pending') }}</option>
        <option :value="OrderState.Confirmed">{{ t('orders.statuses.confirmed') }}</option>
        <option :value="OrderState.Shipped">{{ t('orders.statuses.shipped') }}</option>
        <option :value="OrderState.Delivered">{{ t('orders.statuses.delivered') }}</option>
        <option :value="OrderState.Cancelled">{{ t('orders.statuses.cancelled') }}</option>
        <option :value="OrderState.Returned">{{ t('orders.statuses.returned') }}</option>
      </select>

      <div class="min-w-[180px]">
        <UiSearchableSelect
          v-model="filters.cityId"
          :options="cities"
          :placeholder="t('orders.city')"
        />
      </div>

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

      <!-- Archive Filter -->
      <select
        v-model="filters.isArchived"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option :value="null">{{ t('orders.archiveFilter.all') }}</option>
        <option :value="false">{{ t('orders.archiveFilter.active') }}</option>
        <option :value="true">{{ t('orders.archiveFilter.archived') }}</option>
      </select>
    </div>
  </div>
</template>
