<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <NuxtLink to="/super-admin/tenants" class="text-indigo-600 hover:text-indigo-700 mb-2 inline-block">
        ← Back to Tenants
      </NuxtLink>
      <h2 class="text-2xl font-bold text-gray-900">Create New Tenant</h2>
      <p class="text-gray-600 mt-1">Set up a new organization in the system</p>
    </div>

    <!-- Form -->
    <div class="card max-w-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Tenant Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Tenant Name <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="input"
            placeholder="Acme Corporation"
            :disabled="isLoading"
          />
          <p class="mt-1 text-sm text-gray-500">The display name of the organization</p>
        </div>

        <!-- Tenant ID -->
        <div>
          <label for="id" class="block text-sm font-medium text-gray-700 mb-2">
            Tenant ID (Unique Key) <span class="text-red-500">*</span>
          </label>
          <input
            id="id"
            v-model="form.id"
            type="text"
            required
            pattern="[a-z0-9\-]+"
            class="input"
            placeholder="acme-corp"
            :disabled="isLoading"
            @input="formatId"
          />
          <p class="mt-1 text-sm text-gray-500">
            Lowercase letters, numbers, and hyphens only. Used as unique identifier.
          </p>
        </div>

        <!-- Admin Email -->
        <div>
          <label for="adminEmail" class="block text-sm font-medium text-gray-700 mb-2">
            Admin Email <span class="text-red-500">*</span>
          </label>
          <input
            id="adminEmail"
            v-model="form.adminEmail"
            type="email"
            required
            class="input"
            placeholder="admin@acme.com"
            :disabled="isLoading"
          />
          <p class="mt-1 text-sm text-gray-500">
            Email address for the tenant administrator
          </p>
        </div>

        <!-- Connection String (Optional) -->
        <div>
          <label for="connectionString" class="block text-sm font-medium text-gray-700 mb-2">
            Connection String (Optional)
          </label>
          <textarea
            id="connectionString"
            v-model="form.connectionString"
            rows="3"
            class="input"
            placeholder="Server=localhost;Database=tenant_db;..."
            :disabled="isLoading"
          />
          <p class="mt-1 text-sm text-gray-500">
            Custom database connection string. Leave empty to use default.
          </p>
        </div>

        <!-- Issuer (Optional) -->
        <div>
          <label for="issuer" class="block text-sm font-medium text-gray-700 mb-2">
            Issuer (Optional)
          </label>
          <input
            id="issuer"
            v-model="form.issuer"
            type="text"
            class="input"
            placeholder="https://auth.acme.com"
            :disabled="isLoading"
          />
          <p class="mt-1 text-sm text-gray-500">
            Custom identity provider issuer URL
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {{ errorMessage }}
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-4">
          <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary flex items-center"
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
            {{ isLoading ? 'Creating...' : 'Create Tenant' }}
          </button>
          <NuxtLink to="/super-admin/tenants" class="btn-secondary">
            Cancel
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTenantsService, type CreateTenantRequest } from '~/services'

definePageMeta({
  layout: 'super-admin',
  middleware: ['auth', 'super-admin']
})

const router = useRouter()
const { create: createTenant, isMutating: isLoading } = useTenantsService()

const form = ref<CreateTenantRequest>({
  id: '',
  name: '',
  adminEmail: '',
  connectionString: '',
  issuer: ''
})

const errorMessage = ref<string>('')

const formatId = () => {
  // Auto-format id to lowercase and replace spaces with hyphens
  form.value.id = form.value.id
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
}

const handleSubmit = async () => {
  errorMessage.value = ''

  // Validation
  if (!form.value.id || !form.value.name || !form.value.adminEmail) {
    errorMessage.value = 'Please fill in all required fields'
    return
  }

  // Create request payload
  const request: CreateTenantRequest = {
    id: form.value.id,
    name: form.value.name,
    adminEmail: form.value.adminEmail,
    connectionString: form.value.connectionString || undefined,
    issuer: form.value.issuer || undefined
  }

  const tenantId = await createTenant(request)

  if (tenantId) {
    // Redirect to tenants list
    await router.push('/super-admin/tenants')
  } else {
    errorMessage.value = 'Failed to create tenant. Please try again.'
  }
}
</script>
