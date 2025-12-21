import type { ShippingFee, CreateShippingFeeRequest, UpdateShippingFeeRequest } from '~/types/shippingfee'
import type { PaginatedResponse } from '~/types/api'

export const useShippingFees = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const shippingFees = useState<ShippingFee[]>('shippingFees', () => [])
  const isLoading = useState<boolean>('shippingFees-loading', () => false)
  const pagination = useState('shippingFees-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search shipping fees
  const searchShippingFees = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
    deliveryCompanyId?: string
    cityId?: string
  } = {}) => {
    isLoading.value = true
    try {
      const body: Record<string, unknown> = {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['City.Name']
      }

      const filters = []
      if (params.deliveryCompanyId) {
        filters.push({ field: 'deliveryCompanyId', operator: 'eq', value: params.deliveryCompanyId })
      }
      if (params.cityId) {
        filters.push({ field: 'cityId', operator: 'eq', value: params.cityId })
      }
      if (filters.length > 0) {
        body.advancedFilter = {
          logic: 'and',
          filters
        }
      }

      const response = await api.post<PaginatedResponse<ShippingFee>>('/api/v1/shippingfees/search', body)

      shippingFees.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load shipping fees')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single shipping fee
  const getShippingFee = async (id: string) => {
    try {
      return await api.get<ShippingFee>(`/api/v1/shippingfees/${id}`)
    } catch (err) {
      error('Failed to load shipping fee')
      throw err
    }
  }

  // Create shipping fee
  const createShippingFee = async (data: CreateShippingFeeRequest) => {
    try {
      const id = await api.post<string>('/api/v1/shippingfees', data)
      success('Shipping fee created successfully')
      await searchShippingFees({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create shipping fee')
      throw err
    }
  }

  // Update shipping fee
  const updateShippingFee = async (id: string, data: UpdateShippingFeeRequest) => {
    try {
      await api.put(`/api/v1/shippingfees/${id}`, data)
      success('Shipping fee updated successfully')
      await searchShippingFees({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update shipping fee')
      throw err
    }
  }

  // Delete shipping fee
  const deleteShippingFee = async (id: string) => {
    try {
      await api.delete(`/api/v1/shippingfees/${id}`)
      success('Shipping fee deleted successfully')
      await searchShippingFees({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete shipping fee')
      throw err
    }
  }

  return {
    shippingFees: readonly(shippingFees),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchShippingFees,
    getShippingFee,
    createShippingFee,
    updateShippingFee,
    deleteShippingFee
  }
}
