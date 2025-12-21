import type { Stock, CreateStockRequest, UpdateStockRequest, AdjustStockRequest, AddStockWithCostRequest } from '~/types/stock'
import type { PaginatedResponse } from '~/types/api'

export const useStocks = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const stocks = useState<Stock[]>('stocks', () => [])
  const isLoading = useState<boolean>('stocks-loading', () => false)
  const pagination = useState('stocks-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search stocks
  const searchStocks = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
    productId?: string
    deliveryCompanyId?: string
  } = {}) => {
    isLoading.value = true
    try {
      const body: Record<string, unknown> = {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['Product.Name']
      }

      const filters: Array<{ field: string; operator: string; value: unknown }> = []

      if (params.productId) {
        filters.push({ field: 'productId', operator: 'eq', value: params.productId })
      }

      if (params.deliveryCompanyId) {
        filters.push({ field: 'deliveryCompanyId', operator: 'eq', value: params.deliveryCompanyId })
      }

      if (filters.length > 0) {
        body.advancedFilter = {
          logic: 'and',
          filters
        }
      }

      const response = await api.post<PaginatedResponse<Stock>>('/api/v1/stocks/search', body)

      stocks.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load stocks')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single stock
  const getStock = async (id: string) => {
    try {
      return await api.get<Stock>(`/api/v1/stocks/${id}`)
    } catch (err) {
      error('Failed to load stock')
      throw err
    }
  }

  // Create stock
  const createStock = async (data: CreateStockRequest) => {
    try {
      const id = await api.post<string>('/api/v1/stocks', data)
      success('Stock created successfully')
      await searchStocks({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create stock')
      throw err
    }
  }

  // Update stock
  const updateStock = async (id: string, data: UpdateStockRequest) => {
    try {
      await api.put(`/api/v1/stocks/${id}`, data)
      success('Stock updated successfully')
      await searchStocks({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update stock')
      throw err
    }
  }

  // Delete stock
  const deleteStock = async (id: string) => {
    try {
      await api.delete(`/api/v1/stocks/${id}`)
      success('Stock deleted successfully')
      await searchStocks({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete stock')
      throw err
    }
  }

  // Adjust quantity
  const adjustQuantity = async (id: string, data: AdjustStockRequest) => {
    try {
      await api.post(`/api/v1/stocks/${id}/adjust`, data)
      success('Stock quantity adjusted')
      await searchStocks({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to adjust stock quantity')
      throw err
    }
  }

  // Add stock with cost (weighted average)
  const addStockWithCost = async (id: string, data: AddStockWithCostRequest) => {
    try {
      await api.post(`/api/v1/stocks/${id}/add-with-cost`, data)
      success('Stock added with cost')
      await searchStocks({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to add stock')
      throw err
    }
  }

  return {
    stocks: readonly(stocks),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchStocks,
    getStock,
    createStock,
    updateStock,
    deleteStock,
    adjustQuantity,
    addStockWithCost
  }
}
