/**
 * Purchases Service
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
} from '~/api/generated/models'

export const usePurchasesService = createEntityService<
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

export type { PurchaseDto, CreatePurchaseRequest, UpdatePurchaseRequest }
