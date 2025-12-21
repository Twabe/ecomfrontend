import type { Customer, CreateCustomerRequest, UpdateCustomerRequest, BlacklistCustomerRequest } from '~/types/customer'
import type { Order } from '~/types/order'
import type { PaginatedResponse } from '~/types/api'

export const useCustomers = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const customers = useState<Customer[]>('customers', () => [])
  const isLoading = useState<boolean>('customers-loading', () => false)
  const pagination = useState('customers-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search customers
  const searchCustomers = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
    cityId?: string
    isBlacklisted?: boolean
  } = {}) => {
    isLoading.value = true
    try {
      const body: Record<string, unknown> = {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['fullName']
      }

      const filters: Array<{ field: string; operator: string; value: unknown }> = []

      if (params.cityId) {
        filters.push({ field: 'defaultCityId', operator: 'eq', value: params.cityId })
      }

      if (params.isBlacklisted !== undefined) {
        filters.push({ field: 'isBlacklisted', operator: 'eq', value: params.isBlacklisted })
      }

      if (filters.length > 0) {
        body.advancedFilter = {
          logic: 'and',
          filters
        }
      }

      const response = await api.post<PaginatedResponse<Customer>>('/api/v1/customers/search', body)

      customers.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load customers')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single customer
  const getCustomer = async (id: string) => {
    try {
      return await api.get<Customer>(`/api/v1/customers/${id}`)
    } catch (err) {
      error('Failed to load customer')
      throw err
    }
  }

  // Create customer
  const createCustomer = async (data: CreateCustomerRequest) => {
    try {
      const id = await api.post<string>('/api/v1/customers', data)
      success('Customer created successfully')
      await searchCustomers({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create customer')
      throw err
    }
  }

  // Update customer
  const updateCustomer = async (id: string, data: UpdateCustomerRequest) => {
    try {
      await api.put(`/api/v1/customers/${id}`, data)
      success('Customer updated successfully')
      await searchCustomers({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update customer')
      throw err
    }
  }

  // Delete customer
  const deleteCustomer = async (id: string) => {
    try {
      await api.delete(`/api/v1/customers/${id}`)
      success('Customer deleted successfully')
      await searchCustomers({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete customer')
      throw err
    }
  }

  // Blacklist customer
  const blacklistCustomer = async (id: string, data: BlacklistCustomerRequest) => {
    try {
      await api.post(`/api/v1/customers/${id}/blacklist`, data)
      success('Customer blacklisted')
      await searchCustomers({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to blacklist customer')
      throw err
    }
  }

  // Remove from blacklist
  const removeFromBlacklist = async (id: string) => {
    try {
      await api.post(`/api/v1/customers/${id}/remove-blacklist`, {})
      success('Customer removed from blacklist')
      await searchCustomers({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to remove from blacklist')
      throw err
    }
  }

  // Get customer by phone number
  const getCustomerByPhone = async (phone: string): Promise<Customer | null> => {
    try {
      const response = await api.get<Customer>(`/api/v1/customers/by-phone/${encodeURIComponent(phone)}`)
      return response
    } catch (err: unknown) {
      // 404 means customer not found - return null instead of throwing
      if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
        return null
      }
      error('Failed to find customer')
      throw err
    }
  }

  // Get customer orders
  const getCustomerOrders = async (customerId: string, params: {
    pageNumber?: number
    pageSize?: number
    state?: string
  } = {}): Promise<PaginatedResponse<Order>> => {
    try {
      const response = await api.post<PaginatedResponse<Order>>(`/api/v1/customers/${customerId}/orders`, {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        state: params.state,
        orderBy: ['CreatedOn desc']
      })
      return response
    } catch (err) {
      error('Failed to load customer orders')
      throw err
    }
  }

  // Get high-value customers
  const getHighValueCustomers = async (params: {
    pageNumber?: number
    pageSize?: number
    minOrderCount?: number
    minTotalSpent?: number
  } = {}): Promise<PaginatedResponse<Customer>> => {
    try {
      const response = await api.post<PaginatedResponse<Customer>>('/api/v1/customers/high-value', {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 20,
        minOrderCount: params.minOrderCount,
        minTotalSpent: params.minTotalSpent,
        orderBy: ['totalOrders desc']
      })
      return response
    } catch (err) {
      error('Failed to load high-value customers')
      throw err
    }
  }

  // Get problematic customers (high cancellation/return rate)
  const getProblematicCustomers = async (params: {
    pageNumber?: number
    pageSize?: number
  } = {}): Promise<PaginatedResponse<Customer>> => {
    try {
      const response = await api.post<PaginatedResponse<Customer>>('/api/v1/customers/problematic', {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 20,
        orderBy: ['cancelledOrders desc']
      })
      return response
    } catch (err) {
      error('Failed to load problematic customers')
      throw err
    }
  }

  // Export customers
  const exportCustomers = async (params: Record<string, unknown> = {}): Promise<Blob> => {
    try {
      return await api.post<Blob>('/api/v1/customers/export', params)
    } catch (err) {
      error('Failed to export customers')
      throw err
    }
  }

  return {
    customers: readonly(customers),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    blacklistCustomer,
    removeFromBlacklist,
    // Additional lookups
    getCustomerByPhone,
    getCustomerOrders,
    getHighValueCustomers,
    getProblematicCustomers,
    exportCustomers
  }
}
