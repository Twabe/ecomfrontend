/**
 * Delivery Companies Service
 * Extended with updateCredentials and updatePaymentTerms
 */

import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/vue-query'
import {
  deliveryCompaniesSearch,
  useDeliveryCompaniesCreate,
  useDeliveryCompaniesUpdate,
  useDeliveryCompaniesDelete,
  useDeliveryCompaniesUpdateCredentials,
  useDeliveryCompaniesUpdatePaymentTerms,
} from '~/api/generated/endpoints/delivery-companies/delivery-companies'
import type {
  DeliveryCompanyDto,
  SearchDeliveryCompaniesRequest,
  CreateDeliveryCompanyRequest,
  UpdateDeliveryCompanyRequest,
  UpdateCredentialsRequest,
  UpdatePaymentTermsRequest,
} from '~/api/generated/models'
import { queryKeys } from '../_base/queryKeys'

// Extended service with custom mutations
export const useDeliveryCompaniesService = () => {
  const queryClient = useQueryClient()

  // Search params
  const searchParams = ref<SearchDeliveryCompaniesRequest>({
    pageNumber: 1,
    pageSize: 10,
  })

  // Query key
  const queryKey = computed(() => queryKeys.deliveryCompanies.list(toRaw(searchParams.value)))

  // Search query
  const query = useQuery({
    queryKey,
    queryFn: () => deliveryCompaniesSearch(searchParams.value),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })

  // CRUD mutations
  const createMutation = useDeliveryCompaniesCreate()
  const updateMutation = useDeliveryCompaniesUpdate()
  const deleteMutation = useDeliveryCompaniesDelete()

  // Custom mutations
  const updateCredentialsMutation = useDeliveryCompaniesUpdateCredentials({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.deliveryCompanies.all })
      },
    },
  })

  const updatePaymentTermsMutation = useDeliveryCompaniesUpdatePaymentTerms({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.deliveryCompanies.all })
      },
    },
  })

  // Computed data
  const items = computed<DeliveryCompanyDto[]>(() => query.data.value?.data ?? [])
  const pagination = computed(() => ({
    currentPage: query.data.value?.currentPage ?? 1,
    totalPages: query.data.value?.totalPages ?? 1,
    totalCount: query.data.value?.totalCount ?? 0,
    pageSize: query.data.value?.pageSize ?? 10,
    hasPreviousPage: query.data.value?.hasPreviousPage ?? false,
    hasNextPage: query.data.value?.hasNextPage ?? false,
  }))

  // Loading states
  const isLoading = computed(() => query.isLoading.value)
  const isFetching = computed(() => query.isFetching.value)
  const isCreating = computed(() => createMutation.isPending.value)
  const isUpdating = computed(() => updateMutation.isPending.value)
  const isDeleting = computed(() => deleteMutation.isPending.value)
  const isMutating = computed(() => isCreating.value || isUpdating.value || isDeleting.value)

  // Param setters
  const setPage = (page: number) => {
    searchParams.value = { ...searchParams.value, pageNumber: page }
  }

  const setPageSize = (size: number) => {
    searchParams.value = { ...searchParams.value, pageSize: size, pageNumber: 1 }
  }

  const setKeyword = (keyword: string) => {
    searchParams.value = { ...searchParams.value, keyword: keyword || undefined, pageNumber: 1 }
  }

  const setFilters = (filters: Partial<SearchDeliveryCompaniesRequest>) => {
    searchParams.value = { ...searchParams.value, ...filters, pageNumber: 1 }
  }

  // Cache management
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.deliveryCompanies.all })
  const refetch = () => query.refetch()

  // CRUD operations
  const create = async (data: CreateDeliveryCompanyRequest): Promise<string> => {
    const result = await createMutation.mutateAsync({ data })
    invalidate()
    return result
  }

  const update = async (id: string, data: UpdateDeliveryCompanyRequest): Promise<string> => {
    const result = await updateMutation.mutateAsync({ id, data })
    invalidate()
    return result
  }

  const remove = async (id: string): Promise<string> => {
    const result = await deleteMutation.mutateAsync({ id })
    invalidate()
    return result
  }

  // Custom operations
  const updateCredentials = async (id: string, data: UpdateCredentialsRequest) => {
    return updateCredentialsMutation.mutateAsync({ id, data })
  }

  const updatePaymentTerms = async (id: string, data: UpdatePaymentTermsRequest) => {
    return updatePaymentTermsMutation.mutateAsync({ id, data })
  }

  return {
    // Data
    items,
    pagination,
    data: computed(() => query.data.value),

    // Loading states
    isLoading,
    isFetching,
    isMutating,
    isCreating,
    isUpdating,
    isDeleting,
    isUpdatingCredentials: updateCredentialsMutation.isPending,
    isUpdatingPaymentTerms: updatePaymentTermsMutation.isPending,

    // Search params
    searchParams,
    setPage,
    setPageSize,
    setKeyword,
    setFilters,

    // CRUD
    create,
    update,
    remove,

    // Custom
    updateCredentials,
    updatePaymentTerms,

    // Cache
    invalidate,
    refetch,
  }
}

export type { DeliveryCompanyDto, CreateDeliveryCompanyRequest, UpdateDeliveryCompanyRequest, UpdateCredentialsRequest, UpdatePaymentTermsRequest }
