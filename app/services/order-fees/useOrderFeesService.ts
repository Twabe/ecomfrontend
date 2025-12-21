/**
 * Order Fees Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  orderFeesSearch,
  useOrderFeesCreate,
  useOrderFeesUpdate,
  useOrderFeesDelete,
} from '~/api/generated/endpoints/order-fees/order-fees'
import type {
  OrderFeeDto,
  SearchOrderFeesRequest,
  CreateOrderFeeRequest,
  UpdateOrderFeeRequest,
} from '~/api/generated/models'

export const useOrderFeesService = createEntityService<
  OrderFeeDto,
  SearchOrderFeesRequest,
  CreateOrderFeeRequest,
  UpdateOrderFeeRequest
>({
  entityName: 'orderFees',
  searchFn: orderFeesSearch,
  useCreate: useOrderFeesCreate,
  useUpdate: useOrderFeesUpdate,
  useDelete: useOrderFeesDelete,
  staleTime: 30 * 1000,
})

export type { OrderFeeDto, CreateOrderFeeRequest, UpdateOrderFeeRequest }
