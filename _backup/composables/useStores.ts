import type { Store, CreateStoreRequest, UpdateStoreRequest } from '~/types/store'
import type { PaginatedResponse } from '~/types/api'

export const useStores = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const stores = useState<Store[]>('stores', () => [])
  const isLoading = useState<boolean>('stores-loading', () => false)
  const pagination = useState('stores-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search stores
  const searchStores = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<Store>>('/api/v1/stores/search', {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['name']
      })

      stores.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load stores')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get all for dropdown (no pagination)
  const getAllStores = async () => {
    try {
      const response = await api.post<PaginatedResponse<Store>>('/api/v1/stores/search', {
        pageNumber: 1,
        pageSize: 1000,
        orderBy: ['name']
      })
      return response.data
    } catch (err) {
      error('Failed to load stores')
      throw err
    }
  }

  // Get single store
  const getStore = async (id: string) => {
    try {
      return await api.get<Store>(`/api/v1/stores/${id}`)
    } catch (err) {
      error('Failed to load store')
      throw err
    }
  }

  // Create store
  const createStore = async (data: CreateStoreRequest) => {
    try {
      const id = await api.post<string>('/api/v1/stores', data)
      success('Store created successfully')
      await searchStores({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create store')
      throw err
    }
  }

  // Update store
  const updateStore = async (id: string, data: UpdateStoreRequest) => {
    try {
      await api.put(`/api/v1/stores/${id}`, data)
      success('Store updated successfully')
      await searchStores({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update store')
      throw err
    }
  }

  // Delete store
  const deleteStore = async (id: string) => {
    try {
      await api.delete(`/api/v1/stores/${id}`)
      success('Store deleted successfully')
      await searchStores({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete store')
      throw err
    }
  }

  return {
    stores: readonly(stores),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchStores,
    getAllStores,
    getStore,
    createStore,
    updateStore,
    deleteStore
  }
}
