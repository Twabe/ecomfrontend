import type { StockTransaction } from '~/types/stocktransaction'
import type { PaginatedResponse } from '~/types/api'

// READ-ONLY composable - Stock transactions are system-generated
export const useStockTransactions = () => {
  const api = useApi()
  const { error } = useNotification()

  const stockTransactions = useState<StockTransaction[]>('stockTransactions', () => [])
  const isLoading = useState<boolean>('stockTransactions-loading', () => false)
  const pagination = useState('stockTransactions-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search stock transactions
  const searchStockTransactions = async (params: {
    keyword?: string
    productId?: string | null
    type?: string | null
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<StockTransaction>>('/api/v1/stocktransactions/search', {
        keyword: params.keyword || '',
        productId: params.productId,
        type: params.type,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['dateAdded desc']
      })

      stockTransactions.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load stock transactions')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single stock transaction
  const getStockTransaction = async (id: string) => {
    try {
      return await api.get<StockTransaction>(`/api/v1/stocktransactions/${id}`)
    } catch (err) {
      error('Failed to load stock transaction')
      throw err
    }
  }

  return {
    stockTransactions: readonly(stockTransactions),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchStockTransactions,
    getStockTransaction
    // Note: No create/update/delete - stock transactions are system-generated
  }
}
