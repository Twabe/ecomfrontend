/**
 * Customers Service
 *
 * Provides cached CRUD operations for Customer entities.
 * Includes extra operations: blacklist, getByPhone, orderHistory
 */

import { createEntityService } from '../_base/createEntityService'
import {
  customersSearch,
  useCustomersCreate,
  useCustomersUpdate,
  useCustomersDelete,
} from '~/api/generated/endpoints/customers/customers'
import type {
  CustomerDto,
  SearchCustomersRequest,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from '~/api/generated/models'

export const useCustomersService = createEntityService<
  CustomerDto,
  SearchCustomersRequest,
  CreateCustomerRequest,
  UpdateCustomerRequest
>({
  entityName: 'customers',
  searchFn: customersSearch,
  useCreate: useCustomersCreate,
  useUpdate: useCustomersUpdate,
  useDelete: useCustomersDelete,
  staleTime: 30 * 1000,
  gcTime: 5 * 60 * 1000,
  refetchOnWindowFocus: true,
})

export type { CustomerDto, CreateCustomerRequest, UpdateCustomerRequest }
