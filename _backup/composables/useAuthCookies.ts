/**
 * Shared auth state using useState for reactive sharing across composables
 * Uses localStorage for persistence (client-only, no SSR issues)
 */

export const useAuthState = () => {
  // Reactive state - shared across all composables
  // Initialize from localStorage on client side
  const authToken = useState<string | null>('auth-token', () => {
    if (process.client) {
      return localStorage.getItem('auth_token')
    }
    return null
  })

  const refreshToken = useState<string | null>('refresh-token', () => {
    if (process.client) {
      return localStorage.getItem('refresh_token')
    }
    return null
  })

  const tenantId = useState<string | null>('tenant-id', () => {
    if (process.client) {
      return localStorage.getItem('tenant_id')
    }
    return null
  })

  // Helper functions to sync with localStorage
  const setAuthToken = (value: string | null) => {
    authToken.value = value
    if (process.client) {
      if (value) {
        localStorage.setItem('auth_token', value)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  const setRefreshToken = (value: string | null) => {
    refreshToken.value = value
    if (process.client) {
      if (value) {
        localStorage.setItem('refresh_token', value)
      } else {
        localStorage.removeItem('refresh_token')
      }
    }
  }

  const setTenantId = (value: string | null) => {
    tenantId.value = value
    if (process.client) {
      if (value) {
        localStorage.setItem('tenant_id', value)
      } else {
        localStorage.removeItem('tenant_id')
      }
    }
  }

  return {
    authToken,
    refreshToken,
    tenantId,
    setAuthToken,
    setRefreshToken,
    setTenantId
  }
}
