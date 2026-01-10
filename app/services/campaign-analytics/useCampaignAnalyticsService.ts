/**
 * Campaign Analytics Service
 *
 * Service for UTM campaign performance analytics with real COD metrics:
 * - Confirmation Rate: Did customer confirm the order?
 * - Delivery Rate: Was the order successfully delivered?
 * - Return Rate: Did the customer return the product?
 * - Revenue: From delivered orders only (TRUE revenue)
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { customInstance } from '~/api/axios-instance'

// ============================================================================
// Types (matching backend DTOs)
// ============================================================================

export interface CampaignStatsDto {
  summary: CampaignSummaryDto
  campaigns: CampaignPerformanceDto[]
  sources: SourcePerformanceDto[]
  contents: ContentPerformanceDto[]
  funnel: FunnelDto
  dailyTrend: DailyTrendDto[]
}

export interface CampaignSummaryDto {
  totalOrders: number
  trackedOrders: number
  trackingCoverage: number
  uniqueCampaigns: number
  uniqueSources: number
  totalRevenue: number
  overallConfirmationRate: number
  overallDeliveryRate: number
  overallReturnRate: number
  // CAC & ROAS
  totalAdSpend: number
  newCustomers: number
  cac: number
  roas: number
}

export interface CampaignPerformanceDto {
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

export interface SourcePerformanceDto {
  source: string
  totalOrders: number
  confirmedOrders: number
  deliveredOrders: number
  returnedOrders: number
  confirmationRate: number
  deliveryRate: number
  returnRate: number
  revenue: number
}

export interface DailyTrendDto {
  date: string
  orders: number
  confirmed: number
  delivered: number
  returned: number
  revenue: number
}

export interface ContentPerformanceDto {
  content: string
  source: string | null
  totalOrders: number
  confirmedOrders: number
  deliveredOrders: number
  returnedOrders: number
  confirmationRate: number
  deliveryRate: number
  returnRate: number
  revenue: number
}

export interface FunnelDto {
  totalOrders: number
  confirmedOrders: number
  deliveredOrders: number
  successfulOrders: number
  confirmationDropOff: number
  deliveryDropOff: number
  returnDropOff: number
  overallSuccessRate: number
}

export interface GetCampaignStatsRequest {
  startDate?: string | null
  endDate?: string | null
  utmSource?: string | null
  utmCampaign?: string | null
  storeId?: string | null
}

// ============================================================================
// Service Parameters
// ============================================================================

export interface CampaignAnalyticsParams {
  startDate: string
  endDate: string
  source?: string | null
  campaign?: string | null
  storeId?: string | null
}

// ============================================================================
// Rate Level Helpers
// ============================================================================

export type RateLevel = 'excellent' | 'good' | 'average' | 'poor'

/**
 * Get level for confirmation rate
 * Morocco avg: 60-80%
 */
export function getConfirmationRateLevel(rate: number): RateLevel {
  if (rate >= 80) return 'excellent'
  if (rate >= 70) return 'good'
  if (rate >= 60) return 'average'
  return 'poor'
}

/**
 * Get level for delivery rate
 * Target: 85%+
 */
export function getDeliveryRateLevel(rate: number): RateLevel {
  if (rate >= 90) return 'excellent'
  if (rate >= 80) return 'good'
  if (rate >= 70) return 'average'
  return 'poor'
}

/**
 * Get level for return rate (lower is better)
 * Target: <10%
 */
export function getReturnRateLevel(rate: number): RateLevel {
  if (rate <= 5) return 'excellent'
  if (rate <= 10) return 'good'
  if (rate <= 20) return 'average'
  return 'poor'
}

/**
 * Get Tailwind color class for rate
 */
export function getRateColor(rate: number, type: 'confirmation' | 'delivery' | 'return'): string {
  let level: RateLevel

  if (type === 'return') {
    level = getReturnRateLevel(rate)
  } else if (type === 'confirmation') {
    level = getConfirmationRateLevel(rate)
  } else {
    level = getDeliveryRateLevel(rate)
  }

  switch (level) {
    case 'excellent': return 'text-green-600 dark:text-green-400'
    case 'good': return 'text-green-500 dark:text-green-500'
    case 'average': return 'text-yellow-500 dark:text-yellow-400'
    case 'poor': return 'text-red-500 dark:text-red-400'
  }
}

/**
 * Get Tailwind background color class for rate
 */
export function getRateBgColor(rate: number, type: 'confirmation' | 'delivery' | 'return'): string {
  let level: RateLevel

  if (type === 'return') {
    level = getReturnRateLevel(rate)
  } else if (type === 'confirmation') {
    level = getConfirmationRateLevel(rate)
  } else {
    level = getDeliveryRateLevel(rate)
  }

  switch (level) {
    case 'excellent': return 'bg-green-600'
    case 'good': return 'bg-green-500'
    case 'average': return 'bg-yellow-500'
    case 'poor': return 'bg-red-500'
  }
}

// ============================================================================
// API Functions
// ============================================================================

const getCampaignStats = (request: GetCampaignStatsRequest): Promise<CampaignStatsDto> => {
  return customInstance<CampaignStatsDto>({
    url: '/api/v1/campaignanalytics/stats',
    method: 'POST',
    data: request,
  })
}

const getUtmSources = (): Promise<string[]> => {
  return customInstance<string[]>({
    url: '/api/v1/campaignanalytics/sources',
    method: 'GET',
  })
}

const getUtmCampaigns = (source?: string): Promise<string[]> => {
  return customInstance<string[]>({
    url: '/api/v1/campaignanalytics/campaigns',
    method: 'GET',
    params: source ? { utmSource: source } : undefined,
  })
}

