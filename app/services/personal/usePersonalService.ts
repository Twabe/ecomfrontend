/**
 * Personal Service
 *
 * Current user profile management
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  personalGetProfile,
  personalGetPermissions,
  personalGetLogs,
  usePersonalUpdateProfile,
  usePersonalChangePassword,
} from '~/api/generated/endpoints/personal/personal'
import type {
  UserDetailsDto,
  UpdateUserRequest,
  ChangePasswordRequest,
  AuditDto,
} from '~/api/generated/models'

export function usePersonalService() {
  const queryClient = useQueryClient()

  const queryKey = ['personal'] as const

  // Profile query
  const profileQuery = useQuery({
    queryKey: [...queryKey, 'profile'] as const,
    queryFn: () => personalGetProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  })

  // Permissions query
  const permissionsQuery = useQuery({
    queryKey: [...queryKey, 'permissions'] as const,
    queryFn: () => personalGetPermissions(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  // Mutations
  const updateProfileMutation = usePersonalUpdateProfile()
  const changePasswordMutation = usePersonalChangePassword()

  // Computed
  const profile = computed<UserDetailsDto | undefined>(() => profileQuery.data.value)
  const permissions = computed<string[]>(() => permissionsQuery.data.value ?? [])
  const isLoading = computed(() => profileQuery.isLoading.value || permissionsQuery.isLoading.value)
  const isMutating = computed(() =>
    updateProfileMutation.isPending.value ||
    changePasswordMutation.isPending.value
  )

  // Actions
  const updateProfile = async (data: UpdateUserRequest): Promise<void> => {
    await updateProfileMutation.mutateAsync({ data })
    queryClient.invalidateQueries({ queryKey: [...queryKey, 'profile'] })
  }

  const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
    await changePasswordMutation.mutateAsync({ data })
  }

  // Logs query (on-demand)
  const useLogs = () => {
    return useQuery({
      queryKey: [...queryKey, 'logs'] as const,
      queryFn: () => personalGetLogs(),
      staleTime: 30 * 1000,
    })
  }

  // Permission check helper
  const hasPermission = (permission: string): boolean => {
    return permissions.value.includes(permission)
  }

  const hasAnyPermission = (...perms: string[]): boolean => {
    return perms.some(p => permissions.value.includes(p))
  }

  const hasAllPermissions = (...perms: string[]): boolean => {
    return perms.every(p => permissions.value.includes(p))
  }

  return {
    profile,
    permissions,
    isLoading,
    isMutating,
    updateProfile,
    changePassword,
    useLogs,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetchProfile: () => profileQuery.refetch(),
    refetchPermissions: () => permissionsQuery.refetch(),
  }
}

export type { UserDetailsDto, UpdateUserRequest, ChangePasswordRequest }
