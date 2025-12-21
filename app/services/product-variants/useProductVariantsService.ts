/**
 * Product Variants Service
 *
 * Provides CRUD operations and Vue Query caching for product variants.
 * ProductVariants represent different sizes, colors, or configurations of a product.
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { createEntityService } from '../_base/createEntityService'
import { queryKeys } from '../_base/queryKeys'
import {
  productVariantsSearch,
  productVariantsGetByProduct,
  useProductVariantsCreate,
  useProductVariantsUpdate,
  useProductVariantsDelete,
} from '~/api/generated/endpoints/product-variants/product-variants'
import type {
  ProductVariantDto,
  SearchProductVariantsRequest,
  CreateProductVariantRequest,
  UpdateProductVariantRequest,
} from '~/api/generated/models'

/**
 * Main ProductVariants service with full CRUD operations
 */
export const useProductVariantsService = createEntityService<
  ProductVariantDto,
  SearchProductVariantsRequest,
  CreateProductVariantRequest,
  UpdateProductVariantRequest
>({
  entityName: 'productVariants',
  searchFn: productVariantsSearch,
  useCreate: useProductVariantsCreate,
  useUpdate: useProductVariantsUpdate,
  useDelete: useProductVariantsDelete,
  staleTime: 30 * 1000,
})

/**
 * Hook to get all variants for a specific product
 * Useful for product detail pages and variant selectors
 */
export function useProductVariantsByProduct(productId: MaybeRef<string | undefined>) {
  const queryClient = useQueryClient()
  const keys = queryKeys.productVariants

  const query = useQuery({
    queryKey: computed(() => ['product-variants', 'by-product', unref(productId)]),
    queryFn: () => productVariantsGetByProduct(unref(productId)!),
    enabled: computed(() => !!unref(productId)),
    staleTime: 30 * 1000,
  })

  return {
    variants: computed(() => query.data.value ?? []),
    isLoading: computed(() => query.isLoading.value),
    isFetching: computed(() => query.isFetching.value),
    refetch: () => query.refetch(),
    invalidate: () => queryClient.invalidateQueries({ queryKey: keys.all() }),
  }
}

export type { ProductVariantDto, CreateProductVariantRequest, UpdateProductVariantRequest }
