import type { DeliveryCompany, CreateDeliveryCompanyRequest, UpdateDeliveryCompanyRequest, UpdateCredentialsRequest, UpdatePaymentTermsRequest } from '~/types/deliverycompany'
import type { PaginatedResponse } from '~/types/api'

export const useDeliveryCompanies = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const deliveryCompanies = useState<DeliveryCompany[]>('deliveryCompanies', () => [])
  const isLoading = useState<boolean>('deliveryCompanies-loading', () => false)
  const pagination = useState('deliveryCompanies-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search delivery companies
  const searchDeliveryCompanies = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<DeliveryCompany>>('/api/v1/deliverycompanies/search', {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['name']
      })

      deliveryCompanies.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load delivery companies')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get all for dropdown (no pagination)
  const getAllDeliveryCompanies = async () => {
    try {
      const response = await api.post<PaginatedResponse<DeliveryCompany>>('/api/v1/deliverycompanies/search', {
        pageNumber: 1,
        pageSize: 1000,
        orderBy: ['name']
      })
      return response.data
    } catch (err) {
      error('Failed to load delivery companies')
      throw err
    }
  }

  // Get single delivery company
  const getDeliveryCompany = async (id: string) => {
    try {
      return await api.get<DeliveryCompany>(`/api/v1/deliverycompanies/${id}`)
    } catch (err) {
      error('Failed to load delivery company')
      throw err
    }
  }

  // Create delivery company
  const createDeliveryCompany = async (data: CreateDeliveryCompanyRequest) => {
    try {
      const id = await api.post<string>('/api/v1/deliverycompanies', data)
      success('Delivery company created successfully')
      await searchDeliveryCompanies({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create delivery company')
      throw err
    }
  }

  // Update delivery company
  const updateDeliveryCompany = async (id: string, data: UpdateDeliveryCompanyRequest) => {
    try {
      await api.put(`/api/v1/deliverycompanies/${id}`, data)
      success('Delivery company updated successfully')
      await searchDeliveryCompanies({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update delivery company')
      throw err
    }
  }

  // Delete delivery company
  const deleteDeliveryCompany = async (id: string) => {
    try {
      await api.delete(`/api/v1/deliverycompanies/${id}`)
      success('Delivery company deleted successfully')
      await searchDeliveryCompanies({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete delivery company')
      throw err
    }
  }

  // Update API credentials
  const updateCredentials = async (id: string, data: UpdateCredentialsRequest) => {
    try {
      await api.put(`/api/v1/deliverycompanies/${id}/credentials`, data)
      success('Credentials updated successfully')
    } catch (err) {
      error('Failed to update credentials')
      throw err
    }
  }

  // Update payment terms
  const updatePaymentTerms = async (id: string, data: UpdatePaymentTermsRequest) => {
    try {
      await api.put(`/api/v1/deliverycompanies/${id}/payment-terms`, data)
      success('Payment terms updated successfully')
    } catch (err) {
      error('Failed to update payment terms')
      throw err
    }
  }

  return {
    deliveryCompanies: readonly(deliveryCompanies),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchDeliveryCompanies,
    getAllDeliveryCompanies,
    getDeliveryCompany,
    createDeliveryCompany,
    updateDeliveryCompany,
    deleteDeliveryCompany,
    updateCredentials,
    updatePaymentTerms
  }
}
