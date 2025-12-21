/**
 * Tenants Service
 *
 * Multi-tenant management (admin only)
 * No update operation - tenants are managed via activate/deactivate/upgradeSubscription
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  tenantsGetList,
  tenantsGet,
  useTenantsCreate,
  useTenantsActivate,
  useTenantsDeactivate,
  useTenantsUpgradeSubscription,
} from '~/api/generated/endpoints/tenants/tenants'
import type {
  TenantDto,
  CreateTenantRequest,
  UpgradeSubscriptionRequest,
} from '~/api/generated/models'

export function useTenantsService() {
  const queryClient = useQueryClient()

  const queryKey = ['tenants'] as const

  // Get all tenants
  const query = useQuery({
    queryKey,
    queryFn: () => tenantsGetList(),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // Mutations
  const createMutation = useTenantsCreate()
  const activateMutation = useTenantsActivate()
  const deactivateMutation = useTenantsDeactivate()
  const upgradeMutation = useTenantsUpgradeSubscription()

  // Computed
  const tenants = computed<TenantDto[]>(() => query.data.value ?? [])
  const isLoading = computed(() => query.isLoading.value)
  const isMutating = computed(() =>
    createMutation.isPending.value ||
    activateMutation.isPending.value ||
    deactivateMutation.isPending.value ||
    upgradeMutation.isPending.value
  )

  // Cache invalidation
  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  // Actions
  const create = async (data: CreateTenantRequest): Promise<string> => {
    const result = await createMutation.mutateAsync({ data })
    invalidate()
    return result
  }

  const activate = async (id: string): Promise<string> => {
    const result = await activateMutation.mutateAsync({ id })
    invalidate()
    return result
  }

  const deactivate = async (id: string): Promise<string> => {
    const result = await deactivateMutation.mutateAsync({ id })
    invalidate()
    return result
  }

  const upgradeSubscription = async (id: string, data: UpgradeSubscriptionRequest): Promise<string> => {
    const result = await upgradeMutation.mutateAsync({ id, data })
    invalidate()
    return result
  }

  // Get single tenant
  const getTenant = (id: Ref<string>) => {
    return useQuery({
      queryKey: computed(() => ['tenants', unref(id)] as const),
      queryFn: () => tenantsGet(unref(id)),
      enabled: computed(() => !!unref(id)),
      staleTime: 60 * 1000,
    })
  }

  return {
    tenants,
    isLoading,
    isMutating,
    create,
    activate,
    deactivate,
    upgradeSubscription,
    getTenant,
    invalidate,
    refetch: () => query.refetch(),
  }
}

export type { TenantDto, CreateTenantRequest, UpgradeSubscriptionRequest }
