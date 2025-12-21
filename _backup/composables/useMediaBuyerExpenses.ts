import type { MediaBuyerExpense, CreateMediaBuyerExpenseRequest, UpdateMediaBuyerExpenseRequest } from '~/types/mediabuyerexpense'
import type { PaginatedResponse } from '~/types/api'

export const useMediaBuyerExpenses = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const mediaBuyerExpenses = useState<MediaBuyerExpense[]>('mediaBuyerExpenses', () => [])
  const isLoading = useState<boolean>('mediaBuyerExpenses-loading', () => false)
  const pagination = useState('mediaBuyerExpenses-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search media buyer expenses
  const searchMediaBuyerExpenses = async (params: {
    keyword?: string
    mediaBuyerId?: string | null
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<MediaBuyerExpense>>('/api/v1/mediabuyerexpenses/search', {
        keyword: params.keyword || '',
        mediaBuyerId: params.mediaBuyerId,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['dateAdded desc']
      })

      mediaBuyerExpenses.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load media buyer expenses')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single media buyer expense
  const getMediaBuyerExpense = async (id: string) => {
    try {
      return await api.get<MediaBuyerExpense>(`/api/v1/mediabuyerexpenses/${id}`)
    } catch (err) {
      error('Failed to load media buyer expense')
      throw err
    }
  }

  // Create media buyer expense
  const createMediaBuyerExpense = async (data: CreateMediaBuyerExpenseRequest) => {
    try {
      const id = await api.post<string>('/api/v1/mediabuyerexpenses', data)
      success('Media buyer expense created successfully')
      await searchMediaBuyerExpenses({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create media buyer expense')
      throw err
    }
  }

  // Update media buyer expense
  const updateMediaBuyerExpense = async (id: string, data: UpdateMediaBuyerExpenseRequest) => {
    try {
      await api.put(`/api/v1/mediabuyerexpenses/${id}`, data)
      success('Media buyer expense updated successfully')
      await searchMediaBuyerExpenses({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update media buyer expense')
      throw err
    }
  }

  // Delete media buyer expense
  const deleteMediaBuyerExpense = async (id: string) => {
    try {
      await api.delete(`/api/v1/mediabuyerexpenses/${id}`)
      success('Media buyer expense deleted successfully')
      await searchMediaBuyerExpenses({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete media buyer expense')
      throw err
    }
  }

  return {
    mediaBuyerExpenses: readonly(mediaBuyerExpenses),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchMediaBuyerExpenses,
    getMediaBuyerExpense,
    createMediaBuyerExpense,
    updateMediaBuyerExpense,
    deleteMediaBuyerExpense
  }
}
