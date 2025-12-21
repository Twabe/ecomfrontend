import type { OrderFee, CreateOrderFeeRequest, UpdateOrderFeeRequest } from '~/types/orderfee'
import type { PaginatedResponse } from '~/types/api'

export const useOrderFees = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const orderFees = useState<OrderFee[]>('orderFees', () => [])
  const isLoading = useState<boolean>('orderFees-loading', () => false)
  const pagination = useState('orderFees-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search order fees
  const searchOrderFees = async (params: {
    keyword?: string
    orderId?: string | null
    feeType?: string | null
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<OrderFee>>('/api/v1/orderfees/search', {
        keyword: params.keyword || '',
        orderId: params.orderId,
        feeType: params.feeType,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['feeType']
      })

      orderFees.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load order fees')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single order fee
  const getOrderFee = async (id: string) => {
    try {
      return await api.get<OrderFee>(`/api/v1/orderfees/${id}`)
    } catch (err) {
      error('Failed to load order fee')
      throw err
    }
  }

  // Create order fee
  const createOrderFee = async (data: CreateOrderFeeRequest) => {
    try {
      const id = await api.post<string>('/api/v1/orderfees', data)
      success('Order fee created successfully')
      await searchOrderFees({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create order fee')
      throw err
    }
  }

  // Update order fee
  const updateOrderFee = async (id: string, data: UpdateOrderFeeRequest) => {
    try {
      await api.put(`/api/v1/orderfees/${id}`, data)
      success('Order fee updated successfully')
      await searchOrderFees({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update order fee')
      throw err
    }
  }

  // Delete order fee
  const deleteOrderFee = async (id: string) => {
    try {
      await api.delete(`/api/v1/orderfees/${id}`)
      success('Order fee deleted successfully')
      await searchOrderFees({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete order fee')
      throw err
    }
  }

  return {
    orderFees: readonly(orderFees),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchOrderFees,
    getOrderFee,
    createOrderFee,
    updateOrderFee,
    deleteOrderFee
  }
}
