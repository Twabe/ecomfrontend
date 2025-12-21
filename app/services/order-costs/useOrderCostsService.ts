/**
 * Order Costs Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  orderCostsSearch,
  useOrderCostsCreate,
  useOrderCostsUpdate,
  useOrderCostsDelete,
} from '~/api/generated/endpoints/order-costs/order-costs'
import type {
  OrderCostDto,
  SearchOrderCostsRequest,
  CreateOrderCostRequest,
  UpdateOrderCostRequest,
} from '~/api/generated/models'

export const useOrderCostsService = createEntityService<
  OrderCostDto,
  SearchOrderCostsRequest,
  CreateOrderCostRequest,
  UpdateOrderCostRequest
>({
  entityName: 'orderCosts',
  searchFn: orderCostsSearch,
  useCreate: useOrderCostsCreate,
  useUpdate: useOrderCostsUpdate,
  useDelete: useOrderCostsDelete,
  staleTime: 30 * 1000,
})

export type { OrderCostDto, CreateOrderCostRequest, UpdateOrderCostRequest }
