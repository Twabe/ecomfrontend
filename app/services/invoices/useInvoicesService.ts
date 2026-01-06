/**
 * Invoices Service
 *
 * Note: Invoices are auto-generated when orders are delivered.
 * Manual create is disabled in the UI, but the base service requires useCreate.
 */

import { createEntityService } from '../_base/createEntityService'
import {
  invoicesSearch,
  invoicesGetWithDetails,
  invoicesMarkAsPaid,
  useInvoicesCreate,
  useInvoicesUpdate,
  useInvoicesDelete,
} from '~/api/generated/endpoints/invoices/invoices'
import { customInstance } from '~/api/axios-instance'
import type {
  InvoiceDto,
  InvoiceDetailsDto,
  SearchInvoicesRequest,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  MarkInvoiceAsPaidRequest,
} from '~/api/generated/models'

// Base service with CRUD operations
// Note: create is not exposed in the UI since invoices are auto-generated
const baseService = createEntityService<
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

// Extended service with invoice-specific operations
export const useInvoicesService = () => {
  const base = baseService()

  // Get invoice details with orders
  const getInvoiceDetails = async (id: string): Promise<InvoiceDetailsDto> => {
    return invoicesGetWithDetails(id)
  }

  // Validate invoice (closes it for new orders)
  const validateInvoice = async (invoiceId: string) => {
    const result = await customInstance<string>({
      url: `/api/v1/invoices/${invoiceId}/validate`,
      method: 'POST',
    })
    // Invalidate the list cache after validating
    base.invalidate()
    return result
  }

  // Mark invoice as paid
  const markInvoicePaid = async (data: { invoiceId: string; receivedDate?: string }) => {
    const { invoiceId } = data
    const result = await invoicesMarkAsPaid(invoiceId, data)
    // Invalidate the list cache after marking as paid
    base.invalidate()
    return result
  }

  // Return base service without create (invoices are auto-generated)
  const { create: _create, ...baseWithoutCreate } = base

  return {
    ...baseWithoutCreate,
    getInvoiceDetails,
    validateInvoice,
    markInvoicePaid,
  }
}

export type {
  InvoiceDto,
  InvoiceDetailsDto,
  UpdateInvoiceRequest,
  MarkInvoiceAsPaidRequest,
}
