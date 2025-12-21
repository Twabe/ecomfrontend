<template>
  <div>
    <!-- Upgrade Subscription Modal -->
    <TenantUpgradeSubscriptionModal
      :is-open="showUpgradeModal"
      :tenant="selectedTenant"
      @close="closeUpgradeModal"
      @upgrade="handleUpgradeSubmit"
    />

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Tenants</h2>
        <p class="text-gray-600 mt-1">Manage all tenants in the system</p>
      </div>
      <NuxtLink to="/super-admin/tenants/create" class="btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create Tenant
      </NuxtLink>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Total Tenants</p>
        <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Active</p>
        <p class="text-2xl font-bold text-green-600">{{ stats.active }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Inactive</p>
        <p class="text-2xl font-bold text-red-600">{{ stats.inactive }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading tenants...</p>
      </div>

      <div v-else-if="tenants.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No tenants yet</h3>
        <p class="text-gray-600 mb-4">Get started by creating your first tenant.</p>
        <NuxtLink to="/super-admin/tenants/create" class="btn-primary">
          Create Tenant
        </NuxtLink>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Identifier
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="tenant in tenants" :key="tenant.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ tenant.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-600">{{ tenant.identifier }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-600">{{ tenant.adminEmail }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ tenant.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ formatDate(tenant.createdOn) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <NuxtLink
                    :to="`/super-admin/tenants/${tenant.id}`"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    View
                  </NuxtLink>
                  <button
                    @click="openUpgradeModal(tenant)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Upgrade Subscription"
                  >
                    Upgrade
                  </button>
                  <button
                    v-if="!tenant.isActive"
                    @click="handleActivate(tenant.id)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Activate
                  </button>
                  <button
                    v-else
                    @click="handleDeactivate(tenant.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Deactivate
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTenantsService, type TenantDto } from '~/services'

definePageMeta({
  layout: 'super-admin',
  middleware: ['auth', 'super-admin']
})

const {
  tenants,
  isLoading,
  activate: activateTenant,
  deactivate: deactivateTenant,
  upgradeSubscription,
  refetch: fetchTenants
} = useTenantsService()

// Modal state
const showUpgradeModal = ref(false)
const selectedTenant = ref<TenantDto | null>(null)

// Computed stats from tenants list
const stats = computed(() => {
  const list = tenants.value ?? []
  return {
    total: list.length,
    active: list.filter(t => t.isActive).length,
    inactive: list.filter(t => !t.isActive).length
  }
})

const formatDate = (date?: Date | string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleActivate = async (id: string) => {
  if (confirm('Are you sure you want to activate this tenant?')) {
    await activateTenant(id)
  }
}

const handleDeactivate = async (id: string) => {
  if (confirm('Are you sure you want to deactivate this tenant?')) {
    await deactivateTenant(id)
  }
}

// Open upgrade modal
const openUpgradeModal = (tenant: TenantDto) => {
  selectedTenant.value = tenant
  showUpgradeModal.value = true
}

// Close upgrade modal
const closeUpgradeModal = () => {
  showUpgradeModal.value = false
  selectedTenant.value = null
}

// Handle upgrade submission
const handleUpgradeSubmit = async (data: { tenantId: string; extendedExpiryDate: string }) => {
  try {
    await upgradeSubscription(data.tenantId, data.extendedExpiryDate)
    await fetchTenants() // Refresh list
    closeUpgradeModal()
  } catch (err) {
    // Error handled by composable
  }
}

// Fetch tenants on mount
onMounted(async () => {
  await fetchTenants()
})
</script>
