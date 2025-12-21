import type { ExpenseType, CreateExpenseTypeRequest, UpdateExpenseTypeRequest } from '~/types/expensetype'
import type { PaginatedResponse } from '~/types/api'

export const useExpenseTypes = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const expenseTypes = useState<ExpenseType[]>('expenseTypes', () => [])
  const isLoading = useState<boolean>('expenseTypes-loading', () => false)
  const pagination = useState('expenseTypes-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search expense types
  const searchExpenseTypes = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<ExpenseType>>('/api/v1/expensetypes/search', {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['title']
      })

      expenseTypes.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load expense types')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single expense type
  const getExpenseType = async (id: string) => {
    try {
      return await api.get<ExpenseType>(`/api/v1/expensetypes/${id}`)
    } catch (err) {
      error('Failed to load expense type')
      throw err
    }
  }

  // Create expense type
  const createExpenseType = async (data: CreateExpenseTypeRequest) => {
    try {
      const id = await api.post<string>('/api/v1/expensetypes', data)
      success('Expense type created successfully')
      await searchExpenseTypes({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create expense type')
      throw err
    }
  }

  // Update expense type
  const updateExpenseType = async (id: string, data: UpdateExpenseTypeRequest) => {
    try {
      await api.put(`/api/v1/expensetypes/${id}`, data)
      success('Expense type updated successfully')
      await searchExpenseTypes({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update expense type')
      throw err
    }
  }

  // Delete expense type
  const deleteExpenseType = async (id: string) => {
    try {
      await api.delete(`/api/v1/expensetypes/${id}`)
      success('Expense type deleted successfully')
      await searchExpenseTypes({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete expense type')
      throw err
    }
  }

  return {
    expenseTypes: readonly(expenseTypes),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchExpenseTypes,
    getExpenseType,
    createExpenseType,
    updateExpenseType,
    deleteExpenseType
  }
}
