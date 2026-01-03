/**
 * Stocks Service
 *
 * Full CRUD service with adjust stock and add with cost functions
 */

import { useQuery, useQueryClient, useMutation, keepPreviousData } from '@tanstack/vue-query'
import {
  stocksSearch,
  stocksGet,
  useStocksAdjustStock,
} from '~/api/generated/endpoints/stocks/stocks'
import { customInstance } from '~/api/axios-instance'
import type {
  StockDto,
  SearchStocksRequest,
  AdjustStockRequest,
} from '~/api/generated/models'
import type { PaginationInfo } from '../_base/types'

// Request types for CRUD operations
export interface CreateStockRequest {
  productId: string
  productVariantId?: string | null
  quantity: number
  brokenQuantity?: number
  details?: string | null
  deliveryCompanyId?: string | null
  totalValue?: number
}

export interface UpdateStockRequest {
  id: string
  productId?: string
  quantity?: number
  brokenQuantity?: number
  details?: string | null
  deliveryCompanyId?: string | null
}

export interface AddStockWithCostRequest {
  quantityToAdd: number
  unitCost: number
}

// Custom API functions (until API is regenerated)
const stocksCreate = (data: CreateStockRequest) => {
  return customInstance<string>({
    url: '/api/v1/stocks',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

const stocksUpdate = (id: string, data: UpdateStockRequest) => {
  return customInstance<string>({
    url: `/api/v1/stocks/${id}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

const stocksDelete = (id: string) => {
  return customInstance<string>({
    url: `/api/v1/stocks/${id}`,
    method: 'DELETE'
  })
}

const stocksAddWithCost = (id: string, data: AddStockWithCostRequest) => {
  return customInstance<string>({
    url: `/api/v1/stocks/${id}/add-with-cost`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

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

  // Mutations
  const adjustMutation = useStocksAdjustStock()
  const createMutation = useMutation({ mutationFn: (data: CreateStockRequest) => stocksCreate(data) })
  const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: string, data: UpdateStockRequest }) => stocksUpdate(id, data) })
  const deleteMutation = useMutation({ mutationFn: (id: string) => stocksDelete(id) })
  const addWithCostMutation = useMutation({ mutationFn: ({ id, data }: { id: string, data: AddStockWithCostRequest }) => stocksAddWithCost(id, data) })

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
  const isMutating = computed(() =>
    adjustMutation.isPending.value ||
    createMutation.isPending.value ||
    updateMutation.isPending.value ||
    deleteMutation.isPending.value ||
    addWithCostMutation.isPending.value
  )
  const isCreating = computed(() => createMutation.isPending.value)
  const isUpdating = computed(() => updateMutation.isPending.value)
  const isDeleting = computed(() => deleteMutation.isPending.value)

  // Param setters
  const setPage = (page: number) => { searchParams.value = { ...searchParams.value, pageNumber: page } }
  const setPageSize = (size: number) => { searchParams.value = { ...searchParams.value, pageSize: size, pageNumber: 1 } }
  const setKeyword = (keyword: string) => { searchParams.value = { ...searchParams.value, keyword: keyword || undefined, pageNumber: 1 } }
  const setFilters = (filters: Partial<SearchStocksRequest>) => { searchParams.value = { ...searchParams.value, ...filters, pageNumber: 1 } }

  // Cache invalidation
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['stocks'] })

  // CRUD operations
  const create = async (data: CreateStockRequest): Promise<string> => {
    const result = await createMutation.mutateAsync(data)
    invalidate()
    return result
  }

  const update = async (id: string, data: UpdateStockRequest): Promise<string> => {
    const result = await updateMutation.mutateAsync({ id, data })
    invalidate()
    return result
  }

  const remove = async (id: string): Promise<string> => {
    const result = await deleteMutation.mutateAsync(id)
    invalidate()
    return result
  }

  // Adjust stock quantity
  const adjustStock = async (data: AdjustStockRequest): Promise<string> => {
    const result = await adjustMutation.mutateAsync({ data })
    invalidate()
    return result
  }

  // Add stock with cost tracking
  const addStockWithCost = async (id: string, data: AddStockWithCostRequest): Promise<string> => {
    const result = await addWithCostMutation.mutateAsync({ id, data })
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
    isCreating,
    isUpdating,
    isDeleting,
    searchParams,
    setPage,
    setPageSize,
    setKeyword,
    setFilters,
    create,
    update,
    remove,
    adjustStock,
    addStockWithCost,
    getStock,
    invalidate,
  }
}

export type { StockDto, SearchStocksRequest, AdjustStockRequest }
