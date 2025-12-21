/**
 * Stores Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  storesSearch,
  useStoresCreate,
  useStoresUpdate,
  useStoresDelete,
} from '~/api/generated/endpoints/stores/stores'
import type {
  StoreDto,
  SearchStoresRequest,
  CreateStoreRequest,
  UpdateStoreRequest,
} from '~/api/generated/models'

export const useStoresService = createEntityService<
  StoreDto,
  SearchStoresRequest,
  CreateStoreRequest,
  UpdateStoreRequest
>({
  entityName: 'stores',
  searchFn: storesSearch,
  useCreate: useStoresCreate,
  useUpdate: useStoresUpdate,
  useDelete: useStoresDelete,
  staleTime: 60 * 1000, // Master data - longer stale time
})

export type { StoreDto, CreateStoreRequest, UpdateStoreRequest }
