/**
 * Brands Service
 *
 * Provides cached CRUD operations for Brand entities.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const {
 *   items: brands,
 *   pagination,
 *   isLoading,
 *   setKeyword,
 *   create,
 *   update,
 *   remove
 * } = useBrandsService()
 * </script>
 * ```
 */

import { createEntityService } from '../_base/createEntityService'
import {
  brandsSearch,
  useBrandsCreate,
  useBrandsUpdate,
  useBrandsDelete,
} from '~/api/generated/endpoints/brands/brands'
import type {
  BrandDto,
  SearchBrandsRequest,
  CreateBrandRequest,
  UpdateBrandRequest,
} from '~/api/generated/models'

/**
 * Brands service with full CRUD operations
 *
 * Features:
 * - Cached search results (30s stale time)
 * - Auto cache invalidation on mutations
 * - Reactive pagination
 * - Prefetch support for next page
 */
export const useBrandsService = createEntityService<
  BrandDto,
  SearchBrandsRequest,
  CreateBrandRequest,
  UpdateBrandRequest
>({
  entityName: 'brands',
  searchFn: brandsSearch,
  useCreate: useBrandsCreate,
  useUpdate: useBrandsUpdate,
  useDelete: useBrandsDelete,
  staleTime: 30 * 1000, // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true,
})

// Re-export types for convenience
export type { BrandDto, CreateBrandRequest, UpdateBrandRequest }