// ============================================================================
// Main Service Hook
// ============================================================================

export function useCampaignAnalyticsService(params: Ref<CampaignAnalyticsParams>) {
  const queryClient = useQueryClient()

  // Query key based on filters
  const queryKey = computed(() => [
    'campaign-analytics',
    'stats',
    params.value.startDate,
    params.value.endDate,
    params.value.source,
    params.value.campaign,
    params.value.storeId,
  ] as const)

  // Main stats query
  const statsQuery = useQuery({
    queryKey,
    queryFn: () => getCampaignStats({
      startDate: params.value.startDate,
      endDate: params.value.endDate,
      utmSource: params.value.source || null,
      utmCampaign: params.value.campaign || null,
      storeId: params.value.storeId || null,
    }),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })

  // Raw data
  const rawData = computed<CampaignStatsDto | undefined>(() => statsQuery.data.value)

  // Summary data
  const summary = computed<CampaignSummaryDto>(() => {
    const data = rawData.value?.summary
    if (!data) {
      return {
        totalOrders: 0,
        trackedOrders: 0,
        trackingCoverage: 0,
        uniqueCampaigns: 0,
        uniqueSources: 0,
        totalRevenue: 0,
        overallConfirmationRate: 0,
        overallDeliveryRate: 0,
        overallReturnRate: 0,
        totalAdSpend: 0,
        newCustomers: 0,
        cac: 0,
        roas: 0,
      }
    }
    return data
  })

  // Campaign performance data
  const campaigns = computed<CampaignPerformanceDto[]>(() => {
    return rawData.value?.campaigns ?? []
  })

  // Source performance data
  const sources = computed<SourcePerformanceDto[]>(() => {
    return rawData.value?.sources ?? []
  })

  // Daily trend data
  const dailyTrend = computed<DailyTrendDto[]>(() => {
    return rawData.value?.dailyTrend ?? []
  })

  // Content performance data (utm_content)
  const contents = computed<ContentPerformanceDto[]>(() => {
    return rawData.value?.contents ?? []
  })

  // Funnel data
  const funnel = computed<FunnelDto>(() => {
    return rawData.value?.funnel ?? {
      totalOrders: 0,
      confirmedOrders: 0,
      deliveredOrders: 0,
      successfulOrders: 0,
      confirmationDropOff: 0,
      deliveryDropOff: 0,
      returnDropOff: 0,
      overallSuccessRate: 0,
    }
  })

  // Chart data for daily trend (line chart)
  const trendChartData = computed(() => {
    const data = dailyTrend.value
    return {
      labels: data.map(d => d.date),
      orders: data.map(d => d.orders),
      confirmed: data.map(d => d.confirmed),
      delivered: data.map(d => d.delivered),
      revenue: data.map(d => d.revenue),
    }
  })

  // Chart data for sources (donut/pie chart)
  const sourceChartData = computed(() => {
    const data = sources.value
    return {
      labels: data.map(s => s.source),
      orders: data.map(s => s.totalOrders),
      revenue: data.map(s => s.revenue),
    }
  })

  // Top campaigns by revenue
  const topCampaignsByRevenue = computed(() => {
    return [...campaigns.value]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  })

  // Top campaigns by confirmation rate (min 10 orders)
  const topCampaignsByConfirmation = computed(() => {
    return [...campaigns.value]
      .filter(c => c.totalOrders >= 10)
      .sort((a, b) => b.confirmationRate - a.confirmationRate)
      .slice(0, 10)
  })

  // Loading state
  const isLoading = computed(() => statsQuery.isLoading.value)
  const isFetching = computed(() => statsQuery.isFetching.value)
  const error = computed(() => statsQuery.error.value)

  // Actions
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['campaign-analytics'] })
  }

  const refetch = () => statsQuery.refetch()

  return {
    // Raw data
    rawData,

    // Processed data
    summary,
    campaigns,
    sources,
    contents,
    funnel,
    dailyTrend,

    // Chart data
    trendChartData,
    sourceChartData,

    // Derived data
    topCampaignsByRevenue,
    topCampaignsByConfirmation,

    // State
    isLoading,
    isFetching,
    error,

    // Actions
    invalidate,
    refetch,
  }
}

// ============================================================================
// Filter Options Hook (for dropdowns)
// ============================================================================

export function useCampaignFilters() {
  const queryClient = useQueryClient()

  // Sources query
  const sourcesQuery = useQuery({
    queryKey: ['campaign-analytics', 'sources'],
    queryFn: getUtmSources,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Campaigns query (reactive to selected source)
  const selectedSource = ref<string | null>(null)

  const campaignsQueryKey = computed(() => [
    'campaign-analytics',
    'campaigns',
    selectedSource.value,
  ] as const)

  const campaignsQuery = useQuery({
    queryKey: campaignsQueryKey,
    queryFn: () => getUtmCampaigns(selectedSource.value || undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    // Source options
    sourceOptions: computed(() => sourcesQuery.data.value ?? []),
    isLoadingSources: computed(() => sourcesQuery.isLoading.value),

    // Campaign options (filtered by source)
    campaignOptions: computed(() => campaignsQuery.data.value ?? []),
    isLoadingCampaigns: computed(() => campaignsQuery.isLoading.value),

    // Selected source (set this to filter campaigns)
    selectedSource,

    // Actions
    refetchFilters: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics', 'sources'] })
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics', 'campaigns'] })
    },
  }
}

// Re-export types
export type {
  CampaignStatsDto as CampaignStats,
  CampaignPerformanceDto as CampaignPerformance,
  SourcePerformanceDto as SourcePerformance,
  DailyTrendDto as DailyTrend,
}
