import type { OrderCost, CreateOrderCostRequest, UpdateOrderCostRequest } from '~/types/ordercost'
import type { PaginatedResponse } from '~/types/api'

export const useOrderCosts = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const orderCosts = useState<OrderCost[]>('orderCosts', () => [])
  const isLoading = useState<boolean>('orderCosts-loading', () => false)
  const pagination = useState('orderCosts-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search order costs
  const searchOrderCosts = async (params: {
    keyword?: string
    orderId?: string | null
    costType?: string | null
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<OrderCost>>('/api/v1/ordercosts/search', {
        keyword: params.keyword || '',
        orderId: params.orderId,
        costType: params.costType,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['costType']
      })

      orderCosts.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load order costs')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single order cost
  const getOrderCost = async (id: string) => {
    try {
      return await api.get<OrderCost>(`/api/v1/ordercosts/${id}`)
    } catch (err) {
      error('Failed to load order cost')
      throw err
    }
  }

  // Create order cost
  const createOrderCost = async (data: CreateOrderCostRequest) => {
    try {
      const id = await api.post<string>('/api/v1/ordercosts', data)
      success('Order cost created successfully')
      await searchOrderCosts({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create order cost')
      throw err
    }
  }

  // Update order cost
  const updateOrderCost = async (id: string, data: UpdateOrderCostRequest) => {
    try {
      await api.put(`/api/v1/ordercosts/${id}`, data)
      success('Order cost updated successfully')
      await searchOrderCosts({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update order cost')
      throw err
    }
  }

  // Delete order cost
  const deleteOrderCost = async (id: string) => {
    try {
      await api.delete(`/api/v1/ordercosts/${id}`)
      success('Order cost deleted successfully')
      await searchOrderCosts({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete order cost')
      throw err
    }
  }

  return {
    orderCosts: readonly(orderCosts),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchOrderCosts,
    getOrderCost,
    createOrderCost,
    updateOrderCost,
    deleteOrderCost
  }
}
