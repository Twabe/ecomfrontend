<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading && !currentTenant" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading tenant...</p>
    </div>

    <!-- Tenant Details -->
    <div v-else-if="currentTenant">
      <!-- Header -->
      <div class="mb-6">
        <NuxtLink to="/super-admin/tenants" class="text-indigo-600 hover:text-indigo-700 mb-2 inline-block">
          ← Back to Tenants
        </NuxtLink>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ currentTenant.name }}</h2>
            <p class="text-gray-600 mt-1">Tenant Details</p>
          </div>
          <div class="flex items-center space-x-3">
            <span
              :class="currentTenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full"
            >
              {{ currentTenant.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center space-x-3 mb-6">
        <button
          v-if="!currentTenant.isActive"
          @click="handleActivate"
          :disabled="isLoading"
          class="btn-primary"
        >
          Activate Tenant
        </button>
        <button
          v-else
          @click="handleDeactivate"
          :disabled="isLoading"
          class="btn-danger"
        >
          Deactivate Tenant
        </button>
      </div>

      <!-- Details Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Basic Information -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Tenant Name</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ currentTenant.name }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Identifier</dt>
              <dd class="mt-1 text-sm text-gray-900 font-mono">{{ currentTenant.identifier }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Admin Email</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ currentTenant.adminEmail }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Status</dt>
              <dd class="mt-1">
                <span
                  :class="currentTenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ currentTenant.isActive ? 'Active' : 'Inactive' }}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <!-- Additional Information -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Tenant ID</dt>
              <dd class="mt-1 text-sm text-gray-900 font-mono">{{ currentTenant.id }}</dd>
            </div>
            <div v-if="currentTenant.validUpto">
              <dt class="text-sm font-medium text-gray-500">Valid Until</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(currentTenant.validUpto) }}</dd>
            </div>
            <div v-if="currentTenant.issuer">
              <dt class="text-sm font-medium text-gray-500">Issuer</dt>
              <dd class="mt-1 text-sm text-gray-900 break-all">{{ currentTenant.issuer }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Created On</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDateTime(currentTenant.createdOn) }}</dd>
            </div>
            <div v-if="currentTenant.modifiedOn">
              <dt class="text-sm font-medium text-gray-500">Last Modified</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDateTime(currentTenant.modifiedOn) }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Actions Section -->
      <div class="mt-6 card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button class="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div class="text-left">
              <p class="font-medium text-gray-900">View Users</p>
              <p class="text-sm text-gray-600">Manage tenant users</p>
            </div>
          </button>

          <button class="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="text-left">
              <p class="font-medium text-gray-900">View Statistics</p>
              <p class="text-sm text-gray-600">Orders, revenue, etc.</p>
            </div>
          </button>

          <button class="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="text-left">
              <p class="font-medium text-gray-900">Settings</p>
              <p class="text-sm text-gray-600">Configure tenant</p>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-12">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Tenant not found</h3>
      <NuxtLink to="/super-admin/tenants" class="text-indigo-600 hover:text-indigo-700">
        Back to Tenants
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTenantsService } from '~/services'

definePageMeta({
  layout: 'super-admin',
  middleware: ['auth', 'super-admin']
})

const route = useRoute()
const tenantIdParam = ref(route.params.id as string)

const {
  activate: activateTenant,
  deactivate: deactivateTenant,
  getTenant
} = useTenantsService()

// Get single tenant query
const tenantQuery = getTenant(tenantIdParam)
const currentTenant = computed(() => tenantQuery.data.value)
const isLoading = computed(() => tenantQuery.isLoading.value)

const formatDate = (date?: Date | string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (date?: Date | string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleActivate = async () => {
  if (confirm('Are you sure you want to activate this tenant?')) {
    await activateTenant(tenantIdParam.value)
  }
}

const handleDeactivate = async () => {
  if (confirm('Are you sure you want to deactivate this tenant? Users will not be able to access the system.')) {
    await deactivateTenant(tenantIdParam.value)
  }
}
</script>
