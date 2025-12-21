/**
 * Expense Types Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  expenseTypesSearch,
  useExpenseTypesCreate,
  useExpenseTypesUpdate,
  useExpenseTypesDelete,
} from '~/api/generated/endpoints/expense-types/expense-types'
import type {
  ExpenseTypeDto,
  SearchExpenseTypesRequest,
  CreateExpenseTypeRequest,
  UpdateExpenseTypeRequest,
} from '~/api/generated/models'

export const useExpenseTypesService = createEntityService<
  ExpenseTypeDto,
  SearchExpenseTypesRequest,
  CreateExpenseTypeRequest,
  UpdateExpenseTypeRequest
>({
  entityName: 'expenseTypes',
  searchFn: expenseTypesSearch,
  useCreate: useExpenseTypesCreate,
  useUpdate: useExpenseTypesUpdate,
  useDelete: useExpenseTypesDelete,
  staleTime: 30 * 1000,
})

export type { ExpenseTypeDto, CreateExpenseTypeRequest, UpdateExpenseTypeRequest }
