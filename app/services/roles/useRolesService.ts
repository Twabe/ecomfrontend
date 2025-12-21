/**
 * Roles Service
 *
 * Special service - role management with permissions
 * Uses RegisterRole instead of Create, no Update (only UpdatePermissions)
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  rolesGetList,
  rolesGetById,
  rolesGetByIdWithPermissions,
  rolesGetAllPermissions,
  useRolesRegisterRole,
  useRolesDelete,
  useRolesUpdatePermissions,
} from '~/api/generated/endpoints/roles/roles'
import type {
  RoleDto,
  CreateOrUpdateRoleRequest,
  UpdateRolePermissionsRequest,
} from '~/api/generated/models'

export function useRolesService() {
  const queryClient = useQueryClient()

  const queryKey = ['roles'] as const

  // Get all roles
  const query = useQuery({
    queryKey,
    queryFn: () => rolesGetList(),
    staleTime: 60 * 1000, // Roles don't change often
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // Get all available permissions
  const permissionsQuery = useQuery({
    queryKey: [...queryKey, 'allPermissions'] as const,
    queryFn: () => rolesGetAllPermissions(),
    staleTime: 5 * 60 * 1000, // Permissions are very stable
    gcTime: 30 * 60 * 1000,
  })

  // Mutations
  const registerMutation = useRolesRegisterRole()
  const deleteMutation = useRolesDelete()
  const updatePermissionsMutation = useRolesUpdatePermissions()

  // Computed
  const roles = computed<RoleDto[]>(() => query.data.value ?? [])
  const allPermissions = computed(() => permissionsQuery.data.value ?? [])
  const isLoading = computed(() => query.isLoading.value)
  const isFetching = computed(() => query.isFetching.value)
  const isMutating = computed(() =>
    registerMutation.isPending.value ||
    deleteMutation.isPending.value ||
    updatePermissionsMutation.isPending.value
  )

  // Cache invalidation
  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  // CRUD operations
  const registerRole = async (data: CreateOrUpdateRoleRequest): Promise<string> => {
    const result = await registerMutation.mutateAsync({ data })
    invalidate()
    return result
  }

  const remove = async (id: string): Promise<string> => {
    const result = await deleteMutation.mutateAsync({ id })
    invalidate()
    return result
  }

  const updatePermissions = async (id: string, data: UpdateRolePermissionsRequest): Promise<string> => {
    const result = await updatePermissionsMutation.mutateAsync({ id, data })
    invalidate()
    return result
  }

  // Get single role
  const getRole = (id: Ref<string>) => {
    return useQuery({
      queryKey: computed(() => ['roles', unref(id)] as const),
      queryFn: () => rolesGetById(unref(id)),
      enabled: computed(() => !!unref(id)),
      staleTime: 60 * 1000,
    })
  }

  const getRoleWithPermissions = (id: Ref<string>) => {
    return useQuery({
      queryKey: computed(() => ['roles', unref(id), 'permissions'] as const),
      queryFn: () => rolesGetByIdWithPermissions(unref(id)),
      enabled: computed(() => !!unref(id)),
      staleTime: 60 * 1000,
    })
  }

  return {
    roles,
    allPermissions,
    isLoading,
    isFetching,
    isMutating,
    registerRole,
    remove,
    updatePermissions,
    getRole,
    getRoleWithPermissions,
    invalidate,
    refetch: () => query.refetch(),
  }
}

export type { RoleDto, CreateOrUpdateRoleRequest, UpdateRolePermissionsRequest }
