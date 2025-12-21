/**
 * Stock Transactions Service
 *
 * Read-only service - stock transactions are created automatically
 * by the system when stock adjustments occur
 */

import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/vue-query'
import {
  stockTransactionsSearch,
  stockTransactionsGet,
} from '~/api/generated/endpoints/stock-transactions/stock-transactions'
import type {
  StockTransactionDto,
  SearchStockTransactionsRequest,
} from '~/api/generated/models'
import type { PaginationInfo } from '../_base/types'

export function useStockTransactionsService(options: { initialParams?: Partial<SearchStockTransactionsRequest> } = {}) {
  const queryClient = useQueryClient()

  // Default search params
  const searchParams = ref<SearchStockTransactionsRequest>({
    keyword: undefined,
    pageNumber: 1,
    pageSize: 10,
    ...options.initialParams,
  } as SearchStockTransactionsRequest)

  const queryKey = computed(() => ['stockTransactions', 'list', toRaw(searchParams.value)] as const)

  // Main search query with caching
  const query = useQuery({
    queryKey,
    queryFn: () => stockTransactionsSearch(searchParams.value),
    staleTime: 15 * 1000, // 15 seconds - transaction data updates frequently
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  })

  // Computed
  const items = computed<StockTransactionDto[]>(() => query.data.value?.data ?? [])
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

  // Param setters
  const setPage = (page: number) => { searchParams.value = { ...searchParams.value, pageNumber: page } }
  const setPageSize = (size: number) => { searchParams.value = { ...searchParams.value, pageSize: size, pageNumber: 1 } }
  const setKeyword = (keyword: string) => { searchParams.value = { ...searchParams.value, keyword: keyword || undefined, pageNumber: 1 } }
  const setFilters = (filters: Partial<SearchStockTransactionsRequest>) => { searchParams.value = { ...searchParams.value, ...filters, pageNumber: 1 } }

  // Cache invalidation
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['stockTransactions'] })

  // Get single transaction
  const getTransaction = (id: Ref<string>) => {
    return useQuery({
      queryKey: computed(() => ['stockTransactions', 'detail', unref(id)] as const),
      queryFn: () => stockTransactionsGet(unref(id)),
      enabled: computed(() => !!unref(id)),
      staleTime: 15 * 1000,
    })
  }

  return {
    items,
    pagination,
    isLoading,
    isFetching,
    searchParams,
    setPage,
    setPageSize,
    setKeyword,
    setFilters,
    getTransaction,
    invalidate,
  }
}

export type { StockTransactionDto, SearchStockTransactionsRequest }
