import type { SpentAd, CreateSpentAdRequest, UpdateSpentAdRequest } from '~/types/spentad'
import type { PaginatedResponse } from '~/types/api'

export const useSpentAds = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const spentAds = useState<SpentAd[]>('spentAds', () => [])
  const isLoading = useState<boolean>('spentAds-loading', () => false)
  const pagination = useState('spentAds-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search spent ads
  const searchSpentAds = async (params: {
    keyword?: string
    productId?: string | null
    platform?: string | null
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<SpentAd>>('/api/v1/spentads/search', {
        keyword: params.keyword || '',
        productId: params.productId,
        platform: params.platform,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['spentDate desc']
      })

      spentAds.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load spent ads')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single spent ad
  const getSpentAd = async (id: string) => {
    try {
      return await api.get<SpentAd>(`/api/v1/spentads/${id}`)
    } catch (err) {
      error('Failed to load spent ad')
      throw err
    }
  }

  // Create spent ad
  const createSpentAd = async (data: CreateSpentAdRequest) => {
    try {
      const id = await api.post<string>('/api/v1/spentads', data)
      success('Spent ad created successfully')
      await searchSpentAds({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create spent ad')
      throw err
    }
  }

  // Update spent ad
  const updateSpentAd = async (id: string, data: UpdateSpentAdRequest) => {
    try {
      await api.put(`/api/v1/spentads/${id}`, data)
      success('Spent ad updated successfully')
      await searchSpentAds({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update spent ad')
      throw err
    }
  }

  // Delete spent ad
  const deleteSpentAd = async (id: string) => {
    try {
      await api.delete(`/api/v1/spentads/${id}`)
      success('Spent ad deleted successfully')
      await searchSpentAds({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete spent ad')
      throw err
    }
  }

  return {
    spentAds: readonly(spentAds),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchSpentAds,
    getSpentAd,
    createSpentAd,
    updateSpentAd,
    deleteSpentAd
  }
}
