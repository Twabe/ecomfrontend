import type { AxiosRequestConfig, AxiosResponse } from 'axios'

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

/**
 * Attempt to refresh the auth token
 */
const tryRefreshToken = async (): Promise<boolean> => {
  // If already refreshing, wait for that to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  const { authToken, refreshToken, setAuthToken, setRefreshToken } = useAuthState()

  if (!refreshToken.value || !authToken.value) {
    return false
  }

  isRefreshing = true

  refreshPromise = (async () => {
    try {
      const baseURL = useRuntimeConfig().public.apiBaseUrl || 'https://localhost:5001'
      const { tenantId } = useAuthState()

      const response = await $fetch<{ token: string; refreshToken: string }>(
        `${baseURL}/api/tokens/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(tenantId.value ? { tenant: tenantId.value } : {}),
          },
          body: {
            token: authToken.value,
            refreshToken: refreshToken.value,
          },
        }
      )

      // Update tokens
      setAuthToken(response.token)
      setRefreshToken(response.refreshToken)

      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/**
 * Clear auth and redirect to login
 */
const handleAuthFailure = () => {
  const { setAuthToken, setRefreshToken, setTenantId } = useAuthState()
  setAuthToken(null)
  setRefreshToken(null)
  setTenantId(null)
  navigateTo('/auth/login')
}

// Custom instance for Orval - uses Nuxt's $fetch under the hood
export const customInstance = async <T>(
  config: AxiosRequestConfig,
  isRetry = false
): Promise<T> => {
  // Use shared auth state (same as useAuth and useApi)
  const { authToken, tenantId } = useAuthState()

  const baseURL = useRuntimeConfig().public.apiBaseUrl || 'https://localhost:5001'

  // Build the full URL
  const url = `${baseURL}${config.url}`

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config.headers as Record<string, string>),
  }

  // Add auth token from shared state
  if (authToken.value) {
    headers['Authorization'] = `Bearer ${authToken.value}`
  }

  // Add tenant from shared state
  if (tenantId.value) {
    headers['tenant'] = tenantId.value
  }

  try {
    const response = await $fetch<T>(url, {
      method: config.method as any,
      headers,
      body: config.data,
      params: config.params,
    })

    return response
  } catch (error: any) {
    const status = error?.response?.status || error?.status || error?.statusCode

    // Handle 401 - try to refresh token first
    if (status === 401 && !isRetry) {
      // Skip refresh for auth endpoints
      const isAuthEndpoint = config.url?.includes('/tokens') && !config.url?.includes('/tokens/')

      if (!isAuthEndpoint) {
        const refreshed = await tryRefreshToken()

        if (refreshed) {
          // Retry the original request with new token
          return customInstance<T>(config, true)
        }
      }

      // Refresh failed or not applicable - redirect to login
      handleAuthFailure()
    }

    // Re-throw with better error info
    const message = error?.data?.exception || error?.data?.message || error?.message || 'An error occurred'
    // Log full error for debugging
    console.error('[API Error] URL:', config.url)
    console.error('[API Error] Method:', config.method)
    console.error('[API Error] Status:', status)
    console.error('[API Error] Message:', message)
    console.error('[API Error] Response Data:', JSON.stringify(error?.data, null, 2))
    console.error('[API Error] Request Body:', JSON.stringify(config.data, null, 2))

    // Create an error with response info preserved for status code checking
    const apiError = new Error(message) as Error & { response?: { status: number; data: any } }
    apiError.response = {
      status: status,
      data: error?.data
    }
    throw apiError
  }
}

export default customInstance
