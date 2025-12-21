/**
 * Extra Tags Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  extraTagsSearch,
  useExtraTagsCreate,
  useExtraTagsUpdate,
  useExtraTagsDelete,
} from '~/api/generated/endpoints/extra-tags/extra-tags'
import type {
  ExtraTagDto,
  SearchExtraTagsRequest,
  CreateExtraTagRequest,
  UpdateExtraTagRequest,
} from '~/api/generated/models'

export const useExtraTagsService = createEntityService<
  ExtraTagDto,
  SearchExtraTagsRequest,
  CreateExtraTagRequest,
  UpdateExtraTagRequest
>({
  entityName: 'extraTags',
  searchFn: extraTagsSearch,
  useCreate: useExtraTagsCreate,
  useUpdate: useExtraTagsUpdate,
  useDelete: useExtraTagsDelete,
  staleTime: 30 * 1000,
})

export type { ExtraTagDto, CreateExtraTagRequest, UpdateExtraTagRequest }
