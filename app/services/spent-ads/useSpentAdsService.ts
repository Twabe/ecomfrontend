/**
 * Spent Ads Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  spentAdsSearch,
  useSpentAdsCreate,
  useSpentAdsUpdate,
  useSpentAdsDelete,
} from '~/api/generated/endpoints/spent-ads/spent-ads'
import type {
  SpentAdDto,
  SearchSpentAdsRequest,
  CreateSpentAdRequest,
  UpdateSpentAdRequest,
} from '~/api/generated/models'

export const useSpentAdsService = createEntityService<
  SpentAdDto,
  SearchSpentAdsRequest,
  CreateSpentAdRequest,
  UpdateSpentAdRequest
>({
  entityName: 'spentAds',
  searchFn: spentAdsSearch,
  useCreate: useSpentAdsCreate,
  useUpdate: useSpentAdsUpdate,
  useDelete: useSpentAdsDelete,
  staleTime: 30 * 1000,
})

export type { SpentAdDto, CreateSpentAdRequest, UpdateSpentAdRequest }
