/**
 * Media Buyer Invoices Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  mediaBuyerInvoicesSearch,
  useMediaBuyerInvoicesCreate,
  useMediaBuyerInvoicesUpdate,
  useMediaBuyerInvoicesDelete,
} from '~/api/generated/endpoints/media-buyer-invoices/media-buyer-invoices'
import type {
  MediaBuyerInvoiceDto,
  SearchMediaBuyerInvoicesRequest,
  CreateMediaBuyerInvoiceRequest,
  UpdateMediaBuyerInvoiceRequest,
} from '~/api/generated/models'

export const useMediaBuyerInvoicesService = createEntityService<
  MediaBuyerInvoiceDto,
  SearchMediaBuyerInvoicesRequest,
  CreateMediaBuyerInvoiceRequest,
  UpdateMediaBuyerInvoiceRequest
>({
  entityName: 'mediaBuyerInvoices',
  searchFn: mediaBuyerInvoicesSearch,
  useCreate: useMediaBuyerInvoicesCreate,
  useUpdate: useMediaBuyerInvoicesUpdate,
  useDelete: useMediaBuyerInvoicesDelete,
  staleTime: 30 * 1000,
})

export type { MediaBuyerInvoiceDto, CreateMediaBuyerInvoiceRequest, UpdateMediaBuyerInvoiceRequest }
