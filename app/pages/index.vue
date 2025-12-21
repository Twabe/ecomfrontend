<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Redirecting...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated, initialize } = useAuth()
const { navigateToFirstAccessible } = useSmartRedirect()

onMounted(async () => {
  // Initialize auth
  await initialize()

  // Redirect based on auth status
  if (isAuthenticated.value) {
    // Smart redirect to first accessible page based on permissions
    await navigateToFirstAccessible()
  } else {
    await navigateTo('/auth/login')
  }
})
</script>
