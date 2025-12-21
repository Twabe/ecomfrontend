/**
 * Media Buyer Expenses Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  mediaBuyerExpensesSearch,
  useMediaBuyerExpensesCreate,
  useMediaBuyerExpensesUpdate,
  useMediaBuyerExpensesDelete,
} from '~/api/generated/endpoints/media-buyer-expenses/media-buyer-expenses'
import type {
  MediaBuyerExpenseDto,
  SearchMediaBuyerExpensesRequest,
  CreateMediaBuyerExpenseRequest,
  UpdateMediaBuyerExpenseRequest,
} from '~/api/generated/models'

export const useMediaBuyerExpensesService = createEntityService<
  MediaBuyerExpenseDto,
  SearchMediaBuyerExpensesRequest,
  CreateMediaBuyerExpenseRequest,
  UpdateMediaBuyerExpenseRequest
>({
  entityName: 'mediaBuyerExpenses',
  searchFn: mediaBuyerExpensesSearch,
  useCreate: useMediaBuyerExpensesCreate,
  useUpdate: useMediaBuyerExpensesUpdate,
  useDelete: useMediaBuyerExpensesDelete,
  staleTime: 30 * 1000,
})

export type { MediaBuyerExpenseDto, CreateMediaBuyerExpenseRequest, UpdateMediaBuyerExpenseRequest }
