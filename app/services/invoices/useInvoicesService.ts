/**
 * Invoices Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  invoicesSearch,
  useInvoicesCreate,
  useInvoicesUpdate,
  useInvoicesDelete,
} from '~/api/generated/endpoints/invoices/invoices'
import type {
  InvoiceDto,
  SearchInvoicesRequest,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
} from '~/api/generated/models'

export const useInvoicesService = createEntityService<
  InvoiceDto,
  SearchInvoicesRequest,
  CreateInvoiceRequest,
  UpdateInvoiceRequest
>({
  entityName: 'invoices',
  searchFn: invoicesSearch,
  useCreate: useInvoicesCreate,
  useUpdate: useInvoicesUpdate,
  useDelete: useInvoicesDelete,
  staleTime: 30 * 1000,
})

export type { InvoiceDto, CreateInvoiceRequest, UpdateInvoiceRequest }
