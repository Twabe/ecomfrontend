/**
 * Purchases Service
 *
 * Extended with custom status change operations (confirm, ship, cancel, receive)
 */

import { createEntityService } from '../_base/createEntityService'
import {
  purchasesSearch,
  usePurchasesCreate,
  usePurchasesUpdate,
  usePurchasesDelete,
} from '~/api/generated/endpoints/purchases/purchases'
import type {
  PurchaseDto,
  SearchPurchasesRequest,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  ReceivePurchaseRequest,
} from '~/api/generated/models'
import { customInstance } from '~/api/axios-instance'
import { queryKeys } from '../_base/queryKeys'
import { useQueryClient } from '@tanstack/vue-query'

// Base service from factory
const useBasePurchasesService = createEntityService<
  PurchaseDto,
  SearchPurchasesRequest,
  CreatePurchaseRequest,
  UpdatePurchaseRequest
>({
  entityName: 'purchases',
  searchFn: purchasesSearch,
  useCreate: usePurchasesCreate,
  useUpdate: usePurchasesUpdate,
  useDelete: usePurchasesDelete,
  staleTime: 30 * 1000,
})

/**
 * Extended Purchases Service with status change operations
 */
export function usePurchasesService() {
  const baseService = useBasePurchasesService()
  const queryClient = useQueryClient()
  const keys = queryKeys.purchases

  // Invalidate cache helper
  const invalidateCache = () => {
    queryClient.invalidateQueries({ queryKey: keys.all() })
  }

  /**
   * Confirm a pending purchase
   */
  const confirmPurchase = async (id: string, reason?: string): Promise<string> => {
    const result = await customInstance<string>({
      url: `/api/v1/purchases/${id}/confirm`,
      method: 'POST',
      data: { reason: reason || null },
    })
    invalidateCache()
    return result
  }

  /**
   * Mark a confirmed purchase as shipped
   */
  const markAsShipped = async (id: string, reason?: string): Promise<string> => {
    const result = await customInstance<string>({
      url: `/api/v1/purchases/${id}/ship`,
      method: 'POST',
      data: { reason: reason || null },
    })
    invalidateCache()
    return result
  }

  /**
   * Cancel a purchase
   */
  const cancelPurchase = async (id: string, reason?: string): Promise<string> => {
    const result = await customInstance<string>({
      url: `/api/v1/purchases/${id}/cancel`,
      method: 'POST',
      data: { reason: reason || null },
    })
    invalidateCache()
    return result
  }

  /**
   * Receive a purchase and update stock
   */
  const receivePurchase = async (id: string, request: Omit<ReceivePurchaseRequest, 'purchaseId'>): Promise<string> => {
    const result = await customInstance<string>({
      url: `/api/v1/purchases/${id}/receive`,
      method: 'POST',
      data: {
        purchaseId: id,
        ...request,
      },
    })
    invalidateCache()
    return result
  }

  /**
   * Get purchase status change history
   */
  const getPurchaseHistory = async (id: string): Promise<PurchaseHistoryDto[]> => {
    return await customInstance<PurchaseHistoryDto[]>({
      url: `/api/v1/purchases/${id}/history`,
      method: 'GET',
    })
  }

  return {
    // All base service methods
    ...baseService,

    // Extended status change methods
    confirmPurchase,
    markAsShipped,
    cancelPurchase,
    receivePurchase,
    getPurchaseHistory,
  }
}

// PurchaseHistory DTO type
export interface PurchaseHistoryDto {
  id: string
  purchaseId: string
  status?: string
  comment?: string
  agentName?: string
  createdOn: string
}

export type { PurchaseDto, CreatePurchaseRequest, UpdatePurchaseRequest, ReceivePurchaseRequest }
