/**
 * Stocks Service
 *
 * Special service - read-only with adjust stock function
 */

import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/vue-query'
import {
  stocksSearch,
  stocksGet,
  useStocksAdjustStock,
} from '~/api/generated/endpoints/stocks/stocks'
import type {
  StockDto,
  SearchStocksRequest,
  AdjustStockRequest,
} from '~/api/generated/models'
import type { PaginationInfo } from '../_base/types'

export function useStocksService(options: { initialParams?: Partial<SearchStocksRequest> } = {}) {
  const queryClient = useQueryClient()

  // Default search params
  const searchParams = ref<SearchStocksRequest>({
    keyword: undefined,
    pageNumber: 1,
    pageSize: 10,
    ...options.initialParams,
  } as SearchStocksRequest)

  const queryKey = computed(() => ['stocks', 'list', toRaw(searchParams.value)] as const)

  // Main search query with caching
  const query = useQuery({
    queryKey,
    queryFn: () => stocksSearch(searchParams.value),
    staleTime: 15 * 1000, // 15 seconds - stock data changes frequently
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  })

  // Adjust stock mutation
  const adjustMutation = useStocksAdjustStock()

  // Computed
  const items = computed<StockDto[]>(() => query.data.value?.data ?? [])
  const pagination = computed<PaginationInfo>(() => ({
    currentPage: query.data.value?.currentPage ?? 1,
    totalPages: query.data.value?.totalPages ?? 1,
    totalCount: query.data.value?.totalCount ?? 0,
    pageSize: query.data.value?.pageSize ?? 10,
    hasPreviousPage: query.data.value?.hasPreviousPage ?? false,
    hasNextPage: query.data.value?.hasNextPage ?? false,
  }))
  const isLoading = computed(() => query.isLoading.value)
  const isFetching = computed(() => query.isFetching.value)
  const isMutating = computed(() => adjustMutation.isPending.value)

  // Param setters
  const setPage = (page: number) => { searchParams.value = { ...searchParams.value, pageNumber: page } }
  const setPageSize = (size: number) => { searchParams.value = { ...searchParams.value, pageSize: size, pageNumber: 1 } }
  const setKeyword = (keyword: string) => { searchParams.value = { ...searchParams.value, keyword: keyword || undefined, pageNumber: 1 } }
  const setFilters = (filters: Partial<SearchStocksRequest>) => { searchParams.value = { ...searchParams.value, ...filters, pageNumber: 1 } }

  // Cache invalidation
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['stocks'] })

  // Adjust stock quantity
  const adjustStock = async (data: AdjustStockRequest): Promise<string> => {
    const result = await adjustMutation.mutateAsync({ data })
    invalidate()
    return result
  }

  // Get single stock
  const getStock = (id: Ref<string>) => {
    return useQuery({
      queryKey: computed(() => ['stocks', 'detail', unref(id)] as const),
      queryFn: () => stocksGet(unref(id)),
      enabled: computed(() => !!unref(id)),
      staleTime: 15 * 1000,
    })
  }

  return {
    items,
    pagination,
    isLoading,
    isFetching,
    isMutating,
    searchParams,
    setPage,
    setPageSize,
    setKeyword,
    setFilters,
    adjustStock,
    getStock,
    invalidate,
  }
}

export type { StockDto, SearchStocksRequest, AdjustStockRequest }
