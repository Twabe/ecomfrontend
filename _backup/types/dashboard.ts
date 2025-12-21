// Dashboard Types

// Basic Stats (GET /api/v1/dashboard)
export interface ChartSeries {
  name: string | null
  data: number[] | null
}

export interface BasicStats {
  productCount: number
  brandCount: number
  userCount: number
  roleCount: number
  dataEnterBarChart: ChartSeries[]
  productByBrandTypePieChart: Record<string, number> | null
}

// Overview Stats (GET /api/v1/dashboard/overview)
export interface OrderStatistics {
  totalOrders: number
  todayOrders: number
  thisWeekOrders: number
  thisMonthOrders: number
  pendingConfirmations: number
  readyForDelivery: number
  inDelivery: number
  delivered: number
  returned: number
  cancelled: number
}

export interface RevenueStats {
  totalRevenue: number
  todayRevenue: number
  thisWeekRevenue: number
  thisMonthRevenue: number
  totalProfit: number
  todayProfit: number
  thisWeekProfit: number
  thisMonthProfit: number
}

export interface OrderStatsByState {
  state: string
  count: number
  totalAmount: number
  percentage: number
}

export interface TopProduct {
  productId: string
  productName: string
  orderCount: number
  quantitySold: number
  totalRevenue: number
}

export interface TopCustomer {
  customerId: string | null
  customerName: string
  phone: string
  orderCount: number
  totalSpent: number
  lastOrderDate: string | null
}

export interface DeliveryCompanyPerformance {
  deliveryCompanyId: string
  deliveryCompanyName: string
  totalOrders: number
  deliveredOrders: number
  returnedOrders: number
  deliveryRate: number
  returnRate: number
  totalRevenue: number
}

export interface DashboardStats {
  orderStatistics: OrderStatistics
  revenueStats: RevenueStats
  ordersByState: OrderStatsByState[]
  topProducts: TopProduct[]
  topCustomers: TopCustomer[]
  deliveryCompanyPerformance: DeliveryCompanyPerformance[]
}

export interface DashboardOverviewParams {
  startDate?: string
  endDate?: string
}
