import type { Source, CreateSourceRequest, UpdateSourceRequest } from '~/types/source'
import type { PaginatedResponse } from '~/types/api'

export const useSources = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const sources = useState<Source[]>('sources', () => [])
  const isLoading = useState<boolean>('sources-loading', () => false)
  const pagination = useState('sources-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search sources
  const searchSources = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<Source>>('/api/v1/sources/search', {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['title']
      })

      sources.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load sources')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single source
  const getSource = async (id: string) => {
    try {
      return await api.get<Source>(`/api/v1/sources/${id}`)
    } catch (err) {
      error('Failed to load source')
      throw err
    }
  }

  // Create source
  const createSource = async (data: CreateSourceRequest) => {
    try {
      const id = await api.post<string>('/api/v1/sources', data)
      success('Source created successfully')
      await searchSources({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create source')
      throw err
    }
  }

  // Update source
  const updateSource = async (id: string, data: UpdateSourceRequest) => {
    try {
      await api.put(`/api/v1/sources/${id}`, data)
      success('Source updated successfully')
      await searchSources({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update source')
      throw err
    }
  }

  // Delete source
  const deleteSource = async (id: string) => {
    try {
      await api.delete(`/api/v1/sources/${id}`)
      success('Source deleted successfully')
      await searchSources({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete source')
      throw err
    }
  }

  return {
    sources: readonly(sources),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchSources,
    getSource,
    createSource,
    updateSource,
    deleteSource
  }
}
