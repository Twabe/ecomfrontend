<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ config.public.appName }}
        </h1>
        <p class="text-gray-600 mt-2">Multi-Tenant Admin Dashboard</p>
      </div>

      <!-- Auth Card -->
      <div class="bg-white rounded-lg shadow-xl p-8">
        <slot />
      </div>

      <!-- Footer -->
      <div class="text-center mt-6 text-sm text-gray-600">
        <p>&copy; 2024 {{ config.public.appName }}. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
</script>
