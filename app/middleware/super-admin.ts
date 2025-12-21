export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isSuperAdmin, isAuthenticated, initialize, user } = useAuth()
  const { getFirstAccessibleRoute } = useSmartRedirect()

  console.log('👑 Super Admin Middleware Check:', {
    route: to.path,
    isAuthenticated: isAuthenticated.value,
    isSuperAdmin: isSuperAdmin.value,
    userRoles: user.value?.roles || []
  })

  // Initialize auth if needed
  if (!isAuthenticated.value) {
    console.log('🔄 Not authenticated, initializing...')
    await initialize()
  }

  // Check if user is authenticated
  if (!isAuthenticated.value) {
    console.log('❌ Still not authenticated after init, redirecting to login')
    return navigateTo('/auth/login')
  }

  // Check if user is super admin
  if (!isSuperAdmin.value) {
    console.log('❌ User is not Super Admin, redirecting to first accessible route')
    return navigateTo(getFirstAccessibleRoute())
  }

  console.log('✅ Super Admin middleware passed')
})
