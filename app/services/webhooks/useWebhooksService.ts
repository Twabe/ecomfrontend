/**
 * Webhooks Service
 *
 * Webhook handler service (receives external webhooks)
 */

import { useQueryClient } from '@tanstack/vue-query'
import {
  useWebhooksHandleWebhook,
} from '~/api/generated/endpoints/webhooks/webhooks'
import type {
  WebhookPayload,
} from '~/api/generated/models'

export function useWebhooksService() {
  const queryClient = useQueryClient()

  // Handle webhook mutation
  const handleMutation = useWebhooksHandleWebhook()

  // Computed
  const isProcessing = computed(() => handleMutation.isPending.value)

  // Handle incoming webhook
  const handleWebhook = async (data: WebhookPayload): Promise<void> => {
    await handleMutation.mutateAsync({ data })
    // Webhooks may update various data, invalidate common caches
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    queryClient.invalidateQueries({ queryKey: ['deliveryNotes'] })
  }

  return {
    isProcessing,
    handleWebhook,
  }
}

export type { WebhookPayload }
