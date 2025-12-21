// API Response Types

export interface ApiResponse<T = any> {
  data: T
  succeeded: boolean
  messages: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface ApiError {
  statusCode: number
  message: string
  errors?: Record<string, string[]>
}

export interface PaginationFilter {
  pageNumber?: number
  pageSize?: number
  orderBy?: string[]
  search?: string
}
