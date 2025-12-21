/**
 * Service Layer Types
 *
 * These types define the contract for all entity services.
 * Using generics allows type-safe services for 46+ entities
 * while maintaining a consistent API.
 */

import type { ComputedRef, Ref } from 'vue'
import type { UseMutationReturnType } from '@tanstack/vue-query'

/**
 * Standard paginated response from backend
 * Matches backend PaginationResponse<T>
 */
export interface PaginatedResponse<T> {
  data: T[]
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

/**
 * Pagination info for UI components
 */
export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

/**
 * Base search params shared by all entities
 * Matches backend SearchFilter base class
 */
export interface BaseSearchParams {
  keyword?: string
  pageNumber?: number
  pageSize?: number
  orderBy?: string[]
  advancedFilter?: Record<string, unknown>
  advancedSearch?: {
    fields: string[]
    keyword: string
  }
}

/**
 * Service configuration for createEntityService factory
 */
export interface EntityServiceConfig<
  TDto,
  TSearchParams extends BaseSearchParams,
  TCreateRequest,
  TUpdateRequest
> {
  /** Entity name for query keys (must match queryKeys.ts) */
  entityName: string

  /** Search function from Orval generated API */
  searchFn: (params: TSearchParams) => Promise<PaginatedResponse<TDto>>

  /** Get single item function (optional) */
  getFn?: (id: string) => Promise<TDto>

  /** Create mutation hook from Orval */
  useCreate: () => UseMutationReturnType<string, unknown, { data: TCreateRequest }, unknown>

  /** Update mutation hook from Orval */
  useUpdate: () => UseMutationReturnType<string, unknown, { id: string; data: TUpdateRequest }, unknown>

  /** Delete mutation hook from Orval */
  useDelete: () => UseMutationReturnType<string, unknown, { id: string }, unknown>

  /** Cache stale time in ms (default: 30s) */
  staleTime?: number

  /** Cache garbage collection time in ms (default: 5min) */
  gcTime?: number

  /** Refetch on window focus (default: true) */
  refetchOnWindowFocus?: boolean

  /** Auto refetch interval in ms (default: false/disabled) */
  refetchInterval?: number | false
}

/**
 * Options passed when using a service
 */
export interface UseEntityServiceOptions<TSearchParams extends BaseSearchParams> {
  /** Initial search parameters */
  initialParams?: Partial<TSearchParams>

  /** Enable/disable the query */
  enabled?: boolean
}

/**
 * Return type of entity services
 * This is the unified API for all CRUD operations
 */
export interface EntityServiceReturn<
  TDto,
  TSearchParams extends BaseSearchParams,
  TCreateRequest,
  TUpdateRequest
> {
  // ============================================
  // DATA
  // ============================================

  /** Items from search result */
  items: ComputedRef<TDto[]>

  /** Pagination info */
  pagination: ComputedRef<PaginationInfo>

  /** Raw query data */
  data: ComputedRef<PaginatedResponse<TDto> | undefined>

  // ============================================
  // LOADING STATES
  // ============================================

  /** Initial loading state */
  isLoading: ComputedRef<boolean>

  /** Background refetching state */
  isFetching: ComputedRef<boolean>

  /** Any mutation in progress */
  isMutating: ComputedRef<boolean>

  /** Create mutation loading */
  isCreating: ComputedRef<boolean>

  /** Update mutation loading */
  isUpdating: ComputedRef<boolean>

  /** Delete mutation loading */
  isDeleting: ComputedRef<boolean>

  // ============================================
  // SEARCH PARAMS
  // ============================================

  /** Reactive search params */
  searchParams: Ref<TSearchParams>

  /** Set page number */
  setPage: (page: number) => void

  /** Set page size */
  setPageSize: (size: number) => void

  /** Set search keyword (resets to page 1) */
  setKeyword: (keyword: string) => void

  /** Set multiple filters at once (resets to page 1) */
  setFilters: (filters: Partial<TSearchParams>) => void

  /** Reset to default params */
  resetParams: () => void

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /** Create new item - auto invalidates cache */
  create: (data: TCreateRequest) => Promise<string>

  /** Update item - auto invalidates cache */
  update: (id: string, data: TUpdateRequest) => Promise<string>

  /** Delete item - auto invalidates cache */
  remove: (id: string) => Promise<string>

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  /** Manually invalidate all queries for this entity */
  invalidate: () => void

  /** Refetch current query */
  refetch: () => void

  /** Prefetch next page */
  prefetchNextPage: () => Promise<void>
}

/**
 * Simplified return type for services that only need search
 * (no create/update/delete)
 */
export interface ReadOnlyEntityServiceReturn<TDto, TSearchParams extends BaseSearchParams> {
  items: ComputedRef<TDto[]>
  pagination: ComputedRef<PaginationInfo>
  data: ComputedRef<PaginatedResponse<TDto> | undefined>
  isLoading: ComputedRef<boolean>
  isFetching: ComputedRef<boolean>
  searchParams: Ref<TSearchParams>
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setKeyword: (keyword: string) => void
  setFilters: (filters: Partial<TSearchParams>) => void
  resetParams: () => void
  invalidate: () => void
  refetch: () => void
  prefetchNextPage: () => Promise<void>
}
