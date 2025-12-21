import type { ExtraTag, CreateExtraTagRequest, UpdateExtraTagRequest } from '~/types/extratag'
import type { PaginatedResponse } from '~/types/api'

export const useExtraTags = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const extraTags = useState<ExtraTag[]>('extraTags', () => [])
  const isLoading = useState<boolean>('extraTags-loading', () => false)
  const pagination = useState('extraTags-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search extra tags
  const searchExtraTags = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<ExtraTag>>('/api/v1/extratags/search', {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['title']
      })

      extraTags.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load extra tags')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single extra tag
  const getExtraTag = async (id: string) => {
    try {
      return await api.get<ExtraTag>(`/api/v1/extratags/${id}`)
    } catch (err) {
      error('Failed to load extra tag')
      throw err
    }
  }

  // Create extra tag
  const createExtraTag = async (data: CreateExtraTagRequest) => {
    try {
      const id = await api.post<string>('/api/v1/extratags', data)
      success('Extra tag created successfully')
      await searchExtraTags({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create extra tag')
      throw err
    }
  }

  // Update extra tag
  const updateExtraTag = async (id: string, data: UpdateExtraTagRequest) => {
    try {
      await api.put(`/api/v1/extratags/${id}`, data)
      success('Extra tag updated successfully')
      await searchExtraTags({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update extra tag')
      throw err
    }
  }

  // Delete extra tag
  const deleteExtraTag = async (id: string) => {
    try {
      await api.delete(`/api/v1/extratags/${id}`)
      success('Extra tag deleted successfully')
      await searchExtraTags({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete extra tag')
      throw err
    }
  }

  return {
    extraTags: readonly(extraTags),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchExtraTags,
    getExtraTag,
    createExtraTag,
    updateExtraTag,
    deleteExtraTag
  }
}
