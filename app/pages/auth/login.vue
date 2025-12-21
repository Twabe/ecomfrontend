<template>
  <div>
    <!-- Logo/Icon -->
    <div class="flex justify-center mb-8">
      <div class="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
    </div>

    <!-- Title -->
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">
        Welcome Back!
      </h2>
      <p class="text-gray-600">Sign in to your admin account</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-5">
      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
          Email Address
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            class="input pl-10"
            placeholder="admin@example.com"
            :disabled="isLoading"
          />
        </div>
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
          Password
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            autocomplete="current-password"
            class="input pl-10"
            placeholder="••••••••"
            :disabled="isLoading"
          />
        </div>
      </div>

      <!-- Tenant ID (Optional) -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label for="tenant" class="block text-sm font-semibold text-gray-700">
            Tenant ID (Optional)
          </label>
          <button
            type="button"
            @click="showTenantField = !showTenantField"
            class="text-xs text-indigo-600 hover:text-indigo-700"
          >
            {{ showTenantField ? 'Hide' : 'Show' }}
          </button>
        </div>
        <div v-show="showTenantField" class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <input
            id="tenant"
            v-model="form.tenantId"
            type="text"
            class="input pl-10"
            placeholder="root (leave empty for Super Admin)"
            :disabled="isLoading"
          />
        </div>
        <p v-show="showTenantField" class="mt-1 text-xs text-gray-500">
          Leave empty if you're Super Admin. Enter tenant ID for regular users.
        </p>
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember"
            v-model="form.rememberMe"
            type="checkbox"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
          />
          <label for="remember" class="ml-2 block text-sm text-gray-700 cursor-pointer">
            Remember me
          </label>
        </div>

        <div class="text-sm">
          <a href="#" class="font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            Forgot password?
          </a>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
        <div class="flex">
          <svg class="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm">{{ errorMessage }}</span>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          v-if="isLoading"
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        {{ isLoading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>

    <!-- Development Hint -->
    <div class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-semibold text-indigo-900 mb-2">Development Mode</p>
          <div class="text-xs text-indigo-700 space-y-1">
            <p class="font-medium">Default Super Admin Credentials:</p>
            <p class="font-mono bg-white px-2 py-1 rounded border border-indigo-200">Email: admin@root.com</p>
            <p class="font-mono bg-white px-2 py-1 rounded border border-indigo-200">Password: 123Pa$$word!</p>
            <p class="mt-2">Leave Tenant ID empty for Super Admin access.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LoginRequest } from '~/types/auth'

definePageMeta({
  layout: 'auth',
  middleware: ['guest']
})

const { login, isLoading } = useAuth()
const { navigateToFirstAccessible } = useSmartRedirect()

const form = ref<LoginRequest & { rememberMe: boolean; tenantId?: string }>({
  email: '',
  password: '',
  rememberMe: false,
  tenantId: ''
})

const errorMessage = ref<string>('')
const showTenantField = ref(false)

const handleLogin = async () => {
  errorMessage.value = ''

  // Use tenant ID from form, or default to 'root' for Super Admin
  const tenantId = form.value.tenantId?.trim() || 'root'

  const success = await login({
    email: form.value.email,
    password: form.value.password
  }, tenantId)

  if (success) {
    // Smart redirect to first accessible page based on user permissions
    await navigateToFirstAccessible()
  } else {
    errorMessage.value = 'Invalid email or password. Please try again.'
  }
}
</script>
