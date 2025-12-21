/**
 * Statistics Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  statisticsSearch,
  useStatisticsCreate,
  useStatisticsUpdate,
  useStatisticsDelete,
} from '~/api/generated/endpoints/statistics/statistics'
import type {
  StatisticDto,
  SearchStatisticsRequest,
  CreateStatisticRequest,
  UpdateStatisticRequest,
} from '~/api/generated/models'

export const useStatisticsService = createEntityService<
  StatisticDto,
  SearchStatisticsRequest,
  CreateStatisticRequest,
  UpdateStatisticRequest
>({
  entityName: 'statistics',
  searchFn: statisticsSearch,
  useCreate: useStatisticsCreate,
  useUpdate: useStatisticsUpdate,
  useDelete: useStatisticsDelete,
  staleTime: 30 * 1000,
})

export type { StatisticDto, CreateStatisticRequest, UpdateStatisticRequest }
