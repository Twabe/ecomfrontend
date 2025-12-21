import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'

/**
 * Professional wrapper that converts POST search mutations into cached queries
 *
 * Benefits:
 * - Automatic caching (no duplicate requests)
 * - Background refetch on window focus
 * - Stale-while-revalidate pattern
 * - Request deduplication
 * - Optimistic updates support
 *
 * @example
 * const { items, pagination, isLoading, search } = useSearchQuery({
 *   queryKey: ['brands'],
 *   searchFn: brandsSearch,
 *   params: () => ({ keyword: searchKeyword.value, pageNumber: page.value, pageSize: 10 })
 * })
 */

export interface SearchParams {
  keyword?: string
  pageNumber?: number
  pageSize?: number
  orderBy?: string[]
  advancedFilter?: Record<string, unknown>
  advancedSearch?: {
    fields: string[]
    keyword: string
  }
  [key: string]: unknown
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

export interface UseSearchQueryOptions<TData, TParams extends SearchParams = SearchParams> {
  /**
   * Unique key for this search query (e.g., ['brands'])
   */
  queryKey: MaybeRef<readonly unknown[]>

  /**
   * The search function from generated API
   */
  searchFn: (params: { data: TParams }) => Promise<PaginatedResponse<TData>>

  /**
   * Reactive params function
   */
  params: () => TParams

  /**
   * Enable/disable query
   */
  enabled?: MaybeRef<boolean>

  /**
   * Stale time in ms (default: 30s)
   */
  staleTime?: number

  /**
   * Cache time in ms (default: 5min)
   */
  gcTime?: number

  /**
   * Refetch on window focus (default: true)
   */
  refetchOnWindowFocus?: boolean

  /**
   * Refetch interval in ms (for real-time data)
   */
  refetchInterval?: number | false
}

export function useSearchQuery<TData, TParams extends SearchParams = SearchParams>(
  options: UseSearchQueryOptions<TData, TParams>
) {
  const queryClient = useQueryClient()

  // Create reactive query key that includes search params
  const fullQueryKey = computed(() => {
    const baseKey = toValue(options.queryKey)
    const currentParams = options.params()
    return [...baseKey, 'search', currentParams]
  })

  const query = useQuery({
    queryKey: fullQueryKey,
    queryFn: async () => {
      const params = options.params()
      return await options.searchFn({ data: params })
    },
    enabled: toValue(options.enabled) ?? true,
    staleTime: options.staleTime ?? 30 * 1000,
    gcTime: options.gcTime ?? 5 * 60 * 1000,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? true,
    refetchInterval: options.refetchInterval ?? false,
    placeholderData: keepPreviousData,
  })

  // Invalidate all searches for this entity
  const invalidate = () => {
    const baseKey = toValue(options.queryKey)
    queryClient.invalidateQueries({ queryKey: baseKey })
  }

  // Prefetch next page
  const prefetchNextPage = async () => {
    const currentParams = options.params()
    const nextPage = (currentParams.pageNumber || 1) + 1
    const totalPages = query.data.value?.totalPages || 1

    if (nextPage <= totalPages) {
      const baseKey = toValue(options.queryKey)
      const nextParams = { ...currentParams, pageNumber: nextPage }

      await queryClient.prefetchQuery({
        queryKey: [...baseKey, 'search', nextParams],
        queryFn: () => options.searchFn({ data: nextParams as TParams }),
        staleTime: options.staleTime ?? 30 * 1000,
      })
    }
  }

  return {
    // Raw query state
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
    isPending: query.isPending,
    isRefetching: query.isRefetching,

    // Actions
    refetch: query.refetch,
    invalidate,
    prefetchNextPage,

    // Convenient computed helpers
    items: computed(() => query.data.value?.data ?? []),
    pagination: computed(() => ({
      currentPage: query.data.value?.currentPage ?? 1,
      totalPages: query.data.value?.totalPages ?? 1,
      totalCount: query.data.value?.totalCount ?? 0,
      pageSize: query.data.value?.pageSize ?? 10,
      hasPreviousPage: query.data.value?.hasPreviousPage ?? false,
      hasNextPage: query.data.value?.hasNextPage ?? false,
    })),
  }
}

/**
 * Hook to invalidate search queries after mutations
 * Use this in pages to refresh data after create/update/delete
 */
export function useInvalidateSearch() {
  const queryClient = useQueryClient()

  return {
    invalidate: (queryKey: readonly unknown[]) => {
      queryClient.invalidateQueries({ queryKey })
    },
    invalidateAll: () => {
      queryClient.invalidateQueries()
    }
  }
}
