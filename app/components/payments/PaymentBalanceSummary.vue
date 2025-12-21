<script setup lang="ts">
import type { CompanyBalanceSummary } from '~/types/payment'

const props = defineProps<{
  balances: CompanyBalanceSummary[]
  isLoading: boolean
}>()

const { t } = useI18n()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)
}

const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-MA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const totalOutstanding = computed(() => {
  return props.balances.reduce((sum, b) => sum + b.totalOutstandingAmount, 0)
})

const totalPaid = computed(() => {
  return props.balances.reduce((sum, b) => sum + b.totalPaymentsReceived, 0)
})

const totalBalance = computed(() => {
  return props.balances.reduce((sum, b) => sum + b.netBalance, 0)
})
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      {{ t('payments.companyBalance') }}
    </h3>

    <div v-if="isLoading" class="mt-4 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="props.balances.length === 0" class="mt-4 text-center text-gray-500">
      {{ t('common.noData') }}
    </div>

    <div v-else class="mt-4 space-y-4">
      <!-- Summary totals -->
      <div class="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
        <div class="text-center">
          <div class="text-xs text-gray-500">{{ t('payments.totalOutstanding') }}</div>
          <div class="text-lg font-semibold text-orange-600">{{ formatCurrency(totalOutstanding) }}</div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-500">{{ t('payments.totalPaid') }}</div>
          <div class="text-lg font-semibold text-green-600">{{ formatCurrency(totalPaid) }}</div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-500">{{ t('payments.netBalance') }}</div>
          <div class="text-lg font-semibold" :class="totalBalance >= 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'">
            {{ formatCurrency(totalBalance) }}
          </div>
        </div>
      </div>

      <!-- Per company breakdown -->
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <div
          v-for="balance in props.balances"
          :key="balance.deliveryCompanyId"
          class="py-3"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">{{ balance.deliveryCompanyName }}</div>
              <div class="text-xs text-gray-500">
                {{ balance.outstandingOrdersCount }} {{ t('orders.orders') }}
                <span v-if="balance.daysSinceOldest">
                  ({{ balance.daysSinceOldest }} {{ t('common.days') }})
                </span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm">
                <span class="text-gray-500">{{ t('payments.outstanding') }}:</span>
                <span class="ml-1 text-orange-600">{{ formatCurrency(balance.totalOutstandingAmount) }}</span>
              </div>
              <div class="text-sm">
                <span class="text-gray-500">{{ t('payments.unallocated') }}:</span>
                <span class="ml-1 text-green-600">{{ formatCurrency(balance.totalUnallocatedAmount) }}</span>
              </div>
              <div class="text-sm font-semibold">
                <span class="text-gray-500">{{ t('payments.netBalance') }}:</span>
                <span class="ml-1" :class="balance.netBalance >= 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'">
                  {{ formatCurrency(balance.netBalance) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
