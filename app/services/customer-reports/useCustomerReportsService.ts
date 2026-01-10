/**
 * Customer Reports Service
 *
 * Service for analyzing customer behavior, value, and purchase patterns.
 * Uses the new CustomerReports endpoint that calculates data from Orders,
 * so it works even without Customer records (e.g., webhook imports).
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { customInstance } from '~/api/axios-instance'

// Request type
export interface GetCustomerReportsRequest {
  startDate?: string
  endDate?: string
}

// Response types (matching backend DTOs)
export interface CustomerReportsDto {
  kpi: CustomerReportsKpiDto
  topCustomers: CustomerReportItemDto[]
  problematicCustomers: CustomerReportItemDto[]
  distribution: CustomerDistributionDto
  behavior: CustomerBehaviorDto
}

export interface CustomerReportsKpiDto {
  totalCustomers: number
  vipCustomers: number
  problematicCustomers: number
  averageOrderValue: number
  totalRevenue: number
  overallDeliveryRate: number
  overallCancellationRate: number
}

export interface CustomerReportItemDto {
  id: string
  fullName: string
  phone: string
  cityName?: string
  totalOrders: number
  totalSpent: number
  deliveredOrders: number
  cancelledOrders: number
  returnedOrders: number
  deliveryRate: number
  cancellationRate: number
  isVip: boolean
  isProblematic: boolean
  lastOrderDate?: string
  firstOrderDate?: string
}

export interface CustomerDistributionDto {
  vip: number
  regular: number
  problematic: number
}

export interface CustomerBehaviorDto {
  categories: string[]
  deliveryRates: number[]
  cancellationRates: number[]
}

// Legacy interface for backwards compatibility
export interface CustomerKpiData {
  totalCustomers: number
  vipCustomers: number
  problematicCustomers: number
  blacklistedCustomers: number
  averageOrderValue: number
  totalRevenue: number
  overallDeliveryRate: number
  overallCancellationRate: number
}

export interface CustomerData {
  id: string
  fullName: string
  phone: string
  email?: string
  cityName?: string
  totalOrders: number
  totalSpent: number
  deliveredOrders: number
  cancelledOrders: number
  returnedOrders: number
  cancellationRate: number
  returnRate: number
  deliveryRate: number
  isHighValue: boolean
  isProblematic: boolean
  isBlacklisted: boolean
  blacklistReason?: string
  lastOrderDate?: string
  firstOrderDate?: string
}

// API function to call the new endpoint
const getCustomerReports = (request: GetCustomerReportsRequest) => {
  return customInstance<CustomerReportsDto>({
    url: '/api/v1/customerreports/stats',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: request,
  })
}

export function useCustomerReportsService() {
  const queryClient = useQueryClient()

  // Query key
  const queryKey = computed(() => ['customer-reports', 'stats'] as const)

  // Main query - uses new endpoint that calculates from orders
  const statsQuery = useQuery({
    queryKey,
    queryFn: () => getCustomerReports({}),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // Raw data
  const rawData = computed(() => statsQuery.data.value)

  // Transform to legacy format for backwards compatibility
  const transformToCustomerData = (item: CustomerReportItemDto): CustomerData => ({
    id: item.id,
    fullName: item.fullName,
    phone: item.phone,
    cityName: item.cityName,
    totalOrders: item.totalOrders,
    totalSpent: item.totalSpent,
    deliveredOrders: item.deliveredOrders,
    cancelledOrders: item.cancelledOrders,
    returnedOrders: item.returnedOrders,
    cancellationRate: item.cancellationRate,
    returnRate: 0, // Not tracked in new API
    deliveryRate: item.deliveryRate,
    isHighValue: item.isVip,
    isProblematic: item.isProblematic,
    isBlacklisted: false, // Blacklist is separate feature
    lastOrderDate: item.lastOrderDate,
    firstOrderDate: item.firstOrderDate,
  })

  // KPI Data (legacy format)
  const kpiData = computed<CustomerKpiData>(() => {
    const data = rawData.value
    if (!data) {
      return {
        totalCustomers: 0,
        vipCustomers: 0,
        problematicCustomers: 0,
        blacklistedCustomers: 0,
        averageOrderValue: 0,
        totalRevenue: 0,
        overallDeliveryRate: 0,
        overallCancellationRate: 0,
      }
    }

    return {
      totalCustomers: data.kpi.totalCustomers,
      vipCustomers: data.kpi.vipCustomers,
      problematicCustomers: data.kpi.problematicCustomers,
      blacklistedCustomers: 0, // Blacklist is separate
      averageOrderValue: data.kpi.averageOrderValue,
      totalRevenue: data.kpi.totalRevenue,
      overallDeliveryRate: data.kpi.overallDeliveryRate,
      overallCancellationRate: data.kpi.overallCancellationRate,
    }
  })

  // Processed customer lists
  const topCustomers = computed<CustomerData[]>(() =>
    (rawData.value?.topCustomers ?? []).map(transformToCustomerData)
  )

  const problematicCustomers = computed<CustomerData[]>(() =>
    (rawData.value?.problematicCustomers ?? []).map(transformToCustomerData)
  )

  // Empty blacklisted - this is a separate feature that requires Customer records
  const blacklistedCustomers = computed<CustomerData[]>(() => [])

  // Chart data for customer distribution (donut)
  const distributionChartData = computed(() => {
    const dist = rawData.value?.distribution
    if (!dist) {
      return { labels: ['VIP', 'Regular', 'Problematic'], values: [0, 0, 0] }
    }

    return {
      labels: ['VIP', 'Regular', 'Problematic'],
      values: [dist.vip, dist.regular, dist.problematic],
    }
  })

  // Chart data for behavior comparison (bar)
  const behaviorChartData = computed(() => {
    const behavior = rawData.value?.behavior
    if (!behavior) {
      return {
        categories: ['VIP', 'Regular', 'Problematic'],
        deliveryRates: [0, 0, 0],
        cancellationRates: [0, 0, 0],
      }
    }

    return {
      categories: behavior.categories,
      deliveryRates: behavior.deliveryRates,
      cancellationRates: behavior.cancellationRates,
    }
  })

  // Loading state
  const isLoading = computed(() => statsQuery.isLoading.value)
  const isFetching = computed(() => statsQuery.isFetching.value)

  // Actions
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['customer-reports'] })
  }

  const refetch = () => statsQuery.refetch()

  return {
    // Raw data
    rawData,

    // Processed data
    kpiData,
    topCustomers,
    problematicCustomers,
    blacklistedCustomers,
    distributionChartData,
    behaviorChartData,

    // State
    isLoading,
    isFetching,

    // Actions
    invalidate,
    refetch,
  }
}
