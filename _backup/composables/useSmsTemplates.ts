import type { SmsTemplate, CreateSmsTemplateRequest, UpdateSmsTemplateRequest } from '~/types/smstemplate'
import type { PaginatedResponse } from '~/types/api'

export const useSmsTemplates = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const smsTemplates = useState<SmsTemplate[]>('smsTemplates', () => [])
  const isLoading = useState<boolean>('smsTemplates-loading', () => false)
  const pagination = useState('smsTemplates-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search SMS templates with filters
  const searchSmsTemplates = async (params: {
    keyword?: string
    state?: string | null
    phase?: string | null
    isActive?: boolean | null
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<SmsTemplate>>('/api/v1/smstemplates/search', {
        keyword: params.keyword || '',
        state: params.state,
        phase: params.phase,
        isActive: params.isActive,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['state', 'phase']
      })

      smsTemplates.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load SMS templates')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single SMS template
  const getSmsTemplate = async (id: string) => {
    try {
      return await api.get<SmsTemplate>(`/api/v1/smstemplates/${id}`)
    } catch (err) {
      error('Failed to load SMS template')
      throw err
    }
  }

  // Create SMS template
  const createSmsTemplate = async (data: CreateSmsTemplateRequest) => {
    try {
      const id = await api.post<string>('/api/v1/smstemplates', data)
      success('SMS template created successfully')
      await searchSmsTemplates({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create SMS template')
      throw err
    }
  }

  // Update SMS template
  const updateSmsTemplate = async (id: string, data: UpdateSmsTemplateRequest) => {
    try {
      await api.put(`/api/v1/smstemplates/${id}`, data)
      success('SMS template updated successfully')
      await searchSmsTemplates({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update SMS template')
      throw err
    }
  }

  // Delete SMS template
  const deleteSmsTemplate = async (id: string) => {
    try {
      await api.delete(`/api/v1/smstemplates/${id}`)
      success('SMS template deleted successfully')
      await searchSmsTemplates({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete SMS template')
      throw err
    }
  }

  // Activate SMS template
  const activateSmsTemplate = async (id: string) => {
    try {
      await api.post(`/api/v1/smstemplates/${id}/activate`, {})
      success('SMS template activated')
      await searchSmsTemplates({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to activate SMS template')
      throw err
    }
  }

  // Deactivate SMS template
  const deactivateSmsTemplate = async (id: string) => {
    try {
      await api.post(`/api/v1/smstemplates/${id}/deactivate`, {})
      success('SMS template deactivated')
      await searchSmsTemplates({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to deactivate SMS template')
      throw err
    }
  }

  return {
    smsTemplates: readonly(smsTemplates),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchSmsTemplates,
    getSmsTemplate,
    createSmsTemplate,
    updateSmsTemplate,
    deleteSmsTemplate,
    activateSmsTemplate,
    deactivateSmsTemplate
  }
}
