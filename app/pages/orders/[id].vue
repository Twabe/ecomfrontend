<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Redirection...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()

// Redirect to dashboard orders page preserving query params
onMounted(() => {
  const orderId = route.params.id as string
  const query = route.query
  router.replace({
    path: `/dashboard/orders/${orderId}`,
    query
  })
})
</script>
