export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, hasPermission, initialize, isLoading } = useAuth()
  const { getFallbackRoute, hasAnyDashboardAccess } = useSmartRedirect()

  // Initialize auth state if not already done
  if (!isAuthenticated.value && !isLoading.value) {
    await initialize()
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo('/auth/login')
  }

  // Get required permission from route meta
  const requiredPermission = to.meta.requiredPermission as string | undefined

  // If a permission is required and user doesn't have it
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.warn(`Access denied: Missing permission ${requiredPermission} for ${to.path}`)

    // Check if user has any dashboard access at all
    if (!hasAnyDashboardAccess()) {
      console.warn('User has no dashboard access, redirecting to login')
      return navigateTo('/auth/login')
    }

    // Get fallback route (excludes current path to prevent infinite loop)
    const fallbackRoute = getFallbackRoute(to.path)
    console.log(`Redirecting to fallback route: ${fallbackRoute}`)
    return navigateTo(fallbackRoute)
  }
})
