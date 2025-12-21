/**
 * Tracking States Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  trackingStatesSearch,
  useTrackingStatesCreate,
  useTrackingStatesUpdate,
  useTrackingStatesDelete,
} from '~/api/generated/endpoints/tracking-states/tracking-states'
import type {
  TrackingStateDto,
  SearchTrackingStatesRequest,
  CreateTrackingStateRequest,
  UpdateTrackingStateRequest,
} from '~/api/generated/models'

export const useTrackingStatesService = createEntityService<
  TrackingStateDto,
  SearchTrackingStatesRequest,
  CreateTrackingStateRequest,
  UpdateTrackingStateRequest
>({
  entityName: 'trackingStates',
  searchFn: trackingStatesSearch,
  useCreate: useTrackingStatesCreate,
  useUpdate: useTrackingStatesUpdate,
  useDelete: useTrackingStatesDelete,
  staleTime: 60 * 1000, // Master data
})

export type { TrackingStateDto, CreateTrackingStateRequest, UpdateTrackingStateRequest }
