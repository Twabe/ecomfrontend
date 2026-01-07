/**
 * COD Reports Service
 *
 * Service for COD (Cash on Delivery) reconciliation and tracking
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  paymentsGetCompanyBalanceSummary,
  paymentsGetOutstandingCodReport,
} from '~/api/generated/endpoints/payments/payments'
import type {
  CompanyBalanceSummaryDto,
  OutstandingCodDto,
} from '~/api/generated/models'

export interface CodReportsParams {
  startDate: string
  endDate: string
}

export interface CodKpiData {
  totalOutstanding: number
  totalReceived: number
  totalUnallocated: number
  netBalance: number
}

export interface CompanyBalanceData {
  deliveryCompanyId: string
  deliveryCompanyName: string
  outstandingOrdersCount: number
  totalOutstandingAmount: number
  oldestOutstandingDate: string | null
  daysSinceOldest: number
  totalPaymentsCount: number
  totalPaymentsReceived: number
  unallocatedAmount: number
  netBalance: number
}

export interface OutstandingOrderData {
  orderId: string
  orderCode: string
  customerName: string
  phone: string
  price: number
  deliveryCompanyName: string
  dateValidated: string | null
  codPaymentStatus: string
  daysOutstanding: number
}

export function useCodReportsService(params: Ref<CodReportsParams>) {
  const queryClient = useQueryClient()

  // Query key for company balance
  const balanceQueryKey = computed(() => [
    'cod-reports',
    'balance',
    params.value.startDate,
    params.value.endDate,
  ] as const)

  // Query key for outstanding COD
  const outstandingQueryKey = computed(() => [
    'cod-reports',
    'outstanding',
    params.value.startDate,
    params.value.endDate,
  ] as const)

  // Company balance summary query
  const balanceQuery = useQuery({
    queryKey: balanceQueryKey,
    queryFn: () => paymentsGetCompanyBalanceSummary({
      startDate: params.value.startDate,
      endDate: params.value.endDate,
    }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // Outstanding COD query
  const outstandingQuery = useQuery({
    queryKey: outstandingQueryKey,
    queryFn: () => paymentsGetOutstandingCodReport({
      startDate: params.value.startDate,
      endDate: params.value.endDate,
      pageNumber: 1,
      pageSize: 100,
    }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // Raw data
  const rawBalanceData = computed<CompanyBalanceSummaryDto[]>(() =>
    balanceQuery.data.value ?? []
  )

  const rawOutstandingData = computed<OutstandingCodDto[]>(() =>
    outstandingQuery.data.value?.data ?? []
  )

  // KPI Data (aggregated)
  const kpiData = computed<CodKpiData>(() => {
    const data = rawBalanceData.value
    if (!data || data.length === 0) {
      return {
        totalOutstanding: 0,
        totalReceived: 0,
        totalUnallocated: 0,
        netBalance: 0,
      }
    }

    const totals = data.reduce(
      (acc, company) => ({
        totalOutstanding: acc.totalOutstanding + (company.totalOutstandingAmount ?? 0),
        totalReceived: acc.totalReceived + (company.totalPaymentsReceived ?? 0),
        totalUnallocated: acc.totalUnallocated + (company.unallocatedAmount ?? 0),
        netBalance: acc.netBalance + (company.netBalance ?? 0),
      }),
      { totalOutstanding: 0, totalReceived: 0, totalUnallocated: 0, netBalance: 0 }
    )

    return totals
  })

  // Processed company balance data
  const companyBalanceData = computed<CompanyBalanceData[]>(() => {
    return rawBalanceData.value.map((company: CompanyBalanceSummaryDto) => ({
      deliveryCompanyId: company.deliveryCompanyId ?? '',
      deliveryCompanyName: company.deliveryCompanyName ?? '',
      outstandingOrdersCount: company.outstandingOrdersCount ?? 0,
      totalOutstandingAmount: company.totalOutstandingAmount ?? 0,
      oldestOutstandingDate: company.oldestOutstandingDate ?? null,
      daysSinceOldest: company.daysSinceOldest ?? 0,
      totalPaymentsCount: company.totalPaymentsCount ?? 0,
      totalPaymentsReceived: company.totalPaymentsReceived ?? 0,
      unallocatedAmount: company.unallocatedAmount ?? 0,
      netBalance: company.netBalance ?? 0,
    }))
  })

  // Processed outstanding orders data
  const outstandingOrdersData = computed<OutstandingOrderData[]>(() => {
    return rawOutstandingData.value.map((order: OutstandingCodDto) => ({
      orderId: order.orderId ?? '',
      orderCode: order.orderCode ?? '',
      customerName: order.customerName ?? '',
      phone: order.phone ?? '',
      price: order.price ?? 0,
      deliveryCompanyName: order.deliveryCompanyName ?? '',
      dateValidated: order.dateValidated ?? null,
      codPaymentStatus: order.codPaymentStatus ?? '',
      daysOutstanding: order.daysOutstanding ?? 0,
    }))
  })

  // Chart data for company balance (horizontal bar)
  const balanceChartData = computed(() => {
    const data = companyBalanceData.value
    return {
      companies: data.map(d => d.deliveryCompanyName),
      outstanding: data.map(d => d.totalOutstandingAmount),
      received: data.map(d => d.totalPaymentsReceived),
      unallocated: data.map(d => d.unallocatedAmount),
    }
  })

  // Chart data for aging (bar chart by days)
  const agingChartData = computed(() => {
    const data = companyBalanceData.value
    // Group by days buckets: 0-7, 8-14, 15-30, 30+
    const aging = {
      '0-7': 0,
      '8-14': 0,
      '15-30': 0,
      '30+': 0,
    }

    data.forEach(company => {
      const days = company.daysSinceOldest
      if (days <= 7) aging['0-7'] += company.totalOutstandingAmount
      else if (days <= 14) aging['8-14'] += company.totalOutstandingAmount
      else if (days <= 30) aging['15-30'] += company.totalOutstandingAmount
      else aging['30+'] += company.totalOutstandingAmount
    })

    return {
      labels: Object.keys(aging),
      values: Object.values(aging),
    }
  })

  // Loading state
  const isLoading = computed(() => balanceQuery.isLoading.value || outstandingQuery.isLoading.value)
  const isFetching = computed(() => balanceQuery.isFetching.value || outstandingQuery.isFetching.value)

  // Actions
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['cod-reports'] })
  }

  const refetch = () => {
    balanceQuery.refetch()
    outstandingQuery.refetch()
  }

  return {
    // Raw data
    rawBalanceData,
    rawOutstandingData,

    // Processed data
    kpiData,
    companyBalanceData,
    outstandingOrdersData,
    balanceChartData,
    agingChartData,

    // State
    isLoading,
    isFetching,

    // Actions
    invalidate,
    refetch,
  }
}

// Re-export types
export type { CompanyBalanceSummaryDto, OutstandingCodDto }
