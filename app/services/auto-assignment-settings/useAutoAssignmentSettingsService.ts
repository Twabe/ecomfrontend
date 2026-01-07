/**
 * Auto Assignment Settings Service
 *
 * Special service - only Get/Update operations (singleton settings)
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  autoAssignmentSettingsGet,
  useAutoAssignmentSettingsUpdate,
} from '~/api/generated/endpoints/auto-assignment-settings/auto-assignment-settings'
import type {
  AutoAssignmentSettingsDto as BaseAutoAssignmentSettingsDto,
  UpdateAutoAssignmentSettingsRequest as BaseUpdateAutoAssignmentSettingsRequest,
} from '~/api/generated/models'

// Extended types with new ReturnToConfirmationMode field
// TODO: Remove these extensions after regenerating API types
export interface AutoAssignmentSettingsDto extends BaseAutoAssignmentSettingsDto {
  /** What happens when an order is returned from Suivi to Confirmation: "same_worker", "open", or "choose" */
  returnToConfirmationMode?: 'same_worker' | 'open' | 'choose'
}

export interface UpdateAutoAssignmentSettingsRequest extends BaseUpdateAutoAssignmentSettingsRequest {
  /** What happens when an order is returned from Suivi to Confirmation: "same_worker", "open", or "choose" */
  returnToConfirmationMode?: 'same_worker' | 'open' | 'choose' | null
}

export function useAutoAssignmentSettingsService() {
  const queryClient = useQueryClient()

  const queryKey = ['auto-assignment-settings'] as const

  // Query for settings
  const query = useQuery({
    queryKey,
    queryFn: () => autoAssignmentSettingsGet(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Settings don't change often
  })

  // Update mutation
  const updateMutation = useAutoAssignmentSettingsUpdate()

  // Computed
  const settings = computed<AutoAssignmentSettingsDto | undefined>(() => query.data.value)
  const isLoading = computed(() => query.isLoading.value)
  const isFetching = computed(() => query.isFetching.value)
  const isUpdating = computed(() => updateMutation.isPending.value)

  // Actions
  const update = async (data: UpdateAutoAssignmentSettingsRequest): Promise<AutoAssignmentSettingsDto> => {
    const result = await updateMutation.mutateAsync({ data })
    queryClient.invalidateQueries({ queryKey })
    return result
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey })
  const refetch = () => query.refetch()

  return {
    settings,
    isLoading,
    isFetching,
    isUpdating,
    update,
    invalidate,
    refetch,
  }
}

// Types are already exported above via interface extension
