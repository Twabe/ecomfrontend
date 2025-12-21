/**
 * Payments Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  paymentsSearch,
  usePaymentsCreate,
  usePaymentsUpdate,
  usePaymentsDelete,
} from '~/api/generated/endpoints/payments/payments'
import type {
  PaymentDto,
  SearchPaymentsRequest,
  CreatePaymentRequest,
  UpdatePaymentRequest,
} from '~/api/generated/models'

export const usePaymentsService = createEntityService<
  PaymentDto,
  SearchPaymentsRequest,
  CreatePaymentRequest,
  UpdatePaymentRequest
>({
  entityName: 'payments',
  searchFn: paymentsSearch,
  useCreate: usePaymentsCreate,
  useUpdate: usePaymentsUpdate,
  useDelete: usePaymentsDelete,
  staleTime: 30 * 1000,
})

export type { PaymentDto, CreatePaymentRequest, UpdatePaymentRequest }
