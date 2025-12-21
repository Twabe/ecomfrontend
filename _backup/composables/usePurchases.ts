import type { Purchase, CreatePurchaseRequest, UpdatePurchaseRequest, UpdatePurchaseStatusRequest } from '~/types/purchase'
import type { PaginatedResponse } from '~/types/api'

export const usePurchases = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const purchases = useState<Purchase[]>('purchases', () => [])
  const isLoading = useState<boolean>('purchases-loading', () => false)
  const pagination = useState('purchases-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search purchases
  const searchPurchases = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
    supplierId?: string
    status?: string
  } = {}) => {
    isLoading.value = true
    try {
      const body: Record<string, unknown> = {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['purchaseDate desc']
      }

      const filters: Array<{ field: string; operator: string; value: unknown }> = []

      if (params.supplierId) {
        filters.push({ field: 'supplierId', operator: 'eq', value: params.supplierId })
      }

      if (params.status) {
        filters.push({ field: 'status', operator: 'eq', value: params.status })
      }

      if (filters.length > 0) {
        body.advancedFilter = {
          logic: 'and',
          filters
        }
      }

      const response = await api.post<PaginatedResponse<Purchase>>('/api/v1/purchases/search', body)

      purchases.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load purchases')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single purchase
  const getPurchase = async (id: string) => {
    try {
      return await api.get<Purchase>(`/api/v1/purchases/${id}`)
    } catch (err) {
      error('Failed to load purchase')
      throw err
    }
  }

  // Create purchase
  const createPurchase = async (data: CreatePurchaseRequest) => {
    try {
      const id = await api.post<string>('/api/v1/purchases', data)
      success('Purchase created successfully')
      await searchPurchases({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create purchase')
      throw err
    }
  }

  // Update purchase
  const updatePurchase = async (id: string, data: UpdatePurchaseRequest) => {
    try {
      await api.put(`/api/v1/purchases/${id}`, data)
      success('Purchase updated successfully')
      await searchPurchases({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update purchase')
      throw err
    }
  }

  // Delete purchase
  const deletePurchase = async (id: string) => {
    try {
      await api.delete(`/api/v1/purchases/${id}`)
      success('Purchase deleted successfully')
      await searchPurchases({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete purchase')
      throw err
    }
  }

  // Update status
  const updateStatus = async (id: string, data: UpdatePurchaseStatusRequest) => {
    try {
      await api.post(`/api/v1/purchases/${id}/status`, data)
      success('Purchase status updated')
      await searchPurchases({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update status')
      throw err
    }
  }

  // Confirm purchase
  const confirmPurchase = async (id: string, reason?: string) => {
    return updateStatus(id, { status: 'Confirmed', reason })
  }

  // Mark as shipped
  const markAsShipped = async (id: string, reason?: string) => {
    return updateStatus(id, { status: 'Shipped', reason })
  }

  // Mark as received
  const markAsReceived = async (id: string, reason?: string) => {
    return updateStatus(id, { status: 'Received', reason })
  }

  // Cancel purchase
  const cancelPurchase = async (id: string, reason?: string) => {
    return updateStatus(id, { status: 'Cancelled', reason })
  }

  // Receive purchase and update stock - This is the proper endpoint that updates inventory
  const receivePurchase = async (id: string, data?: {
    actualDeliveryDate?: string
    comment?: string
  }) => {
    try {
      await api.post(`/api/v1/purchases/${id}/receive`, {
        actualDeliveryDate: data?.actualDeliveryDate || new Date().toISOString(),
        comment: data?.comment
      })
      success('Purchase received and stock updated')
      await searchPurchases({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to receive purchase')
      throw err
    }
  }

  // Get purchase history (status changes)
  const getPurchaseHistory = async (id: string) => {
    try {
      return await api.get<Array<{
        status: string
        reason?: string
        changedBy: string
        changedAt: string
      }>>(`/api/v1/purchases/${id}/history`)
    } catch (err) {
      error('Failed to load purchase history')
      throw err
    }
  }

  return {
    purchases: readonly(purchases),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchPurchases,
    getPurchase,
    createPurchase,
    updatePurchase,
    deletePurchase,
    updateStatus,
    confirmPurchase,
    markAsShipped,
    markAsReceived,
    cancelPurchase,
    // Stock-updating receive
    receivePurchase,
    getPurchaseHistory
  }
}
