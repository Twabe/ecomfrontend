/**
 * Shopify Integration Service
 *
 * OAuth integration with Shopify e-commerce platform
 * Uses Connect/Callback/Disconnect flow (same pattern as YouCan)
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  shopifyIntegrationConnect,
  shopifyIntegrationCallback,
  shopifyIntegrationGetStatus,
  shopifyIntegrationListWebhooks,
  useShopifyIntegrationDisconnect,
} from '~/api/generated/endpoints/shopify-integration/shopify-integration'
import type {
  ShopifyIntegrationConnectParams,
  ShopifyIntegrationCallbackParams,
} from '~/api/generated/models'

export function useShopifyIntegrationService() {
  const queryClient = useQueryClient()

  const queryKey = ['shopifyIntegration'] as const

  // Disconnect mutation
  const disconnectMutation = useShopifyIntegrationDisconnect()

  // Computed
  const isDisconnecting = computed(() => disconnectMutation.isPending.value)

  // Cache invalidation
  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  // Actions
  const connect = async (params: ShopifyIntegrationConnectParams) => {
    return await shopifyIntegrationConnect(params)
  }

  const handleCallback = async (params: ShopifyIntegrationCallbackParams) => {
    const result = await shopifyIntegrationCallback(params)
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
      queryFn: () => shopifyIntegrationGetStatus(unref(storeId)),
      enabled: computed(() => !!unref(storeId)),
      staleTime: 30 * 1000,
    })
  }

  // List webhooks for a store
  const listWebhooks = (storeId: Ref<string>) => {
    return useQuery({
      queryKey: computed(() => [...queryKey, 'webhooks', unref(storeId)] as const),
      queryFn: () => shopifyIntegrationListWebhooks(unref(storeId)),
      enabled: computed(() => !!unref(storeId)),
      staleTime: 60 * 1000,
    })
  }

  return {
    isDisconnecting,
    connect,
    handleCallback,
    disconnect,
    getStatus,
    listWebhooks,
    invalidate,
  }
}

export type { ShopifyIntegrationConnectParams, ShopifyIntegrationCallbackParams }
