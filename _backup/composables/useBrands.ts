import type { Brand, CreateBrandRequest, UpdateBrandRequest } from '~/types/brand'
import type { PaginatedResponse } from '~/types/api'

export const useBrands = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const brands = useState<Brand[]>('brands', () => [])
  const isLoading = useState<boolean>('brands-loading', () => false)
  const pagination = useState('brands-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search brands
  const searchBrands = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<Brand>>('/api/v1/brands/search', {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['name']
      })

      brands.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load brands')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get all for dropdown (no pagination)
  const getAllBrands = async () => {
    try {
      const response = await api.post<PaginatedResponse<Brand>>('/api/v1/brands/search', {
        pageNumber: 1,
        pageSize: 1000,
        orderBy: ['name']
      })
      return response.data
    } catch (err) {
      error('Failed to load brands')
      throw err
    }
  }

  // Get single brand
  const getBrand = async (id: string) => {
    try {
      return await api.get<Brand>(`/api/v1/brands/${id}`)
    } catch (err) {
      error('Failed to load brand')
      throw err
    }
  }

  // Create brand
  const createBrand = async (data: CreateBrandRequest) => {
    try {
      const id = await api.post<string>('/api/v1/brands', data)
      success('Brand created successfully')
      await searchBrands({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create brand')
      throw err
    }
  }

  // Update brand
  const updateBrand = async (id: string, data: UpdateBrandRequest) => {
    try {
      await api.put(`/api/v1/brands/${id}`, data)
      success('Brand updated successfully')
      await searchBrands({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update brand')
      throw err
    }
  }

  // Delete brand
  const deleteBrand = async (id: string) => {
    try {
      await api.delete(`/api/v1/brands/${id}`)
      success('Brand deleted successfully')
      await searchBrands({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete brand')
      throw err
    }
  }

  return {
    brands: readonly(brands),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchBrands,
    getAllBrands,
    getBrand,
    createBrand,
    updateBrand,
    deleteBrand
  }
}
