<template>
  <div>
    <!-- Welcome Section -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">
        Welcome back, {{ user?.firstName || user?.userName }}! 👋
      </h2>
      <p class="text-gray-600">
        Here's what's happening with your tenants today.
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Tenants -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Total Tenants</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.totalTenants }}</p>
          </div>
          <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-green-600 font-medium">+12%</span>
          <span class="text-gray-600 ml-2">from last month</span>
        </div>
      </div>

      <!-- Active Tenants -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Active Tenants</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.activeTenants }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-green-600 font-medium">+8%</span>
          <span class="text-gray-600 ml-2">from last month</span>
        </div>
      </div>

      <!-- Total Users -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Total Users</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.totalUsers }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-green-600 font-medium">+23%</span>
          <span class="text-gray-600 ml-2">from last month</span>
        </div>
      </div>

      <!-- System Health -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">System Health</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.systemHealth }}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-green-600 font-medium">Healthy</span>
          <span class="text-gray-600 ml-2">All systems operational</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Recent Tenants -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Recent Tenants</h3>
          <NuxtLink to="/super-admin/tenants" class="text-sm text-indigo-600 hover:text-indigo-700">
            View all →
          </NuxtLink>
        </div>
        <div class="space-y-3">
          <div v-if="isLoading" class="text-center py-8 text-gray-500">
            Loading...
          </div>
          <div v-else-if="recentTenants.length === 0" class="text-center py-8 text-gray-500">
            No tenants yet. <NuxtLink to="/super-admin/tenants/create" class="text-indigo-600">Create one</NuxtLink>
          </div>
          <div v-else v-for="tenant in recentTenants" :key="tenant.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <p class="font-medium text-gray-900">{{ tenant.name }}</p>
              <p class="text-sm text-gray-600">{{ tenant.identifier }}</p>
            </div>
            <span :class="tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 text-xs font-medium rounded">
              {{ tenant.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div class="space-y-3">
          <NuxtLink
            to="/super-admin/tenants/create"
            class="flex items-center space-x-3 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
          >
            <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Create New Tenant</p>
              <p class="text-sm text-gray-600">Set up a new organization</p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/super-admin/users"
            class="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Manage Users</p>
              <p class="text-sm text-gray-600">View and manage all users</p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/super-admin/system/settings"
            class="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <div class="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">System Settings</p>
              <p class="text-sm text-gray-600">Configure system preferences</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Tenant } from '~/types/tenant'

definePageMeta({
  layout: 'super-admin',
  middleware: ['auth', 'super-admin']
})

const { user } = useAuth()
const api = useApi()

// Stats
const stats = ref({
  totalTenants: 0,
  activeTenants: 0,
  totalUsers: 0,
  systemHealth: '99.9%'
})

const isLoading = ref(true)
const recentTenants = ref<Tenant[]>([])

// Fetch real tenants from API
const fetchTenants = async () => {
  try {
    isLoading.value = true
    // The tenants endpoint returns a list, not paginated
    const response = await api.get<Tenant[]>('/api/tenants')

    // Take only the 5 most recent for display
    recentTenants.value = response.slice(0, 5)

    // Calculate stats from response
    stats.value.totalTenants = response.length
    stats.value.activeTenants = response.filter(t => t.isActive).length
  } catch (err) {
    console.error('Failed to fetch tenants:', err)
  } finally {
    isLoading.value = false
  }
}

// Fetch data on mount
onMounted(() => {
  fetchTenants()
})
</script>
