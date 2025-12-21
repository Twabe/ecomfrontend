/**
 * Platform Integrations Service
 */

import { useQueryClient } from '@tanstack/vue-query'
import { createEntityService } from '../_base/createEntityService'
import {
  platformIntegrationsSearch,
  usePlatformIntegrationsCreate,
  usePlatformIntegrationsUpdate,
  usePlatformIntegrationsDelete,
  usePlatformIntegrationsToggle,
} from '~/api/generated/endpoints/platform-integrations/platform-integrations'
import type {
  PlatformIntegrationDto,
  SearchPlatformIntegrationsRequest,
  CreatePlatformIntegrationRequest,
  UpdatePlatformIntegrationRequest,
} from '~/api/generated/models'
import { queryKeys } from '../_base/queryKeys'

const baseService = createEntityService<
  PlatformIntegrationDto,
  SearchPlatformIntegrationsRequest,
  CreatePlatformIntegrationRequest,
  UpdatePlatformIntegrationRequest
>({
  entityName: 'platformIntegrations',
  searchFn: platformIntegrationsSearch,
  useCreate: usePlatformIntegrationsCreate,
  useUpdate: usePlatformIntegrationsUpdate,
  useDelete: usePlatformIntegrationsDelete,
  staleTime: 60 * 1000, // Configuration data
})

export function usePlatformIntegrationsService() {
  const queryClient = useQueryClient()
  const base = baseService()

  // Toggle mutation
  const toggleMutation = usePlatformIntegrationsToggle()

  const toggle = async (id: string, _active?: boolean) => {
    await toggleMutation.mutateAsync({ id })
    // Invalidate queries to refetch the updated list
    queryClient.invalidateQueries({ queryKey: queryKeys.platformIntegrations.all() })
  }

  return {
    ...base,
    toggle,
    isToggling: computed(() => toggleMutation.isPending.value),
  }
}

export type { PlatformIntegrationDto, CreatePlatformIntegrationRequest, UpdatePlatformIntegrationRequest }
