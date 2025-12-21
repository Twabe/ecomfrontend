import type { LoginRequest, TokenResponse, User } from '~/types/auth'

export const useAuth = () => {
  const api = useApi()
  const router = useRouter()
  const { success, error } = useNotification()

  // Use shared auth state
  const {
    authToken,
    refreshToken,
    setAuthToken,
    setRefreshToken,
    setTenantId
  } = useAuthState()

  // User state
  const user = useState<User | null>('auth-user', () => null)
  const isAuthenticated = computed(() => !!authToken.value && !!user.value)
  const isLoading = useState<boolean>('auth-loading', () => false)

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    return user.value?.roles?.includes(role) ?? false
  }

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    return user.value?.permissions?.includes(permission) ?? false
  }

  /**
   * Check if user is Super Admin
   * Note: Checking permissions instead of roles because backend doesn't return roles in profile API
   * Super Admins have tenant management permissions
   */
  const isSuperAdmin = computed(() =>
    hasPermission('Permissions.Tenants.View') ||
    hasPermission('Permissions.Tenants.Create') ||
    hasRole('SuperAdmin') ||
    hasRole('Administrator')
  )

  /**
   * Login with email and password
   */
  const login = async (credentials: LoginRequest, tenantId?: string): Promise<boolean> => {
    isLoading.value = true

    const loginTenantId = tenantId || 'root'

    try {
      // Call login API - Super Admin must use 'root' tenant
      const response = await api.post<TokenResponse>('/api/tokens', credentials, {
        skipAuth: true,
        tenantId: loginTenantId
      })

      console.log('Login response:', response)
      console.log('Token received:', response.token?.substring(0, 50) + '...')

      // Store tokens and tenant ID using setters (syncs with cookies)
      setAuthToken(response.token)
      setRefreshToken(response.refreshToken)
      setTenantId(loginTenantId) // Store tenant ID for future requests

      console.log('Token stored:', authToken.value?.substring(0, 50) + '...')
      console.log('Tenant ID stored:', loginTenantId)

      // Fetch user profile
      await fetchUserProfile()

      success('Login successful!')
      return true
    } catch (err: any) {
      error(err?.message || 'Login failed. Please check your credentials.')
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch current user profile
   */
  const fetchUserProfile = async (): Promise<void> => {
    try {
      // Fetch profile and permissions in parallel
      const [profileResponse, permissionsResponse] = await Promise.all([
        api.get<User>('/api/personal/profile'),
        api.get<string[]>('/api/personal/permissions')
      ])

      console.log('👤 User Profile Response:', profileResponse)
      console.log('👤 User Permissions:', permissionsResponse)

      // Combine profile with permissions
      user.value = {
        ...profileResponse,
        permissions: permissionsResponse,
        // Backend doesn't return roles separately, so we'll keep roles empty for now
        // We check isSuperAdmin via permissions instead
        roles: []
      }

      console.log('👤 Final User Object:', user.value)
      console.log('👤 User Roles:', user.value.roles)
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      // If profile fetch fails, clear auth
      await logout(false)
    }
  }

  /**
   * Logout user
   */
  const logout = async (showMessage = true): Promise<void> => {
    // Clear tokens and tenant using setters (syncs with cookies)
    setAuthToken(null)
    setRefreshToken(null)
    setTenantId(null)
    user.value = null

    // Redirect to login
    await router.push('/auth/login')

    if (showMessage) {
      success('Logged out successfully')
    }
  }

  /**
   * Refresh access token
   */
  const refresh = async (): Promise<boolean> => {
    if (!refreshToken.value || !authToken.value) {
      return false
    }

    try {
      const response = await api.post<TokenResponse>('/api/tokens/refresh', {
        token: authToken.value,
        refreshToken: refreshToken.value
      }, {
        skipAuth: true
      })

      setAuthToken(response.token)
      setRefreshToken(response.refreshToken)

      return true
    } catch (err) {
      console.error('Token refresh failed:', err)
      await logout(false)
      return false
    }
  }

  /**
   * Initialize auth state (check if user is already logged in)
   */
  const initialize = async (): Promise<void> => {
    if (authToken.value && !user.value) {
      isLoading.value = true
      try {
        await fetchUserProfile()
      } catch (err) {
        console.error('Auth initialization failed:', err)
        await logout(false)
      } finally {
        isLoading.value = false
      }
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    isSuperAdmin,

    // Methods
    login,
    logout,
    refresh,
    initialize,
    fetchUserProfile,
    hasRole,
    hasPermission
  }
}
