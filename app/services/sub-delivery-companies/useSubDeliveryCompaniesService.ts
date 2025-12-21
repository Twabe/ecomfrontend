/**
 * Sub Delivery Companies Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  subDeliveryCompaniesSearch,
  useSubDeliveryCompaniesCreate,
  useSubDeliveryCompaniesUpdate,
  useSubDeliveryCompaniesDelete,
} from '~/api/generated/endpoints/sub-delivery-companies/sub-delivery-companies'
import type {
  SubDeliveryCompanyDto,
  SearchSubDeliveryCompaniesRequest,
  CreateSubDeliveryCompanyRequest,
  UpdateSubDeliveryCompanyRequest,
} from '~/api/generated/models'

export const useSubDeliveryCompaniesService = createEntityService<
  SubDeliveryCompanyDto,
  SearchSubDeliveryCompaniesRequest,
  CreateSubDeliveryCompanyRequest,
  UpdateSubDeliveryCompanyRequest
>({
  entityName: 'subDeliveryCompanies',
  searchFn: subDeliveryCompaniesSearch,
  useCreate: useSubDeliveryCompaniesCreate,
  useUpdate: useSubDeliveryCompaniesUpdate,
  useDelete: useSubDeliveryCompaniesDelete,
  staleTime: 60 * 1000, // Master data
})

export type { SubDeliveryCompanyDto, CreateSubDeliveryCompanyRequest, UpdateSubDeliveryCompanyRequest }
