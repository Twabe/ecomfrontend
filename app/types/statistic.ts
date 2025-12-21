// Statistic Types

export interface Statistic {
  id: string
  deliveryCompanyId: string | null
  deliveryCompanyName: string | null
  cityId: string | null
  cityName: string | null
  productId: string | null
  productName: string | null
  workerId: string | null
  deliveredCount: number
  canceledCount: number
  statisticDate: string
}

export interface CreateStatisticRequest {
  deliveredCount: number
  canceledCount: number
  deliveryCompanyId?: string
  cityId?: string
  productId?: string
  workerId?: string
}

export interface UpdateStatisticRequest {
  deliveredCount: number
  canceledCount: number
  deliveryCompanyId?: string
  cityId?: string
  productId?: string
  workerId?: string
}

export interface SearchStatisticsParams {
  keyword?: string
  pageNumber?: number
  pageSize?: number
  orderBy?: string[]
  deliveryCompanyId?: string
  cityId?: string
  productId?: string
  workerId?: string
}
