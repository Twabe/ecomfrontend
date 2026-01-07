/**
 * Reports Service
 *
 * Service for analytics reports with chart data aggregation
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { dashboardGetOverview } from '~/api/generated/endpoints/dashboard/dashboard'
import type { DashboardStatsDto } from '~/api/generated/models'

export interface DateRange {
  startDate: string
  endDate: string
}

export interface ReportsParams {
  dateRange: DateRange
}

export interface ChartDataPoint {
  date: string
  value: number
}

export interface OrdersTrendData {
  categories: string[]
  delivered: number[]
  cancelled: number[]
  returned: number[]
}

export interface DeliveryPerformanceData {
  companies: string[]
  deliveryRates: number[]
  returnRates: number[]
  orders: number[]
}

export interface OrdersByStateData {
  labels: string[]
  values: number[]
  percentages: number[]
}

export interface TopProductData {
  name: string
  orders: number
  revenue: number
}

export interface KpiData {
  totalOrders: number
  deliveryRate: number
  revenue: number
  netProfit: number
  roas: number
}

export function useReportsService(params: Ref<ReportsParams>) {
  const queryClient = useQueryClient()

  // Query key based on date range
  const queryKey = computed(() => [
    'reports',
    'analytics',
    params.value.dateRange.startDate,
    params.value.dateRange.endDate
  ] as const)

  // Main data query using dashboard overview endpoint
  const dataQuery = useQuery({
    queryKey,
    queryFn: () => dashboardGetOverview({
      startDate: params.value.dateRange.startDate,
      endDate: params.value.dateRange.endDate
    }),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })

  // Raw data
  const rawData = computed<DashboardStatsDto | undefined>(() => dataQuery.data.value)

  // KPI Cards Data
  const kpiData = computed<KpiData>(() => {
    const data = rawData.value
    if (!data) {
      return {
        totalOrders: 0,
        deliveryRate: 0,
        revenue: 0,
        netProfit: 0,
        roas: 0
      }
    }

    const orderStats = data.orderStatistics
    const revenueStats = data.revenueStats
    const marketingStats = data.marketingStats

    const totalOrders = orderStats?.totalOrders ?? 0
    const delivered = orderStats?.delivered ?? 0
    const deliveryRate = totalOrders > 0 ? (delivered / totalOrders) * 100 : 0

    return {
      totalOrders,
      deliveryRate,
      revenue: revenueStats?.totalRevenue ?? 0,
      netProfit: revenueStats?.totalNetProfit ?? 0,
      roas: marketingStats?.roas ?? 0
    }
  })

  // Orders by State (for Donut Chart)
  const ordersByStateData = computed<OrdersByStateData>(() => {
    const data = rawData.value?.orderStatsByState ?? []
    return {
      labels: data.map(s => s.state ?? ''),
      values: data.map(s => s.count ?? 0),
      percentages: data.map(s => s.percentage ?? 0)
    }
  })

  // Delivery Company Performance (for Bar Chart)
  const deliveryPerformanceData = computed<DeliveryPerformanceData>(() => {
    const data = rawData.value?.deliveryCompanyPerformance ?? []
    return {
      companies: data.map(d => d.deliveryCompanyName ?? ''),
      deliveryRates: data.map(d => d.deliveryRate ?? 0),
      returnRates: data.map(d => d.returnRate ?? 0),
      orders: data.map(d => d.totalOrders ?? 0)
    }
  })

  // Top Products (for Horizontal Bar Chart)
  const topProductsData = computed<TopProductData[]>(() => {
    return (rawData.value?.topProducts ?? []).map(p => ({
      name: p.productName ?? '',
      orders: p.orderCount ?? 0,
      revenue: p.totalRevenue ?? 0
    }))
  })

  // Top Customers
  const topCustomersData = computed(() => {
    return rawData.value?.topCustomers ?? []
  })

  // Generate mock trend data based on date range
  // In production, this would come from a dedicated API endpoint
  const ordersTrendData = computed<OrdersTrendData>(() => {
    const start = new Date(params.value.dateRange.startDate)
    const end = new Date(params.value.dateRange.endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const categories: string[] = []
    const delivered: number[] = []
    const cancelled: number[] = []
    const returned: number[] = []

    // Use order stats to generate proportional daily data
    const orderStats = rawData.value?.orderStatistics
    const totalDelivered = orderStats?.delivered ?? 0
    const totalCancelled = orderStats?.cancelled ?? 0
    const totalReturned = orderStats?.returned ?? 0

    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      categories.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }))

      // Distribute values across days with some variation
      const variation = 0.7 + Math.random() * 0.6 // 0.7 to 1.3
      delivered.push(Math.round((totalDelivered / days) * variation))
      cancelled.push(Math.round((totalCancelled / days) * variation))
      returned.push(Math.round((totalReturned / days) * variation))
    }

    return { categories, delivered, cancelled, returned }
  })

  // Revenue trend data
  const revenueTrendData = computed(() => {
    const start = new Date(params.value.dateRange.startDate)
    const end = new Date(params.value.dateRange.endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const categories: string[] = []
    const revenue: number[] = []
    const profit: number[] = []

    const revenueStats = rawData.value?.revenueStats
    const totalRevenue = revenueStats?.totalRevenue ?? 0
    const totalProfit = revenueStats?.totalProfit ?? 0

    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      categories.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }))

      const variation = 0.7 + Math.random() * 0.6
      revenue.push(Math.round((totalRevenue / days) * variation))
      profit.push(Math.round((totalProfit / days) * variation))
    }

    return { categories, revenue, profit }
  })

  // Loading state
  const isLoading = computed(() => dataQuery.isLoading.value)
  const isFetching = computed(() => dataQuery.isFetching.value)

  // Actions
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['reports'] })
  }

  const refetch = () => dataQuery.refetch()

  return {
    // Raw data
    rawData,

    // Processed data for components
    kpiData,
    ordersByStateData,
    deliveryPerformanceData,
    topProductsData,
    topCustomersData,
    ordersTrendData,
    revenueTrendData,

    // State
    isLoading,
    isFetching,

    // Actions
    invalidate,
    refetch
  }
}

// Export utilities
export async function exportToPdf(elementId: string, filename: string = 'report.pdf') {
  const html2canvas = (await import('html2canvas')).default
  const jsPDF = (await import('jspdf')).default

  const element = document.getElementById(elementId)
  if (!element) return

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  const imgWidth = 297 // A4 landscape width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
  pdf.save(filename)
}

export async function exportToExcel(data: Record<string, unknown>[], filename: string = 'report.xlsx') {
  const XLSX = await import('xlsx')

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')

  XLSX.writeFile(workbook, filename)
}
