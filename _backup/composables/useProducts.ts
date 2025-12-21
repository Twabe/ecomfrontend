import type { Product, CreateProductRequest, UpdateProductRequest, ExportProductsRequest } from '~/types/product'
import type { PaginatedResponse } from '~/types/api'

export const useProducts = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const products = useState<Product[]>('products', () => [])
  const isLoading = useState<boolean>('products-loading', () => false)
  const pagination = useState('products-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search products
  const searchProducts = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
    brandId?: string
  } = {}) => {
    isLoading.value = true
    try {
      const body: Record<string, unknown> = {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['name']
      }

      if (params.brandId) {
        body.advancedFilter = {
          logic: 'and',
          filters: [{ field: 'brandId', operator: 'eq', value: params.brandId }]
        }
      }

      const response = await api.post<PaginatedResponse<Product>>('/api/v1/products/search', body)

      products.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load products')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single product
  const getProduct = async (id: string) => {
    try {
      return await api.get<Product>(`/api/v1/products/${id}`)
    } catch (err) {
      error('Failed to load product')
      throw err
    }
  }

  // Create product
  const createProduct = async (data: CreateProductRequest) => {
    try {
      const id = await api.post<string>('/api/v1/products', data)
      success('Product created successfully')
      await searchProducts({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create product')
      throw err
    }
  }

  // Update product
  const updateProduct = async (id: string, data: UpdateProductRequest) => {
    try {
      await api.put(`/api/v1/products/${id}`, data)
      success('Product updated successfully')
      await searchProducts({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update product')
      throw err
    }
  }

  // Delete product
  const deleteProduct = async (id: string) => {
    try {
      await api.delete(`/api/v1/products/${id}`)
      success('Product deleted successfully')
      await searchProducts({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete product')
      throw err
    }
  }

  // Get product via Dapper (fast query)
  const getProductDapper = async (id: string) => {
    try {
      return await api.get<Product>(`/api/v1/products/dapper?id=${id}`)
    } catch (err) {
      error('Failed to load product')
      throw err
    }
  }

  // Export products to file
  const exportProducts = async (params: ExportProductsRequest = {}) => {
    try {
      const response = await api.post<Blob>('/api/v1/products/export', params, {
        responseType: 'blob'
      })
      return response
    } catch (err) {
      error('Failed to export products')
      throw err
    }
  }

  return {
    products: readonly(products),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchProducts,
    getProduct,
    getProductDapper,
    createProduct,
    updateProduct,
    deleteProduct,
    exportProducts
  }
}
