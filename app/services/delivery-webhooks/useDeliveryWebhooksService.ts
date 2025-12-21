/**
 * Delivery Webhooks Service
 *
 * Delivery company webhook handler service
 */

import { useQueryClient } from '@tanstack/vue-query'
import {
  useDeliveryWebhooksProcessWebhook,
} from '~/api/generated/endpoints/delivery-webhooks/delivery-webhooks'
import type {
  DeliveryWebhookPayload,
} from '~/api/generated/models'

export function useDeliveryWebhooksService() {
  const queryClient = useQueryClient()

  // Process webhook mutation
  const processMutation = useDeliveryWebhooksProcessWebhook()

  // Computed
  const isProcessing = computed(() => processMutation.isPending.value)

  // Process delivery webhook
  const processWebhook = async (data: DeliveryWebhookPayload): Promise<void> => {
    await processMutation.mutateAsync({ data })
    // Delivery webhooks update order status, invalidate related caches
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    queryClient.invalidateQueries({ queryKey: ['deliveryNotes'] })
    queryClient.invalidateQueries({ queryKey: ['shipments'] })
  }

  return {
    isProcessing,
    processWebhook,
  }
}

export type { DeliveryWebhookPayload }
