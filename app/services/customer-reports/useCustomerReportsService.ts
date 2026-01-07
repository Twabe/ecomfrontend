/**
 * Customer Reports Service
 *
 * Service for analyzing customer behavior, value, and purchase patterns
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  customersSearch,
  customersGetHighValue,
  customersGetProblematic,
} from '~/api/generated/endpoints/customers/customers'
import type { CustomerDto } from '~/api/generated/models'

export interface CustomerReportsParams {
  pageSize?: number
}

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

export function useCustomerReportsService(params?: Ref<CustomerReportsParams>) {
  const queryClient = useQueryClient()
  const pageSize = computed(() => params?.value?.pageSize ?? 100)

  // Query key for all customers
  const allCustomersQueryKey = computed(() => [
    'customer-reports',
    'all',
    pageSize.value,
  ] as const)

  // Query key for high value customers
  const highValueQueryKey = computed(() => [
    'customer-reports',
    'high-value',
    pageSize.value,
  ] as const)

  // Query key for problematic customers
  const problematicQueryKey = computed(() => [
    'customer-reports',
    'problematic',
    pageSize.value,
  ] as const)

  // Query key for blacklisted customers
  const blacklistedQueryKey = computed(() => [
    'customer-reports',
    'blacklisted',
    pageSize.value,
  ] as const)

  // All customers query
  const allCustomersQuery = useQuery({
    queryKey: allCustomersQueryKey,
    queryFn: () => customersSearch({
      pageNumber: 1,
      pageSize: pageSize.value,
    }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // High value customers query
  const highValueQuery = useQuery({
    queryKey: highValueQueryKey,
    queryFn: () => customersGetHighValue({
      pageNumber: 1,
      pageSize: 10,
    }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // Problematic customers query
  const problematicQuery = useQuery({
    queryKey: problematicQueryKey,
    queryFn: () => customersGetProblematic({
      pageNumber: 1,
      pageSize: 10,
    }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // Blacklisted customers query
  const blacklistedQuery = useQuery({
    queryKey: blacklistedQueryKey,
    queryFn: () => customersSearch({
      pageNumber: 1,
      pageSize: 50,
      isBlacklisted: true,
    }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // Raw data
  const rawAllCustomers = computed<CustomerDto[]>(() =>
    allCustomersQuery.data.value?.data ?? []
  )

  const rawHighValueCustomers = computed<CustomerDto[]>(() =>
    highValueQuery.data.value?.data ?? []
  )

  const rawProblematicCustomers = computed<CustomerDto[]>(() =>
    problematicQuery.data.value?.data ?? []
  )

  const rawBlacklistedCustomers = computed<CustomerDto[]>(() =>
    blacklistedQuery.data.value?.data ?? []
  )

  // Helper to calculate delivery rate
  const calculateDeliveryRate = (customer: CustomerDto): number => {
    const total = (customer.deliveredOrders ?? 0) + (customer.returnedOrders ?? 0)
    if (total === 0) return 0
    return ((customer.deliveredOrders ?? 0) / total) * 100
  }

  // Transform customer data
  const transformCustomer = (customer: CustomerDto): CustomerData => ({
    id: customer.id ?? '',
    fullName: customer.fullName ?? '',
    phone: customer.phone ?? '',
    email: customer.email ?? undefined,
    cityName: customer.defaultCityName ?? undefined,
    totalOrders: customer.totalOrders ?? 0,
    totalSpent: customer.totalSpent ?? 0,
    deliveredOrders: customer.deliveredOrders ?? 0,
    cancelledOrders: customer.cancelledOrders ?? 0,
    returnedOrders: customer.returnedOrders ?? 0,
    cancellationRate: customer.cancellationRate ?? 0,
    returnRate: customer.returnRate ?? 0,
    deliveryRate: calculateDeliveryRate(customer),
    isHighValue: customer.isHighValue ?? false,
    isProblematic: customer.isProblematic ?? false,
    isBlacklisted: customer.isBlacklisted ?? false,
    blacklistReason: customer.blacklistReason ?? undefined,
    lastOrderDate: customer.lastOrderDate ?? undefined,
    firstOrderDate: customer.firstOrderDate ?? undefined,
  })

  // KPI Data
  const kpiData = computed<CustomerKpiData>(() => {
    const customers = rawAllCustomers.value

    if (!customers || customers.length === 0) {
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

    const totalCustomers = allCustomersQuery.data.value?.totalCount ?? customers.length
    const vipCustomers = customers.filter(c => c.isHighValue).length
    const problematicCustomers = customers.filter(c => c.isProblematic).length
    const blacklistedCustomers = customers.filter(c => c.isBlacklisted).length

    const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent ?? 0), 0)
    const totalOrders = customers.reduce((sum, c) => sum + (c.totalOrders ?? 0), 0)
    const totalDelivered = customers.reduce((sum, c) => sum + (c.deliveredOrders ?? 0), 0)
    const totalCancelled = customers.reduce((sum, c) => sum + (c.cancelledOrders ?? 0), 0)
    const totalReturned = customers.reduce((sum, c) => sum + (c.returnedOrders ?? 0), 0)

    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
    const completedOrders = totalDelivered + totalReturned
    const overallDeliveryRate = completedOrders > 0 ? (totalDelivered / completedOrders) * 100 : 0
    const overallCancellationRate = totalOrders > 0 ? (totalCancelled / totalOrders) * 100 : 0

    return {
      totalCustomers,
      vipCustomers,
      problematicCustomers,
      blacklistedCustomers,
      averageOrderValue,
      totalRevenue: totalSpent,
      overallDeliveryRate,
      overallCancellationRate,
    }
  })

  // Processed customer lists
  const topCustomers = computed<CustomerData[]>(() =>
    rawHighValueCustomers.value.map(transformCustomer)
  )

  const problematicCustomers = computed<CustomerData[]>(() =>
    rawProblematicCustomers.value.map(transformCustomer)
  )

  const blacklistedCustomers = computed<CustomerData[]>(() =>
    rawBlacklistedCustomers.value.map(transformCustomer)
  )

  // Chart data for customer distribution (donut)
  const distributionChartData = computed(() => {
    const kpi = kpiData.value
    const regular = kpi.totalCustomers - kpi.vipCustomers - kpi.problematicCustomers - kpi.blacklistedCustomers

    return {
      labels: ['VIP', 'Regular', 'Problematic', 'Blacklisted'],
      values: [
        kpi.vipCustomers,
        Math.max(0, regular),
        kpi.problematicCustomers,
        kpi.blacklistedCustomers,
      ],
    }
  })

  // Chart data for behavior comparison (bar)
  const behaviorChartData = computed(() => {
    const vipCustomers = rawAllCustomers.value.filter(c => c.isHighValue)
    const regularCustomers = rawAllCustomers.value.filter(c => !c.isHighValue && !c.isProblematic && !c.isBlacklisted)
    const problematic = rawAllCustomers.value.filter(c => c.isProblematic)

    const calculateAverageDeliveryRate = (customers: CustomerDto[]) => {
      if (customers.length === 0) return 0
      const totalDelivered = customers.reduce((sum, c) => sum + (c.deliveredOrders ?? 0), 0)
      const totalCompleted = customers.reduce((sum, c) => sum + (c.deliveredOrders ?? 0) + (c.returnedOrders ?? 0), 0)
      return totalCompleted > 0 ? (totalDelivered / totalCompleted) * 100 : 0
    }

    const calculateAverageCancellationRate = (customers: CustomerDto[]) => {
      if (customers.length === 0) return 0
      const totalCancelled = customers.reduce((sum, c) => sum + (c.cancelledOrders ?? 0), 0)
      const totalOrders = customers.reduce((sum, c) => sum + (c.totalOrders ?? 0), 0)
      return totalOrders > 0 ? (totalCancelled / totalOrders) * 100 : 0
    }

    return {
      categories: ['VIP', 'Regular', 'Problematic'],
      deliveryRates: [
        calculateAverageDeliveryRate(vipCustomers),
        calculateAverageDeliveryRate(regularCustomers),
        calculateAverageDeliveryRate(problematic),
      ],
      cancellationRates: [
        calculateAverageCancellationRate(vipCustomers),
        calculateAverageCancellationRate(regularCustomers),
        calculateAverageCancellationRate(problematic),
      ],
    }
  })

  // Loading state
  const isLoading = computed(() =>
    allCustomersQuery.isLoading.value ||
    highValueQuery.isLoading.value ||
    problematicQuery.isLoading.value ||
    blacklistedQuery.isLoading.value
  )

  const isFetching = computed(() =>
    allCustomersQuery.isFetching.value ||
    highValueQuery.isFetching.value ||
    problematicQuery.isFetching.value ||
    blacklistedQuery.isFetching.value
  )

  // Actions
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['customer-reports'] })
  }

  const refetch = () => {
    allCustomersQuery.refetch()
    highValueQuery.refetch()
    problematicQuery.refetch()
    blacklistedQuery.refetch()
  }

  return {
    // Raw data
    rawAllCustomers,
    rawHighValueCustomers,
    rawProblematicCustomers,
    rawBlacklistedCustomers,

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
