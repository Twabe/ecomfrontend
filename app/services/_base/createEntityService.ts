/**
 * Entity Service Factory
 *
 * Creates type-safe CRUD services with Vue Query caching.
 * This factory eliminates 70% of boilerplate code in pages.
 *
 * Features:
 * - Automatic caching for search (POST → useQuery)
 * - Cache invalidation on mutations
 * - Reactive search params
 * - Prefetch support
 * - Type-safe throughout
 *
 * @example
 * ```typescript
 * export const useBrandsService = createEntityService<
 *   BrandDto,
 *   SearchBrandsRequest,
 *   CreateBrandRequest,
 *   UpdateBrandRequest
 * >({
 *   entityName: 'brands',
 *   searchFn: brandsSearch,
 *   useCreate: useBrandsCreate,
 *   useUpdate: useBrandsUpdate,
 *   useDelete: useBrandsDelete,
 * })
 * ```
 */

import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/vue-query'
import { queryKeys, type EntityName } from './queryKeys'
import type {
  BaseSearchParams,
  PaginatedResponse,
  PaginationInfo,
  EntityServiceConfig,
  EntityServiceReturn,
  UseEntityServiceOptions,
} from './types'

/**
 * Default search parameters
 */
const DEFAULT_PARAMS: BaseSearchParams = {
  keyword: undefined,
  pageNumber: 1,
  pageSize: 10,
  orderBy: undefined,
  advancedFilter: undefined,
}

/**
 * Creates an entity service with full CRUD operations
 *
 * @param config - Service configuration
 * @returns A composable function that provides CRUD operations
 */
export function createEntityService<
  TDto,
  TSearchParams extends BaseSearchParams,
  TCreateRequest,
  TUpdateRequest
>(
  config: EntityServiceConfig<TDto, TSearchParams, TCreateRequest, TUpdateRequest>
) {
  /**
   * The actual composable returned by the factory
   */
  return function useEntityService(
    options: UseEntityServiceOptions<TSearchParams> = {}
  ): EntityServiceReturn<TDto, TSearchParams, TCreateRequest, TUpdateRequest> {
    const queryClient = useQueryClient()

    // Get query keys for this entity
    const keys = queryKeys[config.entityName as EntityName]

    // Default search params with overrides
    const defaultParams = {
      ...DEFAULT_PARAMS,
      ...options.initialParams,
    } as TSearchParams

    // Reactive search params
    const searchParams = ref<TSearchParams>({ ...defaultParams })

    // Query key that includes params for proper cache separation
    const queryKey = computed(() => keys.list(toRaw(searchParams.value)))

    // Main search query with caching
    const query = useQuery({
      queryKey,
      queryFn: () => config.searchFn(searchParams.value),
      staleTime: config.staleTime ?? 30 * 1000, // 30 seconds default
      gcTime: config.gcTime ?? 5 * 60 * 1000, // 5 minutes default
      refetchOnWindowFocus: config.refetchOnWindowFocus ?? true,
      refetchInterval: config.refetchInterval ?? false,
      placeholderData: keepPreviousData, // Keep showing old data while fetching new
      enabled: options.enabled ?? true,
    })

    // Mutations from Orval generated hooks
    const createMutation = config.useCreate()
    const updateMutation = config.useUpdate()
    const deleteMutation = config.useDelete()

    // ============================================
    // COMPUTED DATA
    // ============================================

    const items = computed<TDto[]>(() => query.data.value?.data ?? [])

    const pagination = computed<PaginationInfo>(() => ({
      currentPage: query.data.value?.currentPage ?? 1,
      totalPages: query.data.value?.totalPages ?? 1,
      totalCount: query.data.value?.totalCount ?? 0,
      pageSize: query.data.value?.pageSize ?? 10,
      hasPreviousPage: query.data.value?.hasPreviousPage ?? false,
      hasNextPage: query.data.value?.hasNextPage ?? false,
    }))

    const data = computed(() => query.data.value)

    // ============================================
    // LOADING STATES
    // ============================================

    const isLoading = computed(() => query.isLoading.value)
    const isFetching = computed(() => query.isFetching.value)
    const isCreating = computed(() => createMutation.isPending.value)
    const isUpdating = computed(() => updateMutation.isPending.value)
    const isDeleting = computed(() => deleteMutation.isPending.value)
    const isMutating = computed(
      () => isCreating.value || isUpdating.value || isDeleting.value
    )

    // ============================================
    // PARAM SETTERS
    // ============================================

    const setPage = (page: number) => {
      searchParams.value = { ...searchParams.value, pageNumber: page }
    }

    const setPageSize = (size: number) => {
      searchParams.value = {
        ...searchParams.value,
        pageSize: size,
        pageNumber: 1, // Reset to first page
      }
    }

    const setKeyword = (keyword: string) => {
      searchParams.value = {
        ...searchParams.value,
        keyword: keyword || undefined,
        pageNumber: 1, // Reset to first page
      }
    }

    const setFilters = (filters: Partial<TSearchParams>) => {
      searchParams.value = {
        ...searchParams.value,
        ...filters,
        pageNumber: 1, // Reset to first page
      }
    }

    const resetParams = () => {
      searchParams.value = { ...defaultParams }
    }

    // ============================================
    // CACHE MANAGEMENT
    // ============================================

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: keys.all() })
    }

    const refetch = () => {
      query.refetch()
    }

    const prefetchNextPage = async () => {
      const currentParams = searchParams.value
      const nextPage = (currentParams.pageNumber || 1) + 1
      const totalPages = query.data.value?.totalPages || 1

      if (nextPage <= totalPages) {
        const nextParams = { ...currentParams, pageNumber: nextPage }
        await queryClient.prefetchQuery({
          queryKey: keys.list(nextParams),
          queryFn: () => config.searchFn(nextParams as TSearchParams),
          staleTime: config.staleTime ?? 30 * 1000,
        })
      }
    }

    // ============================================
    // CRUD OPERATIONS
    // ============================================

    const create = async (data: TCreateRequest): Promise<string> => {
      const result = await createMutation.mutateAsync({ data })
      invalidate() // Auto-invalidate cache
      return result
    }

    const update = async (id: string, data: TUpdateRequest): Promise<string> => {
      const result = await updateMutation.mutateAsync({ id, data })
      invalidate() // Auto-invalidate cache
      return result
    }

    const remove = async (id: string): Promise<string> => {
      const result = await deleteMutation.mutateAsync({ id })
      invalidate() // Auto-invalidate cache
      return result
    }

    // ============================================
    // RETURN
    // ============================================

    return {
      // Data
      items,
      pagination,
      data,

      // Loading states
      isLoading,
      isFetching,
      isMutating,
      isCreating,
      isUpdating,
      isDeleting,

      // Search params
      searchParams,
      setPage,
      setPageSize,
      setKeyword,
      setFilters,
      resetParams,

      // CRUD
      create,
      update,
      remove,

      // Cache
      invalidate,
      refetch,
      prefetchNextPage,
    }
  }
}

