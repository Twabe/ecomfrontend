/**
 * Worker Service Configs Service
 *
 * Configuration for worker services (confirmation, quality, delivery tracking)
 * Uses GetAll instead of Search, plus special worker management methods
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  workerServiceConfigsGetAll,
  workerServiceConfigsGetMyConfig,
  workerServiceConfigsGetAvailableWorkers,
  useWorkerServiceConfigsCreate,
  useWorkerServiceConfigsUpdate,
  useWorkerServiceConfigsSetOnline,
} from '~/api/generated/endpoints/worker-service-configs/worker-service-configs'
import type {
  WorkerServiceConfigDto,
  CreateWorkerConfigRequest,
  UpdateWorkerConfigRequest,
  SetOnlineStatusRequest,
  WorkerServiceConfigsGetAllParams,
  WorkerServiceConfigsGetAvailableWorkersParams,
} from '~/api/generated/models'

export function useWorkerServiceConfigsService(options: { initialParams?: WorkerServiceConfigsGetAllParams, fetchAll?: boolean } = {}) {
  const queryClient = useQueryClient()

  const queryKey = ['workerServiceConfigs'] as const

  // Get all configs query - only enabled for supervisors (when fetchAll is true)
  // Workers should only use myConfig, not the full list
  const allConfigsQuery = useQuery({
    queryKey: [...queryKey, 'all', options.initialParams] as const,
    queryFn: () => workerServiceConfigsGetAll(options.initialParams),
    staleTime: 60 * 1000, // Configuration data
    gcTime: 10 * 60 * 1000,
    enabled: options.fetchAll ?? false, // Don't auto-fetch by default
  })

  // Current user's config query - always enabled for workers
  const myConfigQuery = useQuery({
    queryKey: [...queryKey, 'myConfig'] as const,
    queryFn: () => workerServiceConfigsGetMyConfig(),
    staleTime: 30 * 1000,
  })

  // Mutations
  const createMutation = useWorkerServiceConfigsCreate()
  const updateMutation = useWorkerServiceConfigsUpdate()
  const setOnlineMutation = useWorkerServiceConfigsSetOnline()

  // Computed
  const items = computed<WorkerServiceConfigDto[]>(() => allConfigsQuery.data.value ?? [])
  const myConfig = computed<WorkerServiceConfigDto | undefined>(() => myConfigQuery.data.value)
  const isLoading = computed(() => allConfigsQuery.isLoading.value)
  const isFetching = computed(() => allConfigsQuery.isFetching.value)
  const isCreating = computed(() => createMutation.isPending.value)
  const isUpdating = computed(() => updateMutation.isPending.value)

  // Cache invalidation
  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  // CRUD operations
  const create = async (data: CreateWorkerConfigRequest): Promise<string> => {
    const result = await createMutation.mutateAsync({ data })
    invalidate()
    return result
  }

  const update = async (id: string, data: UpdateWorkerConfigRequest): Promise<string> => {
    const result = await updateMutation.mutateAsync({ id, data })
    invalidate()
    return result
  }

  const setOnline = async (id: string, data: SetOnlineStatusRequest): Promise<void> => {
    await setOnlineMutation.mutateAsync({ id, data })
    invalidate()
  }

  // Get available workers for a specific service type
  const getAvailableWorkers = (params: Ref<WorkerServiceConfigsGetAvailableWorkersParams>) => {
    return useQuery({
      queryKey: computed(() => [...queryKey, 'availableWorkers', toRaw(unref(params))] as const),
      queryFn: () => workerServiceConfigsGetAvailableWorkers(unref(params)),
      enabled: computed(() => !!unref(params)),
      staleTime: 30 * 1000,
    })
  }

  return {
    items,
    myConfig,
    isLoading,
    isFetching,
    isCreating,
    isUpdating,
    create,
    update,
    setOnline,
    getAvailableWorkers,
    invalidate,
    refetchAll: () => allConfigsQuery.refetch(),
    refetchMyConfig: () => myConfigQuery.refetch(),
  }
}

export type { WorkerServiceConfigDto, CreateWorkerConfigRequest, UpdateWorkerConfigRequest, SetOnlineStatusRequest }
