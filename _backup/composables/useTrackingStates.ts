import type { TrackingState, CreateTrackingStateRequest, UpdateTrackingStateRequest } from '~/types/trackingstate'
import type { PaginatedResponse } from '~/types/api'

export const useTrackingStates = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const trackingStates = useState<TrackingState[]>('trackingStates', () => [])
  const isLoading = useState<boolean>('trackingStates-loading', () => false)
  const pagination = useState('trackingStates-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search tracking states
  const searchTrackingStates = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<TrackingState>>('/api/v1/trackingstates/search', {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['state']
      })

      trackingStates.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load tracking states')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single tracking state
  const getTrackingState = async (id: string) => {
    try {
      return await api.get<TrackingState>(`/api/v1/trackingstates/${id}`)
    } catch (err) {
      error('Failed to load tracking state')
      throw err
    }
  }

  // Create tracking state
  const createTrackingState = async (data: CreateTrackingStateRequest) => {
    try {
      const id = await api.post<string>('/api/v1/trackingstates', data)
      success('Tracking state created successfully')
      await searchTrackingStates({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create tracking state')
      throw err
    }
  }

  // Update tracking state
  const updateTrackingState = async (id: string, data: UpdateTrackingStateRequest) => {
    try {
      await api.put(`/api/v1/trackingstates/${id}`, data)
      success('Tracking state updated successfully')
      await searchTrackingStates({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update tracking state')
      throw err
    }
  }

  // Delete tracking state
  const deleteTrackingState = async (id: string) => {
    try {
      await api.delete(`/api/v1/trackingstates/${id}`)
      success('Tracking state deleted successfully')
      await searchTrackingStates({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete tracking state')
      throw err
    }
  }

  return {
    trackingStates: readonly(trackingStates),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchTrackingStates,
    getTrackingState,
    createTrackingState,
    updateTrackingState,
    deleteTrackingState
  }
}
