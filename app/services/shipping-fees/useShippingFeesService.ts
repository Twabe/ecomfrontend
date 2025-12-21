/**
 * Shipping Fees Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  shippingFeesSearch,
  useShippingFeesCreate,
  useShippingFeesUpdate,
  useShippingFeesDelete,
} from '~/api/generated/endpoints/shipping-fees/shipping-fees'
import type {
  ShippingFeeDto,
  SearchShippingFeesRequest,
  CreateShippingFeeRequest,
  UpdateShippingFeeRequest,
} from '~/api/generated/models'

export const useShippingFeesService = createEntityService<
  ShippingFeeDto,
  SearchShippingFeesRequest,
  CreateShippingFeeRequest,
  UpdateShippingFeeRequest
>({
  entityName: 'shippingFees',
  searchFn: shippingFeesSearch,
  useCreate: useShippingFeesCreate,
  useUpdate: useShippingFeesUpdate,
  useDelete: useShippingFeesDelete,
  staleTime: 60 * 1000, // Configuration data - longer stale time
})

export type { ShippingFeeDto, CreateShippingFeeRequest, UpdateShippingFeeRequest }
