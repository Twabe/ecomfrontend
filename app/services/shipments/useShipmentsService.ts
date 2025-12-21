/**
 * Shipments Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  shipmentsSearch,
  useShipmentsCreate,
  useShipmentsUpdate,
  useShipmentsDelete,
} from '~/api/generated/endpoints/shipments/shipments'
import type {
  ShipmentDto,
  SearchShipmentsRequest,
  CreateShipmentRequest,
  UpdateShipmentRequest,
} from '~/api/generated/models'

export const useShipmentsService = createEntityService<
  ShipmentDto,
  SearchShipmentsRequest,
  CreateShipmentRequest,
  UpdateShipmentRequest
>({
  entityName: 'shipments',
  searchFn: shipmentsSearch,
  useCreate: useShipmentsCreate,
  useUpdate: useShipmentsUpdate,
  useDelete: useShipmentsDelete,
  staleTime: 15 * 1000, // Shipments need fresher data
})

export type { ShipmentDto, CreateShipmentRequest, UpdateShipmentRequest }
