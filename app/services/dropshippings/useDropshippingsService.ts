/**
 * Dropshippings Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  dropshippingsSearch,
  useDropshippingsCreate,
  useDropshippingsUpdate,
  useDropshippingsDelete,
} from '~/api/generated/endpoints/dropshippings/dropshippings'
import type {
  DropshippingDto,
  SearchDropshippingsRequest,
  CreateDropshippingRequest,
  UpdateDropshippingRequest,
} from '~/api/generated/models'

export const useDropshippingsService = createEntityService<
  DropshippingDto,
  SearchDropshippingsRequest,
  CreateDropshippingRequest,
  UpdateDropshippingRequest
>({
  entityName: 'dropshippings',
  searchFn: dropshippingsSearch,
  useCreate: useDropshippingsCreate,
  useUpdate: useDropshippingsUpdate,
  useDelete: useDropshippingsDelete,
  staleTime: 30 * 1000,
})

export type { DropshippingDto, CreateDropshippingRequest, UpdateDropshippingRequest }
