/**
 * SignalR Client Plugin
 * Automatically connects to SignalR when user is authenticated
 * .client suffix ensures this only runs on client-side
 */
export default defineNuxtPlugin(() => {
  const { authToken } = useAuthState()
  const signalR = useSignalR()

  // Expose for debugging in browser console
  if (typeof window !== 'undefined') {
    (window as any).$signalR = signalR
  }

  // Watch for auth token changes
  watch(
    () => authToken.value,
    async (newToken, oldToken) => {
      if (newToken && !oldToken) {
        // User just logged in - connect to SignalR
        console.log('[SignalR Plugin] Auth token detected, connecting...')
        await signalR.connect()
      } else if (!newToken && oldToken) {
        // User just logged out - disconnect
        console.log('[SignalR Plugin] Auth token removed, disconnecting...')
        await signalR.disconnect()
      }
    },
    { immediate: true }
  )

  // Also try to connect on app load if already authenticated
  onNuxtReady(async () => {
    if (authToken.value) {
      console.log('[SignalR Plugin] Already authenticated, connecting...')
      await signalR.connect()
    }
  })
})
