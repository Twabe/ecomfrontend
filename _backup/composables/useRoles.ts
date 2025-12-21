import type {
  Role,
  CreateOrUpdateRoleRequest,
  UpdateRolePermissionsRequest
} from '~/types/role'

export const useRoles = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const roles = useState<Role[]>('roles', () => [])
  const currentRole = useState<Role | null>('current-role', () => null)
  const isLoading = useState<boolean>('roles-loading', () => false)

  /**
   * Fetch all roles
   */
  const fetchRoles = async (): Promise<void> => {
    isLoading.value = true
    try {
      const response = await api.get<Role[]>('/api/roles')

      // Fetch permissions for each role
      const rolesWithPermissions = await Promise.all(
        response.map(async (role) => {
          try {
            const roleWithPerms = await api.get<Role>(`/api/roles/${role.id}/permissions`)
            return roleWithPerms
          } catch (err) {
            console.error(`Failed to fetch permissions for role ${role.id}:`, err)
            return role // Return role without permissions if fetch fails
          }
        })
      )

      roles.value = rolesWithPermissions
    } catch (err: any) {
      error('Failed to fetch roles')
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get role by ID
   */
  const getRole = async (id: string): Promise<Role | null> => {
    isLoading.value = true
    try {
      const response = await api.get<Role>(`/api/roles/${id}`)
      currentRole.value = response
      return response
    } catch (err: any) {
      error('Failed to fetch role details')
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get role with permissions
   */
  const getRoleWithPermissions = async (id: string): Promise<Role | null> => {
    isLoading.value = true
    try {
      const response = await api.get<Role>(`/api/roles/${id}/permissions`)
      currentRole.value = response
      return response
    } catch (err: any) {
      error('Failed to fetch role permissions')
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create or update role
   */
  const createOrUpdateRole = async (request: CreateOrUpdateRoleRequest): Promise<string | null> => {
    isLoading.value = true
    try {
      const response = await api.post<string>('/api/roles', request)
      success(request.id ? 'Role updated successfully!' : 'Role created successfully!')

      // Refresh roles list
      await fetchRoles()

      return response
    } catch (err: any) {
      error(err?.message || 'Failed to save role')
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update role permissions
   */
  const updateRolePermissions = async (id: string, permissions: string[]): Promise<boolean> => {
    isLoading.value = true
    try {
      const request: UpdateRolePermissionsRequest = {
        roleId: id,
        permissions
      }

      await api.put(`/api/roles/${id}/permissions`, request)
      success('Role permissions updated successfully!')

      // Refresh current role
      if (currentRole.value?.id === id) {
        await getRoleWithPermissions(id)
      }

      return true
    } catch (err: any) {
      error(err?.message || 'Failed to update role permissions')
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete role
   */
  const deleteRole = async (id: string): Promise<boolean> => {
    isLoading.value = true
    try {
      await api.delete(`/api/roles/${id}`)
      success('Role deleted successfully!')

      // Remove from list
      roles.value = roles.value.filter(r => r.id !== id)

      // Clear current role if it's the deleted one
      if (currentRole.value?.id === id) {
        currentRole.value = null
      }

      return true
    } catch (err: any) {
      error(err?.message || 'Failed to delete role')
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get roles statistics
   */
  const getRolesStats = computed(() => {
    return {
      total: roles.value.length,
      withPermissions: roles.value.filter(r => r.permissions && r.permissions.length > 0).length,
      withoutPermissions: roles.value.filter(r => !r.permissions || r.permissions.length === 0).length
    }
  })

  return {
    // State
    roles,
    currentRole,
    isLoading,

    // Computed
    getRolesStats,

    // Methods
    fetchRoles,
    getRole,
    getRoleWithPermissions,
    createOrUpdateRole,
    updateRolePermissions,
    deleteRole
  }
}
