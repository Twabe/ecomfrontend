<script setup lang="ts">
import { getRateColor } from '~/services/campaign-analytics/useCampaignAnalyticsService'

interface CampaignPerformance {
  source: string | null
  campaign: string | null
  medium: string | null
  totalOrders: number
  confirmedOrders: number
  deliveredOrders: number
  returnedOrders: number
  cancelledOrders: number
  confirmationRate: number
  deliveryRate: number
  returnRate: number
  revenue: number
  averageOrderValue: number
}

const props = defineProps<{
  campaign: CampaignPerformance
}>()

const { t } = useI18n()

// Currency formatter
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val) + ' DH'
}

// Rate formatter
const formatRate = (val: number) => {
  return val.toFixed(0) + '%'
}

// Get rate badge classes
const getRateBadgeClasses = (rate: number, type: 'confirmation' | 'delivery' | 'return') => {
  if (type === 'return') {
    if (rate <= 5) return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
    if (rate <= 10) return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    if (rate <= 20) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
    return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
  }

  const thresholds = type === 'confirmation' ? [80, 70, 60] : [90, 80, 70]

  if (rate >= thresholds[0]) return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
  if (rate >= thresholds[1]) return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (rate >= thresholds[2]) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
  return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
}

// Source icon/color
const getSourceInfo = (source: string | null) => {
  switch (source?.toLowerCase()) {
    case 'facebook':
      return { color: 'bg-blue-600', icon: 'i-lucide-facebook' }
    case 'tiktok':
      return { color: 'bg-black dark:bg-gray-700', icon: 'i-lucide-music-2' }
    case 'google':
      return { color: 'bg-red-500', icon: 'i-lucide-search' }
    case 'instagram':
      return { color: 'bg-pink-500', icon: 'i-lucide-instagram' }
    case 'snapchat':
      return { color: 'bg-yellow-400', icon: 'i-lucide-ghost' }
    default:
      return { color: 'bg-gray-500', icon: 'i-lucide-globe' }
  }
}

const sourceInfo = computed(() => getSourceInfo(props.campaign.source))
</script>

<template>
  <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
    <!-- Header: Source & Campaign Name -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div
          :class="[sourceInfo.color, 'flex h-10 w-10 items-center justify-center rounded-full text-white']"
        >
          <span :class="[sourceInfo.icon, 'h-5 w-5']" />
        </div>
        <div>
          <span class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            {{ campaign.source || t('campaigns.unknownSource') }}
          </span>
          <h3 class="font-semibold text-gray-900 dark:text-white line-clamp-1">
            {{ campaign.campaign || t('campaigns.unknownCampaign') }}
          </h3>
          <span v-if="campaign.medium" class="text-xs text-gray-500 dark:text-gray-400">
            {{ campaign.medium }}
          </span>
        </div>
      </div>
      <div class="text-right">
        <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
          {{ campaign.totalOrders }}
        </span>
        <div class="text-xs text-gray-500 dark:text-gray-400">
          {{ t('campaigns.orders') }}
        </div>
      </div>
    </div>

    <!-- Rates Grid -->
    <div class="mt-4 grid grid-cols-3 gap-2 text-center">
      <!-- Confirmation Rate -->
      <div class="rounded-lg bg-gray-50 p-2 dark:bg-gray-700/50">
        <div class="text-xs text-gray-500 dark:text-gray-400">
          {{ t('campaigns.confirmed') }}
        </div>
        <span
          :class="['mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', getRateBadgeClasses(campaign.confirmationRate, 'confirmation')]"
        >
          {{ formatRate(campaign.confirmationRate) }}
        </span>
      </div>

      <!-- Delivery Rate -->
      <div class="rounded-lg bg-gray-50 p-2 dark:bg-gray-700/50">
        <div class="text-xs text-gray-500 dark:text-gray-400">
          {{ t('campaigns.delivered') }}
        </div>
        <span
          :class="['mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', getRateBadgeClasses(campaign.deliveryRate, 'delivery')]"
        >
          {{ formatRate(campaign.deliveryRate) }}
        </span>
      </div>

      <!-- Return Rate -->
      <div class="rounded-lg bg-gray-50 p-2 dark:bg-gray-700/50">
        <div class="text-xs text-gray-500 dark:text-gray-400">
          {{ t('campaigns.returned') }}
        </div>
        <span
          :class="['mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', getRateBadgeClasses(campaign.returnRate, 'return')]"
        >
          {{ formatRate(campaign.returnRate) }}
        </span>
      </div>
    </div>

    <!-- Order Breakdown -->
    <div class="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
      <div class="flex gap-3">
        <span>{{ campaign.confirmedOrders }} confirmed</span>
        <span>{{ campaign.deliveredOrders }} delivered</span>
        <span>{{ campaign.returnedOrders }} returned</span>
      </div>
    </div>

    <!-- Revenue & AOV -->
    <div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
      <div>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ t('campaigns.revenue') }}</span>
        <div class="font-semibold text-green-600 dark:text-green-400">
          {{ formatCurrency(campaign.revenue) }}
        </div>
      </div>
      <div class="text-right">
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ t('campaigns.aov') }}</span>
        <div class="font-semibold text-gray-900 dark:text-white">
          {{ formatCurrency(campaign.averageOrderValue) }}
        </div>
      </div>
    </div>
  </div>
</template>
