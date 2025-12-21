/**
 * Expenses Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  expensesSearch,
  useExpensesCreate,
  useExpensesUpdate,
  useExpensesDelete,
} from '~/api/generated/endpoints/expenses/expenses'
import type {
  ExpenseDto,
  SearchExpensesRequest,
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from '~/api/generated/models'

export const useExpensesService = createEntityService<
  ExpenseDto,
  SearchExpensesRequest,
  CreateExpenseRequest,
  UpdateExpenseRequest
>({
  entityName: 'expenses',
  searchFn: expensesSearch,
  useCreate: useExpensesCreate,
  useUpdate: useExpensesUpdate,
  useDelete: useExpensesDelete,
  staleTime: 30 * 1000,
})

export type { ExpenseDto, CreateExpenseRequest, UpdateExpenseRequest }
