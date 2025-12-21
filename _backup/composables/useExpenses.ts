import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '~/types/expense'
import type { PaginatedResponse } from '~/types/api'

export const useExpenses = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const expenses = useState<Expense[]>('expenses', () => [])
  const isLoading = useState<boolean>('expenses-loading', () => false)
  const pagination = useState('expenses-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search expenses with filters
  const searchExpenses = async (params: {
    keyword?: string
    expenseTypeId?: string | null
    productId?: string | null
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<Expense>>('/api/v1/expenses/search', {
        keyword: params.keyword || '',
        expenseTypeId: params.expenseTypeId,
        productId: params.productId,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['expenseTypeName']
      })

      expenses.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load expenses')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single expense
  const getExpense = async (id: string) => {
    try {
      return await api.get<Expense>(`/api/v1/expenses/${id}`)
    } catch (err) {
      error('Failed to load expense')
      throw err
    }
  }

  // Create expense
  const createExpense = async (data: CreateExpenseRequest) => {
    try {
      const id = await api.post<string>('/api/v1/expenses', data)
      success('Expense created successfully')
      await searchExpenses({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create expense')
      throw err
    }
  }

  // Update expense
  const updateExpense = async (id: string, data: UpdateExpenseRequest) => {
    try {
      await api.put(`/api/v1/expenses/${id}`, data)
      success('Expense updated successfully')
      await searchExpenses({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update expense')
      throw err
    }
  }

  // Delete expense
  const deleteExpense = async (id: string) => {
    try {
      await api.delete(`/api/v1/expenses/${id}`)
      success('Expense deleted successfully')
      await searchExpenses({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete expense')
      throw err
    }
  }

  return {
    expenses: readonly(expenses),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchExpenses,
    getExpense,
    createExpense,
    updateExpense,
    deleteExpense
  }
}
