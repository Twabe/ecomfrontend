<template>
  <div class="max-w-2xl mx-auto">
    <div class="card">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {{ $t('nav.profile') }}
      </h1>

      <!-- User Info -->
      <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div class="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
          <span class="text-white text-2xl font-bold">{{ userInitials }}</span>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ user?.firstName }} {{ user?.lastName }}
          </h2>
          <p class="text-gray-500 dark:text-gray-400">{{ user?.email }}</p>
        </div>
      </div>

      <!-- Profile Details -->
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-gray-500 dark:text-gray-400">{{ $t('common.name') }}</label>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ user?.firstName }} {{ user?.lastName }}
            </p>
          </div>
          <div>
            <label class="text-sm text-gray-500 dark:text-gray-400">{{ $t('common.email') }}</label>
            <p class="font-medium text-gray-900 dark:text-white">{{ user?.email }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500 dark:text-gray-400">Username</label>
            <p class="font-medium text-gray-900 dark:text-white">{{ user?.userName }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500 dark:text-gray-400">{{ $t('common.phone') }}</label>
            <p class="font-medium text-gray-900 dark:text-white">{{ user?.phoneNumber || '-' }}</p>
          </div>
        </div>
      </div>

      <!-- Note -->
      <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Pour modifier votre profil, veuillez contacter votre administrateur.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant']
})

const { user } = useAuth()

const userInitials = computed(() => {
  if (!user.value) return 'U'
  const firstName = user.value.firstName || user.value.userName || ''
  const lastName = user.value.lastName || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'
})
</script>
