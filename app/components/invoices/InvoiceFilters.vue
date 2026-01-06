<script setup lang="ts">
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import type { DeliveryCompany } from '~/types/deliveryCompany'
import type { Store } from '~/types/store'

interface Filters {
  deliveryCompanyId: string
  storeId: string
  invoiceType: string
  isValidated: string
  isReceived: string
}

// Invoice type options
const invoiceTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'delivery_company', label: 'Delivery Company' },
  { value: 'worker', label: 'Worker' },
  { value: 'media_buyer', label: 'Media Buyer' },
  { value: 'manual', label: 'Manual' }
]

defineProps<{
  deliveryCompanies: DeliveryCompany[]
  stores: Store[]
}>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const filters = defineModel<Filters>('filters', {
  default: () => ({
    deliveryCompanyId: '',
    storeId: '',
    invoiceType: '',
    isValidated: '',
    isReceived: ''
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
    <div v-if="showFilters" class="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 md:grid-cols-5">
      <!-- Invoice Type Filter -->
      <select
        v-model="filters.invoiceType"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option v-for="opt in invoiceTypeOptions" :key="opt.value" :value="opt.value">
          {{ t('invoices.type' + opt.label.replace(/\s+/g, '')) || opt.label }}
        </option>
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
        v-model="filters.isValidated"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">{{ t('invoices.validation') }}</option>
        <option value="true">{{ t('invoices.validated') }}</option>
        <option value="false">{{ t('invoices.notValidated') }}</option>
      </select>

      <select
        v-model="filters.isReceived"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">{{ t('invoices.reception') }}</option>
        <option value="true">{{ t('invoices.received') }}</option>
        <option value="false">{{ t('invoices.notReceived') }}</option>
      </select>
    </div>
  </div>
</template>
