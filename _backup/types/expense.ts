// Expense types - for tracking business expenses

export interface Expense {
  id: string
  cost: number
  productId: string | null
  productName: string | null
  expenseTypeId: string
  expenseTypeName: string
  nature: string | null
  description: string | null
  attachments: string | null
}

export interface CreateExpenseRequest {
  expenseTypeId: string    // Required
  cost: number             // Must be > 0
  productId?: string | null
  nature?: string | null
  description?: string | null
  attachments?: string | null
}

export interface UpdateExpenseRequest {
  id: string
  expenseTypeId: string
  cost: number
  productId?: string | null
  nature?: string | null
  description?: string | null
  attachments?: string | null
}
