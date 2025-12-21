export interface ExpenseType {
  id: string
  title: string
}

export interface CreateExpenseTypeRequest {
  title: string
}

export interface UpdateExpenseTypeRequest {
  id: string
  title: string
}
