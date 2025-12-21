/**
 * Suppliers Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  suppliersSearch,
  useSuppliersCreate,
  useSuppliersUpdate,
  useSuppliersDelete,
} from '~/api/generated/endpoints/suppliers/suppliers'
import type {
  SupplierDto,
  SearchSuppliersRequest,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from '~/api/generated/models'

export const useSuppliersService = createEntityService<
  SupplierDto,
  SearchSuppliersRequest,
  CreateSupplierRequest,
  UpdateSupplierRequest
>({
  entityName: 'suppliers',
  searchFn: suppliersSearch,
  useCreate: useSuppliersCreate,
  useUpdate: useSuppliersUpdate,
  useDelete: useSuppliersDelete,
  staleTime: 60 * 1000, // Master data
})

export type { SupplierDto, CreateSupplierRequest, UpdateSupplierRequest }
