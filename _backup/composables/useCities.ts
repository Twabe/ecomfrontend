import type { City, CreateCityRequest, UpdateCityRequest } from '~/types/city'
import type { PaginatedResponse } from '~/types/api'

export const useCities = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const cities = useState<City[]>('cities', () => [])
  const isLoading = useState<boolean>('cities-loading', () => false)
  const pagination = useState('cities-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search cities
  const searchCities = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<City>>('/api/v1/cities/search', {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['name']
      })

      cities.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load cities')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get all for dropdown (no pagination)
  const getAllCities = async () => {
    try {
      const response = await api.post<PaginatedResponse<City>>('/api/v1/cities/search', {
        pageNumber: 1,
        pageSize: 1000,
        orderBy: ['name']
      })
      return response.data
    } catch (err) {
      error('Failed to load cities')
      throw err
    }
  }

  // Get single city
  const getCity = async (id: string) => {
    try {
      return await api.get<City>(`/api/v1/cities/${id}`)
    } catch (err) {
      error('Failed to load city')
      throw err
    }
  }

  // Create city
  const createCity = async (data: CreateCityRequest) => {
    try {
      const id = await api.post<string>('/api/v1/cities', data)
      success('City created successfully')
      await searchCities({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create city')
      throw err
    }
  }

  // Update city
  const updateCity = async (id: string, data: UpdateCityRequest) => {
    try {
      await api.put(`/api/v1/cities/${id}`, data)
      success('City updated successfully')
      await searchCities({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update city')
      throw err
    }
  }

  // Delete city
  const deleteCity = async (id: string) => {
    try {
      await api.delete(`/api/v1/cities/${id}`)
      success('City deleted successfully')
      await searchCities({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete city')
      throw err
    }
  }

  return {
    cities: readonly(cities),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchCities,
    getAllCities,
    getCity,
    createCity,
    updateCity,
    deleteCity
  }
}
