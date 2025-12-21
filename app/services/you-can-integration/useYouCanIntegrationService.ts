/**
 * YouCan Integration Service
 *
 * OAuth integration with YouCan e-commerce platform
 * Uses Connect/Callback/Disconnect flow instead of standard CRUD
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  youCanIntegrationConnect,
  youCanIntegrationCallback,
  youCanIntegrationGetStatus,
  useYouCanIntegrationDisconnect,
} from '~/api/generated/endpoints/you-can-integration/you-can-integration'
import type {
  YouCanIntegrationConnectParams,
  YouCanIntegrationCallbackParams,
  YouCanIntegrationStatusDto,
} from '~/api/generated/models'

export function useYouCanIntegrationService() {
  const queryClient = useQueryClient()

  const queryKey = ['youCanIntegration'] as const

  // Disconnect mutation
  const disconnectMutation = useYouCanIntegrationDisconnect()

  // Computed
  const isDisconnecting = computed(() => disconnectMutation.isPending.value)

  // Cache invalidation
  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  // Actions
  const connect = async (params: YouCanIntegrationConnectParams) => {
    return await youCanIntegrationConnect(params)
  }

  const handleCallback = async (params: YouCanIntegrationCallbackParams) => {
    const result = await youCanIntegrationCallback(params)
    invalidate()
    return result
  }

  const disconnect = async (storeId: string) => {
    await disconnectMutation.mutateAsync({ storeId })
    invalidate()
  }

  // Get connection status for a store
  const getStatus = (storeId: Ref<string>) => {
    return useQuery({
      queryKey: computed(() => [...queryKey, 'status', unref(storeId)] as const),
      queryFn: () => youCanIntegrationGetStatus(unref(storeId)),
      enabled: computed(() => !!unref(storeId)),
      staleTime: 30 * 1000,
    })
  }

  return {
    isDisconnecting,
    connect,
    handleCallback,
    disconnect,
    getStatus,
    invalidate,
  }
}

export type { YouCanIntegrationStatusDto, YouCanIntegrationConnectParams, YouCanIntegrationCallbackParams }
