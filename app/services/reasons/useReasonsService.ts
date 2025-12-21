/**
 * Reasons Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  reasonsSearch,
  useReasonsCreate,
  useReasonsUpdate,
  useReasonsDelete,
} from '~/api/generated/endpoints/reasons/reasons'
import type {
  ReasonDto,
  SearchReasonsRequest,
  CreateReasonRequest,
  UpdateReasonRequest,
} from '~/api/generated/models'

export const useReasonsService = createEntityService<
  ReasonDto,
  SearchReasonsRequest,
  CreateReasonRequest,
  UpdateReasonRequest
>({
  entityName: 'reasons',
  searchFn: reasonsSearch,
  useCreate: useReasonsCreate,
  useUpdate: useReasonsUpdate,
  useDelete: useReasonsDelete,
  staleTime: 60 * 1000, // Master data - longer stale time
})

export type { ReasonDto, CreateReasonRequest, UpdateReasonRequest }
