/**
 * Sources Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  sourcesSearch,
  useSourcesCreate,
  useSourcesUpdate,
  useSourcesDelete,
} from '~/api/generated/endpoints/sources/sources'
import type {
  SourceDto,
  SearchSourcesRequest,
  CreateSourceRequest,
  UpdateSourceRequest,
} from '~/api/generated/models'

export const useSourcesService = createEntityService<
  SourceDto,
  SearchSourcesRequest,
  CreateSourceRequest,
  UpdateSourceRequest
>({
  entityName: 'sources',
  searchFn: sourcesSearch,
  useCreate: useSourcesCreate,
  useUpdate: useSourcesUpdate,
  useDelete: useSourcesDelete,
  staleTime: 60 * 1000, // Master data - longer stale time
})

export type { SourceDto, CreateSourceRequest, UpdateSourceRequest }
