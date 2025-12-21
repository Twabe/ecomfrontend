import type { SubDeliveryCompany, CreateSubDeliveryCompanyRequest, UpdateSubDeliveryCompanyRequest } from '~/types/subdeliverycompany'
import type { PaginatedResponse } from '~/types/api'

export const useSubDeliveryCompanies = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const subDeliveryCompanies = useState<SubDeliveryCompany[]>('subDeliveryCompanies', () => [])
  const isLoading = useState<boolean>('subDeliveryCompanies-loading', () => false)
  const pagination = useState('subDeliveryCompanies-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search sub delivery companies
  const searchSubDeliveryCompanies = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
    deliveryCompanyId?: string
  } = {}) => {
    isLoading.value = true
    try {
      const body: Record<string, unknown> = {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['name']
      }

      if (params.deliveryCompanyId) {
        body.advancedFilter = {
          logic: 'and',
          filters: [{ field: 'deliveryCompanyId', operator: 'eq', value: params.deliveryCompanyId }]
        }
      }

      const response = await api.post<PaginatedResponse<SubDeliveryCompany>>('/api/v1/subdeliverycompanies/search', body)

      subDeliveryCompanies.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load sub delivery companies')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single sub delivery company
  const getSubDeliveryCompany = async (id: string) => {
    try {
      return await api.get<SubDeliveryCompany>(`/api/v1/subdeliverycompanies/${id}`)
    } catch (err) {
      error('Failed to load sub delivery company')
      throw err
    }
  }

  // Create sub delivery company
  const createSubDeliveryCompany = async (data: CreateSubDeliveryCompanyRequest) => {
    try {
      const id = await api.post<string>('/api/v1/subdeliverycompanies', data)
      success('Sub delivery company created successfully')
      await searchSubDeliveryCompanies({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create sub delivery company')
      throw err
    }
  }

  // Update sub delivery company
  const updateSubDeliveryCompany = async (id: string, data: UpdateSubDeliveryCompanyRequest) => {
    try {
      await api.put(`/api/v1/subdeliverycompanies/${id}`, data)
      success('Sub delivery company updated successfully')
      await searchSubDeliveryCompanies({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update sub delivery company')
      throw err
    }
  }

  // Delete sub delivery company
  const deleteSubDeliveryCompany = async (id: string) => {
    try {
      await api.delete(`/api/v1/subdeliverycompanies/${id}`)
      success('Sub delivery company deleted successfully')
      await searchSubDeliveryCompanies({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete sub delivery company')
      throw err
    }
  }

  return {
    subDeliveryCompanies: readonly(subDeliveryCompanies),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchSubDeliveryCompanies,
    getSubDeliveryCompany,
    createSubDeliveryCompany,
    updateSubDeliveryCompany,
    deleteSubDeliveryCompany
  }
}
