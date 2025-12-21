/**
 * Cities Service
 *
 * Provides cached CRUD operations for City entities.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const {
 *   items: cities,
 *   pagination,
 *   isLoading,
 *   setKeyword,
 *   create,
 *   update,
 *   remove
 * } = useCitiesService()
 * </script>
 * ```
 */

import { createEntityService } from '../_base/createEntityService'
import {
  citiesSearch,
  useCitiesCreate,
  useCitiesUpdate,
  useCitiesDelete,
} from '~/api/generated/endpoints/cities/cities'
import type {
  CityDto,
  SearchCitiesRequest,
  CreateCityRequest,
  UpdateCityRequest,
} from '~/api/generated/models'

/**
 * Cities service with full CRUD operations
 *
 * Features:
 * - Cached search results (30s stale time)
 * - Auto cache invalidation on mutations
 * - Reactive pagination
 * - Prefetch support for next page
 */
export const useCitiesService = createEntityService<
  CityDto,
  SearchCitiesRequest,
  CreateCityRequest,
  UpdateCityRequest
>({
  entityName: 'cities',
  searchFn: citiesSearch,
  useCreate: useCitiesCreate,
  useUpdate: useCitiesUpdate,
  useDelete: useCitiesDelete,
  staleTime: 30 * 1000, // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true,
})

// Re-export types for convenience
export type { CityDto, CreateCityRequest, UpdateCityRequest }
