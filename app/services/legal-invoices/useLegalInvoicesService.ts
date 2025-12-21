/**
 * Legal Invoices Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  legalInvoicesSearch,
  useLegalInvoicesCreate,
  useLegalInvoicesUpdate,
  useLegalInvoicesDelete,
} from '~/api/generated/endpoints/legal-invoices/legal-invoices'
import type {
  LegalInvoiceDto,
  SearchLegalInvoicesRequest,
  CreateLegalInvoiceRequest,
  UpdateLegalInvoiceRequest,
} from '~/api/generated/models'

export const useLegalInvoicesService = createEntityService<
  LegalInvoiceDto,
  SearchLegalInvoicesRequest,
  CreateLegalInvoiceRequest,
  UpdateLegalInvoiceRequest
>({
  entityName: 'legalInvoices',
  searchFn: legalInvoicesSearch,
  useCreate: useLegalInvoicesCreate,
  useUpdate: useLegalInvoicesUpdate,
  useDelete: useLegalInvoicesDelete,
  staleTime: 30 * 1000,
})

export type { LegalInvoiceDto, CreateLegalInvoiceRequest, UpdateLegalInvoiceRequest }
