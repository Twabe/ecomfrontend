/**
 * SKU Mappings Service
 *
 * Provides CRUD operations for mapping external platform SKUs to internal products/variants.
 * Used to link SKUs from YouCan, Shopify, WooCommerce to your internal product catalog.
 */

import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query'
import { createEntityService } from '../_base/createEntityService'
import { queryKeys } from '../_base/queryKeys'
import {
  skuMappingsSearch,
  skuMappingsLookup,
  skuMappingsBulkCreate,
  useSkuMappingsCreate,
  useSkuMappingsUpdate,
  useSkuMappingsDelete,
} from '~/api/generated/endpoints/sku-mappings/sku-mappings'
import type {
  SkuMappingDto,
  SearchSkuMappingsRequest,
  CreateSkuMappingRequest,
  UpdateSkuMappingRequest,
  SkuMappingsLookupParams,
  SkuMappingLookupResult,
  BulkCreateSkuMappingsRequest,
  BulkCreateSkuMappingsResult,
} from '~/api/generated/models'

/**
 * Main SkuMappings service with full CRUD operations
 */
export const useSkuMappingsService = createEntityService<
  SkuMappingDto,
  SearchSkuMappingsRequest,
  CreateSkuMappingRequest,
  UpdateSkuMappingRequest
>({
  entityName: 'skuMappings',
  searchFn: skuMappingsSearch,
  useCreate: useSkuMappingsCreate,
  useUpdate: useSkuMappingsUpdate,
  useDelete: useSkuMappingsDelete,
  staleTime: 30 * 1000,
})

/**
 * Hook to lookup a product by external SKU
 * Returns the internal product/variant mapping for a given platform SKU
 */
export function useSkuMappingLookup(params: MaybeRef<SkuMappingsLookupParams | undefined>) {
  const query = useQuery({
    queryKey: computed(() => ['sku-mappings', 'lookup', unref(params)]),
    queryFn: () => skuMappingsLookup(unref(params)!),
    enabled: computed(() => {
      const p = unref(params)
      return !!(p?.platformIntegrationId && p?.externalSku)
    }),
    staleTime: 30 * 1000,
  })

  return {
    mapping: computed(() => query.data.value),
    isLoading: computed(() => query.isLoading.value),
    isFetching: computed(() => query.isFetching.value),
    isFound: computed(() => query.data.value?.found ?? false),
    refetch: () => query.refetch(),
  }
}

/**
 * Hook for bulk creating SKU mappings
 * Useful for importing mappings from external platforms
 */
export function useSkuMappingsBulkCreate() {
  const queryClient = useQueryClient()
  const keys = queryKeys.skuMappings

  const mutation = useMutation({
    mutationFn: (data: BulkCreateSkuMappingsRequest) => skuMappingsBulkCreate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all() })
    },
  })

  return {
    bulkCreate: (data: BulkCreateSkuMappingsRequest) => mutation.mutateAsync({ data }),
    isPending: computed(() => mutation.isPending.value),
    isSuccess: computed(() => mutation.isSuccess.value),
    data: computed(() => mutation.data.value),
    error: computed(() => mutation.error.value),
    reset: () => mutation.reset(),
  }
}

export type {
  SkuMappingDto,
  CreateSkuMappingRequest,
  UpdateSkuMappingRequest,
  SkuMappingsLookupParams,
  SkuMappingLookupResult,
  BulkCreateSkuMappingsRequest,
  BulkCreateSkuMappingsResult,
}
