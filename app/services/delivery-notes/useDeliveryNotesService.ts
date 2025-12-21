/**
 * Delivery Notes Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  deliveryNotesSearch,
  useDeliveryNotesCreate,
  useDeliveryNotesUpdate,
  useDeliveryNotesDelete,
} from '~/api/generated/endpoints/delivery-notes/delivery-notes'
import type {
  DeliveryNoteDto,
  SearchDeliveryNotesRequest,
  CreateDeliveryNoteRequest,
  UpdateDeliveryNoteRequest,
} from '~/api/generated/models'

export const useDeliveryNotesService = createEntityService<
  DeliveryNoteDto,
  SearchDeliveryNotesRequest,
  CreateDeliveryNoteRequest,
  UpdateDeliveryNoteRequest
>({
  entityName: 'deliveryNotes',
  searchFn: deliveryNotesSearch,
  useCreate: useDeliveryNotesCreate,
  useUpdate: useDeliveryNotesUpdate,
  useDelete: useDeliveryNotesDelete,
  staleTime: 30 * 1000,
})

export type { DeliveryNoteDto, CreateDeliveryNoteRequest, UpdateDeliveryNoteRequest }
