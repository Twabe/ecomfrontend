/**
 * Financial Reports Service
 *
 * Service for analyzing financial performance including revenue, expenses, and profit
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { dashboardGetOverview } from '~/api/generated/endpoints/dashboard/dashboard'
import { expensesGetStats } from '~/api/generated/endpoints/expenses/expenses'
import type {
  DashboardStatsDto,
  ExpensesStatsDto,
  ExpenseByTypeDto,
  ExpenseByProductDto,
} from '~/api/generated/models'

export interface FinancialReportsParams {
  startDate: string
  endDate: string
}

export interface FinancialKpiData {
  totalRevenue: number
  totalCosts: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
}

export interface ExpenseByTypeData {
  type: string
  amount: number
  percentage: number
}

export interface ExpenseByProductData {
  productId: string
  productName: string
  amount: number
}

export interface ProfitLossData {
  revenue: number
  productCosts: number
  grossProfit: number
  adSpend: number
  otherExpenses: number
  netProfit: number
}

export function useFinancialReportsService(params: Ref<FinancialReportsParams>) {
  const queryClient = useQueryClient()

  // Query key for dashboard data
  const dashboardQueryKey = computed(() => [
    'financial-reports',
    'dashboard',
    params.value.startDate,
    params.value.endDate,
  ] as const)

  // Query key for expenses data
  const expensesQueryKey = computed(() => [
    'financial-reports',
    'expenses',
    params.value.startDate,
    params.value.endDate,
  ] as const)

  // Dashboard overview query (for revenue, profit, marketing)
  const dashboardQuery = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: () => dashboardGetOverview({
      startDate: params.value.startDate,
      endDate: params.value.endDate,
    }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // Expenses stats query
  const expensesQuery = useQuery({
    queryKey: expensesQueryKey,
    queryFn: () => expensesGetStats({
      startDate: params.value.startDate,
      endDate: params.value.endDate,
    }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // Raw data
  const rawDashboardData = computed<DashboardStatsDto | undefined>(() =>
    dashboardQuery.data.value
  )

  const rawExpensesData = computed<ExpensesStatsDto | undefined>(() =>
    expensesQuery.data.value
  )

  // KPI Data
  const kpiData = computed<FinancialKpiData>(() => {
    const dashboard = rawDashboardData.value
    const expenses = rawExpensesData.value

    if (!dashboard) {
      return {
        totalRevenue: 0,
        totalCosts: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
      }
    }

    const revenueStats = dashboard.revenueStats
    const marketingStats = dashboard.marketingStats

    const totalRevenue = revenueStats?.totalRevenue ?? 0
    const totalProfit = revenueStats?.totalProfit ?? 0 // Gross profit
    const totalCosts = totalRevenue - totalProfit // Cost of goods sold
    const adSpend = marketingStats?.totalAdSpend ?? 0
    const otherExpenses = expenses?.totalCost ?? 0
    const totalExpenses = adSpend + otherExpenses
    const netProfit = revenueStats?.totalNetProfit ?? (totalProfit - totalExpenses)
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    return {
      totalRevenue,
      totalCosts,
      totalExpenses,
      netProfit,
      profitMargin,
    }
  })

  // Expenses by type
  const expensesByType = computed<ExpenseByTypeData[]>(() => {
    const data = rawExpensesData.value?.byType ?? []
    const total = data.reduce((sum, item) => sum + (item.totalCost ?? 0), 0)

    return data.map((item: ExpenseByTypeDto) => ({
      type: item.typeName ?? '',
      amount: item.totalCost ?? 0,
      percentage: total > 0 ? ((item.totalCost ?? 0) / total) * 100 : 0,
    }))
  })

  // Expenses by product
  const expensesByProduct = computed<ExpenseByProductData[]>(() => {
    const data = rawExpensesData.value?.byProduct ?? []
    return data.map((item: ExpenseByProductDto) => ({
      productId: item.productId ?? '',
      productName: item.productName ?? '',
      amount: item.totalCost ?? 0,
    }))
  })

  // Profit & Loss summary
  const profitLossData = computed<ProfitLossData>(() => {
    const dashboard = rawDashboardData.value
    const expenses = rawExpensesData.value

    if (!dashboard) {
      return {
        revenue: 0,
        productCosts: 0,
        grossProfit: 0,
        adSpend: 0,
        otherExpenses: 0,
        netProfit: 0,
      }
    }

    const revenueStats = dashboard.revenueStats
    const marketingStats = dashboard.marketingStats

    const revenue = revenueStats?.totalRevenue ?? 0
    const grossProfit = revenueStats?.totalProfit ?? 0
    const productCosts = revenue - grossProfit
    const adSpend = marketingStats?.totalAdSpend ?? 0
    const otherExpenses = expenses?.totalCost ?? 0
    const netProfit = revenueStats?.totalNetProfit ?? (grossProfit - adSpend - otherExpenses)

    return {
      revenue,
      productCosts,
      grossProfit,
      adSpend,
      otherExpenses,
      netProfit,
    }
  })

  // Chart data for expenses by type (donut)
  const expenseTypeChartData = computed(() => {
    const data = expensesByType.value
    return {
      labels: data.map(d => d.type),
      values: data.map(d => d.amount),
    }
  })

  // Chart data for expenses by product (bar)
  const expenseProductChartData = computed(() => {
    const data = expensesByProduct.value.slice(0, 10) // Top 10
    return {
      labels: data.map(d => d.productName),
      values: data.map(d => d.amount),
    }
  })

  // Revenue trend data - REAL DATA from dailyStats API
  const revenueTrendData = computed(() => {
    const dailyStats = rawDashboardData.value?.dailyStats ?? []

    return {
      categories: dailyStats.map(d =>
        new Date(d.date!).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
      ),
      revenue: dailyStats.map(d => d.revenue ?? 0),
      profit: dailyStats.map(d => d.profit ?? 0),
    }
  })

  // Loading state
  const isLoading = computed(() => dashboardQuery.isLoading.value || expensesQuery.isLoading.value)
  const isFetching = computed(() => dashboardQuery.isFetching.value || expensesQuery.isFetching.value)

  // Actions
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['financial-reports'] })
  }

  const refetch = () => {
    dashboardQuery.refetch()
    expensesQuery.refetch()
  }

  return {
    // Raw data
    rawDashboardData,
    rawExpensesData,

    // Processed data
    kpiData,
    expensesByType,
    expensesByProduct,
    profitLossData,
    expenseTypeChartData,
    expenseProductChartData,
    revenueTrendData,

    // State
    isLoading,
    isFetching,

    // Actions
    invalidate,
    refetch,
  }
}
