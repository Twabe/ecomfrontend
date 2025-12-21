import type { PlatformIntegration, CreatePlatformIntegrationRequest, UpdatePlatformIntegrationRequest, PlatformType } from '~/types/platformintegration'
import type { PaginatedResponse } from '~/types/api'

export const usePlatformIntegrations = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const platformIntegrations = useState<PlatformIntegration[]>('platformIntegrations', () => [])
  const isLoading = useState<boolean>('platformIntegrations-loading', () => false)
  const pagination = useState('platformIntegrations-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search platform integrations
  const searchPlatformIntegrations = async (params: {
    keyword?: string
    name?: string | null
    type?: PlatformType | null
    isActive?: boolean | null
    defaultStoreId?: string | null
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<PlatformIntegration>>('/api/v1/platformintegrations/search', {
        keyword: params.keyword || '',
        name: params.name,
        type: params.type,
        isActive: params.isActive,
        defaultStoreId: params.defaultStoreId,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['name']
      })

      platformIntegrations.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load platform integrations')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single platform integration
  const getPlatformIntegration = async (id: string) => {
    try {
      return await api.get<PlatformIntegration>(`/api/v1/platformintegrations/${id}`)
    } catch (err) {
      error('Failed to load platform integration')
      throw err
    }
  }

  // Create platform integration
  const createPlatformIntegration = async (data: CreatePlatformIntegrationRequest) => {
    try {
      const id = await api.post<string>('/api/v1/platformintegrations', data)
      success('Platform integration created successfully')
      await searchPlatformIntegrations({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create platform integration')
      throw err
    }
  }

  // Update platform integration
  const updatePlatformIntegration = async (id: string, data: UpdatePlatformIntegrationRequest) => {
    try {
      await api.put(`/api/v1/platformintegrations/${id}`, data)
      success('Platform integration updated successfully')
      await searchPlatformIntegrations({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update platform integration')
      throw err
    }
  }

  // Delete platform integration
  const deletePlatformIntegration = async (id: string) => {
    try {
      await api.delete(`/api/v1/platformintegrations/${id}`)
      success('Platform integration deleted successfully')
      await searchPlatformIntegrations({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete platform integration')
      throw err
    }
  }

  // Toggle platform integration status
  const togglePlatformIntegration = async (id: string, isActive: boolean) => {
    try {
      await api.post(`/api/v1/platformintegrations/toggle`, { id, isActive })
      success(`Platform integration ${isActive ? 'activated' : 'deactivated'} successfully`)
      await searchPlatformIntegrations({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error(`Failed to ${isActive ? 'activate' : 'deactivate'} platform integration`)
      throw err
    }
  }

  // Update webhook URL
  const updateWebhook = async (id: string, webhookUrl: string, webhookSecret?: string) => {
    try {
      await api.put(`/api/v1/platformintegrations/${id}/webhook`, {
        webhookUrl,
        webhookSecret
      })
      success('Webhook URL updated successfully')
      await searchPlatformIntegrations({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update webhook URL')
      throw err
    }
  }

  return {
    platformIntegrations: readonly(platformIntegrations),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchPlatformIntegrations,
    getPlatformIntegration,
    createPlatformIntegration,
    updatePlatformIntegration,
    deletePlatformIntegration,
    togglePlatformIntegration,
    updateWebhook
  }
}