/**
 * Creates a read-only service (search only, no mutations)
 * Useful for dropdowns, selects, and display-only data
 */
export function createReadOnlyService<TDto, TSearchParams extends BaseSearchParams>(
  config: Pick<
    EntityServiceConfig<TDto, TSearchParams, never, never>,
    'entityName' | 'searchFn' | 'staleTime' | 'gcTime' | 'refetchOnWindowFocus' | 'refetchInterval'
  >
) {
  return function useReadOnlyService(
    options: UseEntityServiceOptions<TSearchParams> = {}
  ) {
    const queryClient = useQueryClient()
    const keys = queryKeys[config.entityName as EntityName]

    const defaultParams = {
      ...DEFAULT_PARAMS,
      ...options.initialParams,
    } as TSearchParams

    const searchParams = ref<TSearchParams>({ ...defaultParams })
    const queryKey = computed(() => keys.list(toRaw(searchParams.value)))

    const query = useQuery({
      queryKey,
      queryFn: () => config.searchFn(searchParams.value),
      staleTime: config.staleTime ?? 30 * 1000,
      gcTime: config.gcTime ?? 5 * 60 * 1000,
      refetchOnWindowFocus: config.refetchOnWindowFocus ?? true,
      refetchInterval: config.refetchInterval ?? false,
      placeholderData: keepPreviousData,
      enabled: options.enabled ?? true,
    })

    const items = computed<TDto[]>(() => query.data.value?.data ?? [])

    const pagination = computed<PaginationInfo>(() => ({
      currentPage: query.data.value?.currentPage ?? 1,
      totalPages: query.data.value?.totalPages ?? 1,
      totalCount: query.data.value?.totalCount ?? 0,
      pageSize: query.data.value?.pageSize ?? 10,
      hasPreviousPage: query.data.value?.hasPreviousPage ?? false,
      hasNextPage: query.data.value?.hasNextPage ?? false,
    }))

    return {
      items,
      pagination,
      data: computed(() => query.data.value),
      isLoading: computed(() => query.isLoading.value),
      isFetching: computed(() => query.isFetching.value),
      searchParams,
      setPage: (page: number) => {
        searchParams.value = { ...searchParams.value, pageNumber: page }
      },
      setPageSize: (size: number) => {
        searchParams.value = { ...searchParams.value, pageSize: size, pageNumber: 1 }
      },
      setKeyword: (keyword: string) => {
        searchParams.value = { ...searchParams.value, keyword: keyword || undefined, pageNumber: 1 }
      },
      setFilters: (filters: Partial<TSearchParams>) => {
        searchParams.value = { ...searchParams.value, ...filters, pageNumber: 1 }
      },
      resetParams: () => {
        searchParams.value = { ...defaultParams }
      },
      invalidate: () => queryClient.invalidateQueries({ queryKey: keys.all() }),
      refetch: () => query.refetch(),
      prefetchNextPage: async () => {
        const currentParams = searchParams.value
        const nextPage = (currentParams.pageNumber || 1) + 1
        const totalPages = query.data.value?.totalPages || 1
        if (nextPage <= totalPages) {
          const nextParams = { ...currentParams, pageNumber: nextPage }
          await queryClient.prefetchQuery({
            queryKey: keys.list(nextParams),
            queryFn: () => config.searchFn(nextParams as TSearchParams),
            staleTime: config.staleTime ?? 30 * 1000,
          })
        }
      },
    }
  }
}
