/**
 * Delivery Provider Templates Service
 *
 * Read-only service for accessing the global catalog of delivery providers.
 * Templates are managed by super admins; tenants can only view them.
 */

import { computed, ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import {
  useDeliveryProviderTemplatesGetAll,
  useDeliveryProviderTemplatesGet,
  useDeliveryProviderTemplatesGetStats,
  useDeliveryProviderTemplatesGetWebhookHealth,
  getDeliveryProviderTemplatesGetAllQueryKey,
} from '~/api/generated/endpoints/delivery-provider-templates/delivery-provider-templates'
import type {
  DeliveryProviderTemplateDto,
  TemplateStatsDto,
  WebhookHealthReport,
} from '~/api/generated/models'

export function useDeliveryProviderTemplatesService() {
  const queryClient = useQueryClient()

  // Query params
  const includeInactive = ref(false)

  // Get all templates query
  const templatesQuery = useDeliveryProviderTemplatesGetAll(
    computed(() => ({ includeInactive: includeInactive.value })),
    {
      query: {
        staleTime: 5 * 60 * 1000, // 5 minutes - templates rarely change
        gcTime: 30 * 60 * 1000, // 30 minutes cache
      },
    }
  )

  // Computed values
  const templates = computed(() => templatesQuery.data.value ?? [])
  const activeTemplates = computed(() => templates.value.filter(t => t.isActive))
  const isLoading = computed(() => templatesQuery.isLoading.value)
  const isFetching = computed(() => templatesQuery.isFetching.value)

  // Get single template by ID
  const getById = (id: string) => {
    return useDeliveryProviderTemplatesGet(id, {
      query: {
        staleTime: 5 * 60 * 1000,
        enabled: computed(() => !!id),
      },
    })
  }

  // Get template from cache or find in list
  const findById = (id: string): DeliveryProviderTemplateDto | undefined => {
    return templates.value.find(t => t.id === id)
  }

  // Stats query (for super admin)
  const useStats = () => {
    return useDeliveryProviderTemplatesGetStats({
      query: {
        staleTime: 60 * 1000, // 1 minute - stats can change more frequently
      },
    })
  }

  // Webhook health query (for super admin)
  const useWebhookHealth = () => {
    return useDeliveryProviderTemplatesGetWebhookHealth({
      query: {
        staleTime: 60 * 1000,
      },
    })
  }

  // Cache management
  const invalidate = () => {
    // Use Orval-generated query key to ensure proper cache invalidation
    queryClient.invalidateQueries({ queryKey: getDeliveryProviderTemplatesGetAllQueryKey() })
  }

  const refetch = () => {
    return templatesQuery.refetch()
  }

  // Toggle includeInactive filter
  const setIncludeInactive = (value: boolean) => {
    includeInactive.value = value
  }

  return {
    // Data
    templates,
    activeTemplates,

    // Loading states
    isLoading,
    isFetching,

    // Single item
    getById,
    findById,

    // Super admin queries
    useStats,
    useWebhookHealth,

    // Filters
    includeInactive,
    setIncludeInactive,

    // Cache management
    invalidate,
    refetch,
  }
}

export type { DeliveryProviderTemplateDto, TemplateStatsDto, WebhookHealthReport }
