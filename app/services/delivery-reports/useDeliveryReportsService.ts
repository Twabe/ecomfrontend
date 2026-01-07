/**
 * Delivery Reports Service
 *
 * Service for analyzing delivery company performance
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { dashboardGetOverview } from '~/api/generated/endpoints/dashboard/dashboard'
import type { DeliveryCompanyPerformanceDto } from '~/api/generated/models'

export interface DeliveryReportsParams {
  startDate: string
  endDate: string
}

export interface DeliveryKpiData {
  totalOrders: number
  deliveryRate: number
  returnRate: number
  cancelRate: number
}

export interface DeliveryCompanyData {
  deliveryCompanyId: string
  deliveryCompanyName: string
  totalOrders: number
  deliveredOrders: number
  returnedOrders: number
  cancelledOrders: number
  deliveryRate: number
  returnRate: number
  cancelRate: number
  totalRevenue: number
}

export function useDeliveryReportsService(params: Ref<DeliveryReportsParams>) {
  const queryClient = useQueryClient()

  // Query key based on date range
  const queryKey = computed(() => [
    'delivery-reports',
    params.value.startDate,
    params.value.endDate,
  ] as const)

  // Data query using dashboard overview endpoint
  const dataQuery = useQuery({
    queryKey,
    queryFn: () => dashboardGetOverview({
      startDate: params.value.startDate,
      endDate: params.value.endDate,
    }),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })

  // Raw delivery company performance data
  const rawData = computed<DeliveryCompanyPerformanceDto[]>(() =>
    dataQuery.data.value?.deliveryCompanyPerformance ?? []
  )

  // KPI Data (aggregated across all companies)
  const kpiData = computed<DeliveryKpiData>(() => {
    const data = rawData.value
    if (!data || data.length === 0) {
      return {
        totalOrders: 0,
        deliveryRate: 0,
        returnRate: 0,
        cancelRate: 0,
      }
    }

    const totals = data.reduce(
      (acc, company) => ({
        totalOrders: acc.totalOrders + (company.totalOrders ?? 0),
        delivered: acc.delivered + (company.deliveredOrders ?? 0),
        returned: acc.returned + (company.returnedOrders ?? 0),
        cancelled: acc.cancelled + (company.cancelledOrders ?? 0),
      }),
      { totalOrders: 0, delivered: 0, returned: 0, cancelled: 0 }
    )

    const deliveryRate = totals.totalOrders > 0
      ? (totals.delivered / totals.totalOrders) * 100
      : 0
    const returnRate = totals.totalOrders > 0
      ? (totals.returned / totals.totalOrders) * 100
      : 0
    const cancelRate = totals.totalOrders > 0
      ? (totals.cancelled / totals.totalOrders) * 100
      : 0

    return {
      totalOrders: totals.totalOrders,
      deliveryRate,
      returnRate,
      cancelRate,
    }
  })

  // Processed company data
  const companyData = computed<DeliveryCompanyData[]>(() => {
    return rawData.value.map((company: DeliveryCompanyPerformanceDto) => ({
      deliveryCompanyId: company.deliveryCompanyId ?? '',
      deliveryCompanyName: company.deliveryCompanyName ?? '',
      totalOrders: company.totalOrders ?? 0,
      deliveredOrders: company.deliveredOrders ?? 0,
      returnedOrders: company.returnedOrders ?? 0,
      cancelledOrders: company.cancelledOrders ?? 0,
      deliveryRate: company.deliveryRate ?? 0,
      returnRate: company.returnRate ?? 0,
      cancelRate: company.cancelRate ?? 0,
      totalRevenue: company.totalRevenue ?? 0,
    }))
  })

  // Chart data for company performance (bar chart)
  const performanceChartData = computed(() => {
    const data = companyData.value
    return {
      companies: data.map(d => d.deliveryCompanyName),
      deliveryRates: data.map(d => d.deliveryRate),
      returnRates: data.map(d => d.returnRate),
      cancelRates: data.map(d => d.cancelRate),
    }
  })

  // Chart data for order distribution (donut chart)
  const distributionChartData = computed(() => {
    const data = companyData.value
    return {
      labels: data.map(d => d.deliveryCompanyName),
      values: data.map(d => d.totalOrders),
    }
  })

  // Loading state
  const isLoading = computed(() => dataQuery.isLoading.value)
  const isFetching = computed(() => dataQuery.isFetching.value)

  // Actions
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['delivery-reports'] })
  }

  const refetch = () => dataQuery.refetch()

  return {
    // Raw data
    rawData,

    // Processed data
    kpiData,
    companyData,
    performanceChartData,
    distributionChartData,

    // State
    isLoading,
    isFetching,

    // Actions
    invalidate,
    refetch,
  }
}

// Re-export type
export type { DeliveryCompanyPerformanceDto }
