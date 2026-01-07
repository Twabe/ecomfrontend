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
import { customInstance } from '~/api/axios-instance'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

// Request/Response types for new endpoints
export interface GenerateLegalInvoiceFromOrdersRequest {
  orderIds: string[]
  companyName: string
  iceNumber: string
  address: string
}

export interface GenerateLegalInvoiceResponse {
  legalInvoiceId: string
  legalInvoiceCode: string
  ordersIncluded: number
  totalAmount: number
  orderCodes: string[]
  errors: string[]
}

export interface LegalInvoiceItemDto {
  id: string
  orderId?: string | null
  orderCode?: string | null
  productId?: string | null
  productName: string
  productReference?: string | null
  variantName?: string | null
  quantity: number
  unitPrice: number
  total: number
}

// Request/Response for manual invoice creation
export interface ManualLegalInvoiceItemDto {
  productId?: string | null
  productName: string
  productReference?: string | null
  variantName?: string | null
  quantity: number
  unitPrice: number
}

export interface CreateManualLegalInvoiceRequest {
  companyName: string
  iceNumber: string
  address: string
  items: ManualLegalInvoiceItemDto[]
}

export interface CreateManualLegalInvoiceResponse {
  legalInvoiceId: string
  legalInvoiceCode: string
  itemsCount: number
  totalAmount: number
}

// API functions for new endpoints
export const legalInvoicesGenerateFromOrders = (
  request: GenerateLegalInvoiceFromOrdersRequest
) => {
  return customInstance<GenerateLegalInvoiceResponse>({
    url: '/api/v1/legalinvoices/generate-from-orders',
    method: 'POST',
    data: request,
  })
}

export const legalInvoicesFinalize = (id: string) => {
  return customInstance<string>({
    url: `/api/v1/legalinvoices/${id}/finalize`,
    method: 'POST',
  })
}

export const legalInvoicesCancel = (id: string, reason?: string) => {
  return customInstance<string>({
    url: `/api/v1/legalinvoices/${id}/cancel`,
    method: 'POST',
    data: { reason },
  })
}

export const legalInvoicesCreateManual = (
  request: CreateManualLegalInvoiceRequest
) => {
  return customInstance<CreateManualLegalInvoiceResponse>({
    url: '/api/v1/legalinvoices/create-manual',
    method: 'POST',
    data: request,
  })
}

// Mutation hooks for new endpoints
export const useLegalInvoicesGenerateFromOrders = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GenerateLegalInvoiceFromOrdersRequest) =>
      legalInvoicesGenerateFromOrders(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legalInvoices'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export const useLegalInvoicesFinalize = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => legalInvoicesFinalize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legalInvoices'] })
    },
  })
}

export const useLegalInvoicesCancel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      legalInvoicesCancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legalInvoices'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export const useLegalInvoicesCreateManual = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateManualLegalInvoiceRequest) =>
      legalInvoicesCreateManual(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legalInvoices'] })
    },
  })
}

// Base entity service
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
