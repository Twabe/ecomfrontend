<script setup lang="ts">
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import type { DeliveryCompany } from '~/types/deliveryCompany'

interface Filters {
  deliveryCompanyId: string
  paymentMethod: string
}

defineProps<{
  deliveryCompanies: DeliveryCompany[]
}>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const filters = defineModel<Filters>('filters', {
  default: () => ({
    deliveryCompanyId: '',
    paymentMethod: ''
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
    <div v-if="showFilters" class="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <select
        v-model="filters.deliveryCompanyId"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">{{ t('nav.deliveryCompanies') }}</option>
        <option v-for="dc in deliveryCompanies" :key="dc.id" :value="dc.id">{{ dc.name }}</option>
      </select>

      <select
        v-model="filters.paymentMethod"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">{{ t('payments.paymentMethod') }}</option>
        <option value="cash">{{ t('payments.methods.cash') }}</option>
        <option value="bank_transfer">{{ t('payments.methods.bankTransfer') }}</option>
        <option value="check">{{ t('payments.methods.check') }}</option>
      </select>
    </div>
  </div>
</template>
