<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full mx-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <!-- Loading State -->
        <div v-if="isProcessing" class="space-y-4">
          <div class="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ $t('integrations.oauthCallback.processing') }}
          </h2>
          <p class="text-gray-500 dark:text-gray-400">
            {{ $t('integrations.oauthCallback.processingDesc') }}
          </p>
        </div>

        <!-- Success State -->
        <div v-else-if="status === 'success'" class="space-y-4">
          <div class="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircleIcon class="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ $t('integrations.oauthCallback.success') }}
          </h2>
          <p class="text-gray-500 dark:text-gray-400">
            {{ $t('integrations.oauthCallback.successDesc') }}
          </p>
          <p class="text-sm text-gray-400 dark:text-gray-500">
            {{ $t('integrations.oauthCallback.redirecting') }}
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="status === 'error'" class="space-y-4">
          <div class="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <XCircleIcon class="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ $t('integrations.oauthCallback.error') }}
          </h2>
          <p class="text-gray-500 dark:text-gray-400">
            {{ errorMessage || $t('integrations.oauthCallback.errorDesc') }}
          </p>
          <button
            type="button"
            class="btn-primary mt-4"
            @click="goToIntegrations"
          >
            {{ $t('integrations.oauthCallback.backToIntegrations') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/solid'

definePageMeta({
  layout: 'blank',
  middleware: ['auth', 'tenant']
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { success: showSuccess, error: showError } = useNotification()

// State
const isProcessing = ref(true)
const status = ref<'success' | 'error' | null>(null)
const errorMessage = ref<string | null>(null)

// Process the callback
onMounted(async () => {
  try {
    // Check URL params for status
    const queryStatus = route.query.status as string
    const queryError = route.query.error as string
    const queryMessage = route.query.message as string

    // Short delay to show processing state
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (queryStatus === 'success') {
      status.value = 'success'
      isProcessing.value = false
      showSuccess(t('integrations.oauthCallback.success'))

      // Redirect to integrations page after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/platform-integrations')
      }, 2000)
    } else if (queryStatus === 'error' || queryError) {
      status.value = 'error'
      errorMessage.value = queryMessage || queryError || null
      isProcessing.value = false
      showError(errorMessage.value || t('integrations.oauthCallback.error'))
    } else {
      // No status provided - check if we have code/state for manual processing
      const code = route.query.code as string
      const state = route.query.state as string

      if (code && state) {
        // The backend should have already processed this and redirected with status
        // If we're here with code/state, something went wrong
        status.value = 'error'
        errorMessage.value = t('integrations.oauthCallback.invalidCallback')
        isProcessing.value = false
      } else {
        // No valid params
        status.value = 'error'
        errorMessage.value = t('integrations.oauthCallback.invalidCallback')
        isProcessing.value = false
      }
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    status.value = 'error'
    errorMessage.value = t('integrations.oauthCallback.errorDesc')
    isProcessing.value = false
  }
})

const goToIntegrations = () => {
  router.push('/dashboard/platform-integrations')
}
</script>
