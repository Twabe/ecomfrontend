export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, initialize } = useAuth()

  // Initialize auth state from cookies/localStorage
  await initialize()

  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo('/auth/login')
  }

  // Allow access to tenant dashboard
  return
})
