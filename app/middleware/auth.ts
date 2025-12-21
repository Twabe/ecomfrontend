export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, initialize, isLoading, user } = useAuth()
  const { authToken } = useAuthState()

  console.log('🔐 Auth Middleware Check:', {
    route: to.path,
    isAuthenticated: isAuthenticated.value,
    hasToken: !!authToken.value,
    hasUser: !!user.value,
    isLoading: isLoading.value
  })

  // Initialize auth state if not already done
  if (!isAuthenticated.value && !isLoading.value) {
    console.log('🔄 Initializing auth state...')
    await initialize()
    console.log('✅ After initialize:', {
      isAuthenticated: isAuthenticated.value,
      hasToken: !!authToken.value,
      hasUser: !!user.value
    })
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    console.log('❌ Not authenticated, redirecting to login')
    return navigateTo('/auth/login')
  }

  console.log('✅ Auth middleware passed')
})
