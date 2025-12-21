import type {
  User,
  UserRole,
  CreateUserRequest,
  UpdateUserRequest,
  SetPasswordRequest,
  ToggleUserStatusRequest,
  AssignRolesRequest
} from '~/types/user'

export const useUsers = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const users = useState<User[]>('users', () => [])
  const currentUser = useState<User | null>('current-user-details', () => null)
  const currentUserRoles = useState<UserRole[]>('current-user-roles', () => [])
  const isLoading = useState<boolean>('users-loading', () => false)

  /**
   * Fetch all users
   */
  const fetchUsers = async (): Promise<void> => {
    isLoading.value = true
    try {
      const response = await api.get<User[]>('/api/users')
      users.value = response
    } catch (err: any) {
      error('Failed to fetch users')
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get user by ID
   */
  const getUser = async (id: string): Promise<User | null> => {
    isLoading.value = true
    try {
      const response = await api.get<User>(`/api/users/${id}`)
      currentUser.value = response
      return response
    } catch (err: any) {
      error('Failed to fetch user details')
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get user roles
   */
  const getUserRoles = async (id: string): Promise<UserRole[]> => {
    try {
      const response = await api.get<UserRole[]>(`/api/users/${id}/roles`)
      currentUserRoles.value = response
      return response
    } catch (err: any) {
      error('Failed to fetch user roles')
      console.error(err)
      return []
    }
  }

  /**
   * Create new user
   */
  const createUser = async (request: CreateUserRequest): Promise<string | null> => {
    isLoading.value = true
    try {
      const response = await api.post<string>('/api/users', request)
      success('User created successfully!')

      // Refresh user list
      await fetchUsers()

      return response
    } catch (err: any) {
      error(err?.message || 'Failed to create user')
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggle user status (activate/deactivate)
   */
  const toggleUserStatus = async (id: string, activate: boolean): Promise<boolean> => {
    isLoading.value = true
    try {
      const request: ToggleUserStatusRequest = {
        userId: id,
        activateUser: activate
      }

      await api.post(`/api/users/${id}/toggle-status`, request)
      success(`User ${activate ? 'activated' : 'deactivated'} successfully!`)

      // Update user in list
      const user = users.value.find(u => u.id === id)
      if (user) {
        user.isActive = activate
      }

      // Update current user if it's the same
      if (currentUser.value?.id === id) {
        currentUser.value.isActive = activate
      }

      return true
    } catch (err: any) {
      error(err?.message || `Failed to ${activate ? 'activate' : 'deactivate'} user`)
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Assign roles to user
   */
  const assignRoles = async (id: string, roles: UserRole[]): Promise<boolean> => {
    isLoading.value = true
    try {
      const request: AssignRolesRequest = {
        userRoles: roles
      }

      await api.post(`/api/users/${id}/roles`, request)
      success('User roles updated successfully!')

      // Refresh user roles
      await getUserRoles(id)

      return true
    } catch (err: any) {
      error(err?.message || 'Failed to update user roles')
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update user
   */
  const updateUser = async (id: string, request: UpdateUserRequest): Promise<boolean> => {
    isLoading.value = true
    try {
      await api.put(`/api/users/${id}`, request)
      success('User updated successfully!')

      // Update user in list
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          firstName: request.firstName,
          lastName: request.lastName,
          email: request.email,
          phoneNumber: request.phoneNumber
        }
      }

      // Update current user if it's the same
      if (currentUser.value?.id === id) {
        currentUser.value = {
          ...currentUser.value,
          firstName: request.firstName,
          lastName: request.lastName,
          email: request.email,
          phoneNumber: request.phoneNumber
        }
      }

      return true
    } catch (err: any) {
      error(err?.message || 'Failed to update user')
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete user
   */
  const deleteUser = async (id: string): Promise<boolean> => {
    isLoading.value = true
    try {
      await api.delete(`/api/users/${id}`)
      success('User deleted successfully!')

      // Remove user from list
      users.value = users.value.filter(u => u.id !== id)

      // Clear current user if it's the same
      if (currentUser.value?.id === id) {
        currentUser.value = null
      }

      return true
    } catch (err: any) {
      error(err?.message || 'Failed to delete user')
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Set user password (Admin only)
   */
  const setUserPassword = async (id: string, request: SetPasswordRequest): Promise<boolean> => {
    isLoading.value = true
    try {
      await api.post(`/api/users/${id}/set-password`, request)
      success('Password updated successfully!')
      return true
    } catch (err: any) {
      error(err?.message || 'Failed to set password')
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get user statistics
   */
  const getUsersStats = computed(() => {
    return {
      total: users.value.length,
      active: users.value.filter(u => u.isActive).length,
      inactive: users.value.filter(u => !u.isActive).length,
      emailConfirmed: users.value.filter(u => u.emailConfirmed).length,
      emailNotConfirmed: users.value.filter(u => !u.emailConfirmed).length
    }
  })

  return {
    // State
    users,
    currentUser,
    currentUserRoles,
    isLoading,

    // Computed
    getUsersStats,

    // Methods
    fetchUsers,
    getUser,
    getUserRoles,
    createUser,
    updateUser,
    deleteUser,
    setUserPassword,
    toggleUserStatus,
    assignRoles
  }
}
