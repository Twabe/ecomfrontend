/**
 * Quality Checklist Items Service
 *
 * Manages quality checklist items used during order confirmation.
 * Workers must complete these checks before confirming orders (when EnableQualityCheck is enabled).
 *
 * Note: Run `npm run api:generate` after backend changes to update types.
 */

import { createEntityService } from '../_base/createEntityService'
import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from '../_base/queryKeys'
import {
  qualityChecklistItemsSearch,
  qualityChecklistItemsGetActive,
  useQualityChecklistItemsCreate,
  useQualityChecklistItemsUpdate,
  useQualityChecklistItemsDelete,
} from '~/api/generated/endpoints/quality-checklist-items/quality-checklist-items'
import type {
  QualityChecklistItemDto,
  SearchQualityChecklistItemsRequest,
  CreateQualityChecklistItemRequest,
  UpdateQualityChecklistItemRequest,
} from '~/api/generated/models'

export const useQualityChecklistItemsService = createEntityService<
  QualityChecklistItemDto,
  SearchQualityChecklistItemsRequest,
  CreateQualityChecklistItemRequest,
  UpdateQualityChecklistItemRequest
>({
  entityName: 'qualityChecklistItems',
  searchFn: qualityChecklistItemsSearch,
  useCreate: useQualityChecklistItemsCreate,
  useUpdate: useQualityChecklistItemsUpdate,
  useDelete: useQualityChecklistItemsDelete,
  staleTime: 60 * 1000, // Settings - longer stale time
})

/**
 * Get active quality checklist items for workers.
 * Used in OrderConfirmModal and worker confirmation panels.
 */
export const useActiveQualityChecklistItems = () => {
  return useQuery({
    queryKey: [...queryKeys.qualityChecklistItems.all(), 'active'],
    queryFn: () => qualityChecklistItemsGetActive(),
    staleTime: 60 * 1000, // Cache for 1 minute
  })
}

export type {
  QualityChecklistItemDto,
  CreateQualityChecklistItemRequest,
  UpdateQualityChecklistItemRequest,
}
