import type { Reason, CreateReasonRequest, UpdateReasonRequest } from '~/types/reason'
import type { PaginatedResponse } from '~/types/api'

export const useReasons = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const reasons = useState<Reason[]>('reasons', () => [])
  const isLoading = useState<boolean>('reasons-loading', () => false)
  const pagination = useState('reasons-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search reasons
  const searchReasons = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<Reason>>('/api/v1/reasons/search', {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['title']
      })

      reasons.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load reasons')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single reason
  const getReason = async (id: string) => {
    try {
      return await api.get<Reason>(`/api/v1/reasons/${id}`)
    } catch (err) {
      error('Failed to load reason')
      throw err
    }
  }

  // Create reason
  const createReason = async (data: CreateReasonRequest) => {
    try {
      const id = await api.post<string>('/api/v1/reasons', data)
      success('Reason created successfully')
      await searchReasons({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create reason')
      throw err
    }
  }

  // Update reason
  const updateReason = async (id: string, data: UpdateReasonRequest) => {
    try {
      await api.put(`/api/v1/reasons/${id}`, data)
      success('Reason updated successfully')
      await searchReasons({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update reason')
      throw err
    }
  }

  // Delete reason
  const deleteReason = async (id: string) => {
    try {
      await api.delete(`/api/v1/reasons/${id}`)
      success('Reason deleted successfully')
      await searchReasons({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete reason')
      throw err
    }
  }

  return {
    reasons: readonly(reasons),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchReasons,
    getReason,
    createReason,
    updateReason,
    deleteReason
  }
}
