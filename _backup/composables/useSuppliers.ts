import type { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '~/types/supplier'
import type { PaginatedResponse } from '~/types/api'

export const useSuppliers = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const suppliers = useState<Supplier[]>('suppliers', () => [])
  const isLoading = useState<boolean>('suppliers-loading', () => false)
  const pagination = useState('suppliers-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search suppliers
  const searchSuppliers = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<Supplier>>('/api/v1/suppliers/search', {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['name']
      })

      suppliers.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load suppliers')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single supplier
  const getSupplier = async (id: string) => {
    try {
      return await api.get<Supplier>(`/api/v1/suppliers/${id}`)
    } catch (err) {
      error('Failed to load supplier')
      throw err
    }
  }

  // Create supplier
  const createSupplier = async (data: CreateSupplierRequest) => {
    try {
      const id = await api.post<string>('/api/v1/suppliers', data)
      success('Supplier created successfully')
      await searchSuppliers({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create supplier')
      throw err
    }
  }

  // Update supplier
  const updateSupplier = async (id: string, data: UpdateSupplierRequest) => {
    try {
      await api.put(`/api/v1/suppliers/${id}`, data)
      success('Supplier updated successfully')
      await searchSuppliers({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update supplier')
      throw err
    }
  }

  // Delete supplier
  const deleteSupplier = async (id: string) => {
    try {
      await api.delete(`/api/v1/suppliers/${id}`)
      success('Supplier deleted successfully')
      await searchSuppliers({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete supplier')
      throw err
    }
  }

  return {
    suppliers: readonly(suppliers),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier
  }
}
