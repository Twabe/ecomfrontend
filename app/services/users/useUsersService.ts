/**
 * Users Service
 *
 * Special service - user management (not standard CRUD)
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  usersGetList,
  usersGetById,
  usersGetRoles,
  useUsersCreate,
  useUsersUpdate,
  useUsersDelete,
  useUsersToggleStatus,
  useUsersAdminSetPassword,
  useUsersAssignRoles,
} from '~/api/generated/endpoints/users/users'
import type {
  UserDetailsDto,
  UserRoleDto,
  CreateUserRequest,
  UpdateUserRequest,
  ToggleUserStatusRequest,
  AdminSetPasswordRequest,
  UserRolesRequest,
} from '~/api/generated/models'

export function useUsersService() {
  const queryClient = useQueryClient()

  const queryKey = ['users'] as const

  // Get all users
  const query = useQuery({
    queryKey,
    queryFn: () => usersGetList(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // Mutations
  const createMutation = useUsersCreate()
  const updateMutation = useUsersUpdate()
  const deleteMutation = useUsersDelete()
  const toggleStatusMutation = useUsersToggleStatus()
  const setPasswordMutation = useUsersAdminSetPassword()
  const assignRolesMutation = useUsersAssignRoles()

  // Computed
  const users = computed<UserDetailsDto[]>(() => query.data.value ?? [])
  const isLoading = computed(() => query.isLoading.value)
  const isFetching = computed(() => query.isFetching.value)
  const isMutating = computed(() =>
    createMutation.isPending.value ||
    updateMutation.isPending.value ||
    deleteMutation.isPending.value
  )

  // Cache invalidation
  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  // CRUD operations
  const create = async (data: CreateUserRequest): Promise<string> => {
    const result = await createMutation.mutateAsync({ data })
    invalidate()
    return result
  }

  const update = async (id: string, data: UpdateUserRequest): Promise<void> => {
    await updateMutation.mutateAsync({ id, data })
    invalidate()
  }

  const remove = async (id: string): Promise<string> => {
    const result = await deleteMutation.mutateAsync({ id })
    invalidate()
    return result
  }

  // Special operations
  const toggleStatus = async (data: ToggleUserStatusRequest): Promise<void> => {
    await toggleStatusMutation.mutateAsync({ data })
    invalidate()
  }

  const setPassword = async (id: string, data: AdminSetPasswordRequest): Promise<void> => {
    await setPasswordMutation.mutateAsync({ id, data })
  }

  const assignRoles = async (id: string, data: UserRolesRequest): Promise<string> => {
    const result = await assignRolesMutation.mutateAsync({ id, data })
    invalidate()
    return result
  }

  // Get single user
  const getUser = (id: Ref<string>) => {
    return useQuery({
      queryKey: computed(() => ['users', unref(id)] as const),
      queryFn: () => usersGetById(unref(id)),
      enabled: computed(() => !!unref(id)),
      staleTime: 30 * 1000,
    })
  }

  // Get user roles
  const getUserRoles = (userId: Ref<string | null>) => {
    return useQuery({
      queryKey: computed(() => ['users', unref(userId), 'roles'] as const),
      queryFn: () => usersGetRoles(unref(userId)),
      enabled: computed(() => !!unref(userId)),
      staleTime: 30 * 1000,
    })
  }

  return {
    users,
    isLoading,
    isFetching,
    isMutating,
    create,
    update,
    remove,
    toggleStatus,
    setPassword,
    assignRoles,
    getUser,
    getUserRoles,
    invalidate,
    refetch: () => query.refetch(),
  }
}

export type { UserDetailsDto, UserRoleDto, CreateUserRequest, UpdateUserRequest, AdminSetPasswordRequest, UserRolesRequest }
