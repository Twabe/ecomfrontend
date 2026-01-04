/**
 * Provider Cities Service (Admin)
 *
 * Manages city mappings for delivery provider templates.
 * Used by super admins to configure which cities each provider can deliver to.
 */

import { computed, type Ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import {
  useAdminProviderCitiesGetCities,
  useAdminProviderCitiesCreate,
  useAdminProviderCitiesUpdate,
  useAdminProviderCitiesDelete,
  useAdminProviderCitiesBulkCreate,
  getAdminProviderCitiesGetCitiesQueryKey,
} from '~/api/generated/endpoints/admin-provider-cities/admin-provider-cities'
import type {
  ProviderCityDto2,
  CreateProviderCityRequest,
  UpdateProviderCityRequest,
  BulkCreateProviderCitiesRequest,
  BulkCreateResult,
} from '~/api/generated/models'

export function useProviderCitiesService(templateId: Ref<string | undefined>) {
  const queryClient = useQueryClient()

  // Get cities for the selected template
  const citiesQuery = useAdminProviderCitiesGetCities(
    computed(() => templateId.value || ''),
    computed(() => ({})),
    {
      query: {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: computed(() => !!templateId.value),
      },
    }
  )

  // Computed values
  const cities = computed(() => citiesQuery.data.value ?? [])
  const activeCities = computed(() => cities.value.filter(c => c.isActive))
  const inactiveCities = computed(() => cities.value.filter(c => !c.isActive))
  const isLoading = computed(() => citiesQuery.isLoading.value)
  const isFetching = computed(() => citiesQuery.isFetching.value)

  // Mutations
  const createMutation = useAdminProviderCitiesCreate()
  const updateMutation = useAdminProviderCitiesUpdate()
  const deleteMutation = useAdminProviderCitiesDelete()
  const bulkCreateMutation = useAdminProviderCitiesBulkCreate()

  // Loading states
  const isCreating = computed(() => createMutation.isPending.value)
  const isUpdating = computed(() => updateMutation.isPending.value)
  const isDeleting = computed(() => deleteMutation.isPending.value)
  const isBulkCreating = computed(() => bulkCreateMutation.isPending.value)
  const isMutating = computed(() =>
    isCreating.value ||
    isUpdating.value ||
    isDeleting.value ||
    isBulkCreating.value
  )

  // CRUD Operations
  const create = async (data: CreateProviderCityRequest): Promise<string> => {
    if (!templateId.value) throw new Error('Template ID is required')
    const result = await createMutation.mutateAsync({
      templateId: templateId.value,
      data,
    })
    invalidate()
    return result
  }

  const update = async (id: string, data: UpdateProviderCityRequest): Promise<string> => {
    const result = await updateMutation.mutateAsync({
      id,
      data: { ...data, id },
    })
    invalidate()
    return result
  }

  const remove = async (id: string): Promise<string> => {
    const result = await deleteMutation.mutateAsync({ id })
    invalidate()
    return result
  }

  const bulkCreate = async (data: BulkCreateProviderCitiesRequest): Promise<BulkCreateResult> => {
    if (!templateId.value) throw new Error('Template ID is required')
    const result = await bulkCreateMutation.mutateAsync({
      templateId: templateId.value,
      data,
    })
    invalidate()
    return result
  }

  // Toggle active status
  const toggleActive = async (id: string, isActive: boolean): Promise<string> => {
    return update(id, { id, isActive })
  }

  // Find city by ID
  const findById = (id: string): ProviderCityDto2 | undefined => {
    return cities.value.find(c => c.id === id)
  }

  // Find city by cityId (our system's city)
  const findByCityId = (cityId: string): ProviderCityDto2 | undefined => {
    return cities.value.find(c => c.cityId === cityId)
  }

  // Cache management
  const invalidate = () => {
    if (templateId.value) {
      queryClient.invalidateQueries({
        queryKey: getAdminProviderCitiesGetCitiesQueryKey(templateId.value),
      })
    }
  }

  const refetch = () => {
    return citiesQuery.refetch()
  }

  return {
    // Data
    cities,
    activeCities,
    inactiveCities,

    // Loading states
    isLoading,
    isFetching,
    isMutating,
    isCreating,
    isUpdating,
    isDeleting,
    isBulkCreating,

    // CRUD
    create,
    update,
    remove,
    bulkCreate,
    toggleActive,

    // Finders
    findById,
    findByCityId,

    // Cache management
    invalidate,
    refetch,
  }
}

export type { ProviderCityDto2, CreateProviderCityRequest, UpdateProviderCityRequest, BulkCreateProviderCitiesRequest, BulkCreateResult }
