import { VueQueryPlugin, QueryClient, QueryCache } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp) => {
  // Track if we're already handling auth failure to prevent multiple redirects
  let isHandlingAuthFailure = false

  const queryCache = new QueryCache({
    onError: (error: any) => {
      const status = error?.response?.status || error?.status || error?.statusCode

      // Handle 401 globally - cancel all queries and redirect to login
      if (status === 401 && !isHandlingAuthFailure) {
        isHandlingAuthFailure = true

        // Cancel all queries to stop the 401 flood
        queryClient.cancelQueries()
        queryClient.clear()

        // Redirect to login
        navigateTo('/auth/login')

        // Reset flag after a delay to allow future auth failures to be handled
        setTimeout(() => {
          isHandlingAuthFailure = false
        }, 1000)
      }
    },
  })

  const queryClient = new QueryClient({
    queryCache,
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
        retry: (failureCount, error: any) => {
          // Don't retry on 401 - auth errors should redirect, not retry
          const status = error?.response?.status || error?.status || error?.statusCode
          if (status === 401) return false
          return failureCount < 1
        },
        refetchOnWindowFocus: false,
      },
    },
  })

  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient })

  return {
    provide: {
      queryClient,
    },
  }
})
