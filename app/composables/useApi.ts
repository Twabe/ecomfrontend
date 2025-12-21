import type { UseFetchOptions } from 'nuxt/app'
import type { ApiError } from '~/types/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface ApiOptions extends Omit<UseFetchOptions<any>, 'method'> {
  skipAuth?: boolean
  tenantId?: string
  _isRetry?: boolean
}

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

export const useApi = () => {
  const config = useRuntimeConfig()
  const router = useRouter()

  // Use shared auth state
  const { authToken, refreshToken, tenantId: currentTenantId, setAuthToken, setRefreshToken, setTenantId } = useAuthState()

  /**
   * Attempt to refresh the auth token
   */
  const tryRefreshToken = async (): Promise<boolean> => {
    // If already refreshing, wait for that to complete
    if (isRefreshing && refreshPromise) {
      return refreshPromise
    }

    if (!refreshToken.value || !authToken.value) {
      return false
    }

    isRefreshing = true

    refreshPromise = (async () => {
      try {
        const tenantId = currentTenantId.value

        const response = await $fetch<{ token: string; refreshToken: string }>(
          '/api/tokens/refresh',
          {
            baseURL: config.public.apiBaseUrl as string,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(tenantId ? { tenant: tenantId } : {}),
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
    setAuthToken(null)
    setRefreshToken(null)
    setTenantId(null)
    router.push('/auth/login')
  }

  /**
   * Make API request with automatic token injection and error handling
   */
  const request = async <T = any>(
    url: string,
    method: HttpMethod,
    options?: ApiOptions
  ): Promise<T> => {

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options?.headers as Record<string, string>)
    }

    // Add auth token if exists and not skipped
    if (authToken.value && !options?.skipAuth) {
      headers['Authorization'] = `Bearer ${authToken.value}`
    }

    // Add tenant header if exists (for multi-tenancy)
    // Backend expects lowercase 'tenant' header, not 'X-Tenant'
    const tenantId = options?.tenantId || currentTenantId.value
    if (tenantId) {
      headers['tenant'] = tenantId
    }

    // Debug logging
    if (!options?.skipAuth) {
      console.log(`API Request to ${url}:`, {
        method,
        hasAuth: !!headers['Authorization'],
        authPreview: headers['Authorization']?.substring(0, 30) + '...' || 'NOT SET',
        tenant: headers['tenant'] || 'NOT SET'
      })
    }

    try {
      // Use baseURL to point directly to backend API
      const response = await $fetch<T>(url, {
        baseURL: config.public.apiBaseUrl as string,
        method,
        headers,
        ...options,
        // Handle errors
        onResponseError({ response }) {
          // Don't call handleApiError for 401 - we'll handle it below with retry
          if (response.status !== 401) {
            handleApiError(response._data, response.status)
          }
        }
      })

      return response
    } catch (error: any) {
      const statusCode = error?.response?.status || error?.status || error?.statusCode

      // Handle 401 - try to refresh token first
      if (statusCode === 401 && !options?._isRetry) {
        // Skip refresh for auth endpoints
        const isAuthEndpoint = url.includes('/tokens') && !url.includes('/tokens/')

        if (!isAuthEndpoint && !options?.skipAuth) {
          const refreshed = await tryRefreshToken()

          if (refreshed) {
            // Retry the original request with new token
            return request<T>(url, method, { ...options, _isRetry: true })
          }
        }

        // Refresh failed or not applicable - redirect to login
        handleAuthFailure()
        showError('Session expired. Please login again.')
      }

      // Re-throw for component-level handling if needed
      throw error
    }
  }

  /**
   * Handle API errors globally
   */
  const handleApiError = (error: any, statusCode: number) => {
    const apiError: ApiError = {
      statusCode,
      message: error?.message || error?.title || 'An error occurred',
      errors: error?.errors
    }

    // Handle 401 Unauthorized - try refresh token first
    if (statusCode === 401) {
      // Don't show error here - let the retry mechanism handle it
      return
    }

    // Handle 403 Forbidden
    if (statusCode === 403) {
      showError('You do not have permission to perform this action.')
      return
    }

    // Handle 404 Not Found
    if (statusCode === 404) {
      showError('Resource not found.')
      return
    }

    // Handle validation errors (400)
    if (statusCode === 400 && apiError.errors) {
      const validationMessages = Object.values(apiError.errors)
        .flat()
        .join(', ')
      showError(validationMessages || apiError.message)
      return
    }

    // Handle server errors (500+)
    if (statusCode >= 500) {
      // Try to extract actual error message from backend
      const serverMessage = error?.message || error?.messages?.[0] || error?.detail || 'Server error. Please try again later.'
      showError(serverMessage)
      return
    }

    // Default error message
    showError(apiError.message)
  }

  /**
   * Show error notification
   */
  const showError = (message: string) => {
    const { error } = useNotification()
    error(message)
  }

  /**
   * GET request
   */
  const get = <T = any>(url: string, options?: ApiOptions) => {
    return request<T>(url, 'GET', options)
  }

  /**
   * POST request
   */
  const post = <T = any>(url: string, body?: any, options?: ApiOptions) => {
    return request<T>(url, 'POST', { ...options, body })
  }

  /**
   * PUT request
   */
  const put = <T = any>(url: string, body?: any, options?: ApiOptions) => {
    return request<T>(url, 'PUT', { ...options, body })
  }

  /**
   * DELETE request
   */
  const del = <T = any>(url: string, options?: ApiOptions) => {
    return request<T>(url, 'DELETE', options)
  }

  /**
   * PATCH request
   */
  const patch = <T = any>(url: string, body?: any, options?: ApiOptions) => {
    return request<T>(url, 'PATCH', { ...options, body })
  }

  return {
    get,
    post,
    put,
    delete: del,
    patch,
    request
  }
}
