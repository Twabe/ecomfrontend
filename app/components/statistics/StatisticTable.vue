<script setup lang="ts">
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { Statistic } from '~/types/statistic'

defineProps<{
  statistics: Statistic[]
  isLoading: boolean
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    pageSize: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}>()

const emit = defineEmits<{
  view: [statistic: Statistic]
  edit: [statistic: Statistic]
  delete: [statistic: Statistic]
  pageChange: [page: number]
}>()

const { t } = useI18n()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getDeliveryRate = (delivered: number, canceled: number) => {
  const total = delivered + canceled
  if (total === 0) return 0
  return ((delivered / total) * 100).toFixed(1)
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('statistics.date') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('nav.deliveryCompanies') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('nav.cities') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('nav.products') }}
            </th>
            <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('statistics.delivered') }}
            </th>
            <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('statistics.canceled') }}
            </th>
            <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('statistics.deliveryRate') }}
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          <tr v-if="isLoading">
            <td colspan="8" class="px-4 py-8 text-center text-gray-500">
              <div class="flex items-center justify-center">
                <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                <span class="ml-2">{{ t('common.loading') }}</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="statistics.length === 0">
            <td colspan="8" class="px-4 py-8 text-center text-gray-500">
              {{ t('common.noData') }}
            </td>
          </tr>
          <tr
            v-for="stat in statistics"
            v-else
            :key="stat.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td class="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
              {{ formatDate(stat.statisticDate) }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
              {{ stat.deliveryCompanyName || '-' }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
              {{ stat.cityName || '-' }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
              {{ stat.productName || '-' }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-center text-sm font-medium text-green-600 dark:text-green-400">
              {{ stat.deliveredCount }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-center text-sm font-medium text-red-600 dark:text-red-400">
              {{ stat.canceledCount }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-center">
              <span
                :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  Number(getDeliveryRate(stat.deliveredCount, stat.canceledCount)) >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  Number(getDeliveryRate(stat.deliveredCount, stat.canceledCount)) >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                ]"
              >
                {{ getDeliveryRate(stat.deliveredCount, stat.canceledCount) }}%
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right text-sm">
              <div class="flex items-center justify-end gap-2">
                <button
                  class="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
                  :title="t('common.edit')"
                  @click="emit('edit', stat)"
                >
                  <PencilIcon class="h-4 w-4" />
                </button>
                <button
                  class="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                  :title="t('common.delete')"
                  @click="emit('delete', stat)"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        {{ t('common.showing') }} {{ (pagination.currentPage - 1) * pagination.pageSize + 1 }}-{{ Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount) }}
        {{ t('common.of') }} {{ pagination.totalCount }}
      </div>
      <div class="flex gap-2">
        <button
          :disabled="!pagination.hasPreviousPage"
          class="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
          @click="emit('pageChange', pagination.currentPage - 1)"
        >
          {{ t('common.previous') }}
        </button>
        <button
          :disabled="!pagination.hasNextPage"
          class="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
          @click="emit('pageChange', pagination.currentPage + 1)"
        >
          {{ t('common.next') }}
        </button>
      </div>
    </div>
  </div>
</template>
