export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()
  const { getFirstAccessibleRoute } = useSmartRedirect()

  // If authenticated, redirect to first accessible page
  if (isAuthenticated.value) {
    return navigateTo(getFirstAccessibleRoute())
  }
})
