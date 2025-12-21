<template>
  <div class="max-w-4xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('settings.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">{{ $t('settings.general') }}</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Branding Section -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ $t('settings.branding') }}</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">{{ $t('settings.companyName') }} *</label>
            <input
              v-model="form.companyName"
              type="text"
              class="input"
              required
            />
          </div>

          <div>
            <label class="label">{{ $t('settings.brandName') }}</label>
            <input
              v-model="form.brandName"
              type="text"
              class="input"
            />
          </div>

          <div>
            <label class="label">{{ $t('settings.logo') }} (URL)</label>
            <input
              v-model="form.logoUrl"
              type="url"
              class="input"
              placeholder="https://..."
            />
          </div>

          <div>
            <label class="label">{{ $t('settings.favicon') }} (URL)</label>
            <input
              v-model="form.faviconUrl"
              type="url"
              class="input"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      <!-- Theme Section -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ $t('settings.theme') }}</h2>

        <div class="space-y-4">
          <div>
            <label class="label">{{ $t('settings.theme') }}</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.defaultTheme"
                  type="radio"
                  value="light"
                  class="w-4 h-4 text-primary-600"
                />
                <span class="text-gray-700 dark:text-gray-300">{{ $t('settings.lightMode') }}</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.defaultTheme"
                  type="radio"
                  value="dark"
                  class="w-4 h-4 text-primary-600"
                />
                <span class="text-gray-700 dark:text-gray-300">{{ $t('settings.darkMode') }}</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.defaultTheme"
                  type="radio"
                  value="system"
                  class="w-4 h-4 text-primary-600"
                />
                <span class="text-gray-700 dark:text-gray-300">{{ $t('settings.systemMode') }}</span>
              </label>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model="form.enableDarkMode"
              type="checkbox"
              class="w-4 h-4 text-primary-600 rounded"
            />
            <label class="text-gray-700 dark:text-gray-300">
              {{ $t('settings.darkMode') }} ({{ $t('common.active') }})
            </label>
          </div>
        </div>
      </div>

      <!-- Locale Section -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ $t('settings.locale') }}</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">{{ $t('settings.language') }}</label>
            <select v-model="form.defaultLanguage" class="input">
              <option value="fr">Fran&ccedil;ais</option>
              <option value="en">English</option>
              <option value="ar">&#1575;&#1604;&#1593;&#1585;&#1576;&#1610;&#1577;</option>
            </select>
          </div>

          <div>
            <label class="label">{{ $t('settings.timezone') }}</label>
            <select v-model="form.timezone" class="input">
              <option value="Africa/Casablanca">Africa/Casablanca (GMT+1)</option>
              <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>

          <div>
            <label class="label">{{ $t('settings.currency') }}</label>
            <select v-model="form.currency" class="input">
              <option value="MAD">MAD - Dirham marocain</option>
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - US Dollar</option>
            </select>
          </div>

          <div>
            <label class="label">{{ $t('settings.currencySymbol') }}</label>
            <input
              v-model="form.currencySymbol"
              type="text"
              class="input"
              maxlength="10"
            />
          </div>

          <div>
            <label class="label">{{ $t('settings.dateFormat') }}</label>
            <select v-model="form.dateFormat" class="input">
              <option value="dd/MM/yyyy">dd/MM/yyyy (31/12/2024)</option>
              <option value="MM/dd/yyyy">MM/dd/yyyy (12/31/2024)</option>
              <option value="yyyy-MM-dd">yyyy-MM-dd (2024-12-31)</option>
            </select>
          </div>

          <div>
            <label class="label">{{ $t('settings.timeFormat') }}</label>
            <select v-model="form.timeFormat" class="input">
              <option value="HH:mm">24h (14:30)</option>
              <option value="hh:mm a">12h (02:30 PM)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Order Settings Section -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ $t('settings.orderSettings') }}</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">{{ $t('settings.orderPrefix') }}</label>
            <input
              v-model="form.orderCodePrefix"
              type="text"
              class="input"
              maxlength="10"
              pattern="[A-Za-z0-9]+"
              placeholder="CMD"
            />
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ex: CMD-001, ORD-001
            </p>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end gap-4">
        <button type="button" class="btn-secondary" @click="resetForm">
          {{ $t('common.cancel') }}
        </button>
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="animate-spin mr-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </span>
          {{ $t('settings.saveSettings') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useSettingsService, type TenantSettingsDto } from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Settings.View'
})

// Use service with Vue Query caching
const { settings, isLoading, update: updateSettings, isUpdating } = useSettingsService()
const { success } = useNotification()

// Form state
const form = ref<Partial<TenantSettingsDto>>({
  companyName: '',
  brandName: '',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#4f46e5',
  secondaryColor: '#2ecc71',
  dangerColor: '#e74c3c',
  warningColor: '#f39c12',
  successColor: '#27ae60',
  infoColor: '#17a2b8',
  enableDarkMode: true,
  defaultTheme: 'light',
  currency: 'MAD',
  currencySymbol: 'DH',
  currencyPosition: 'after',
  defaultLanguage: 'fr',
  timezone: 'Africa/Casablanca',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'HH:mm',
  orderCodePrefix: 'CMD'
})

// Watch settings and update form when loaded
watch(settings, (newSettings) => {
  if (newSettings) {
    Object.assign(form.value, newSettings)
  }
}, { immediate: true })

// Reset form to current settings
const resetForm = () => {
  if (settings.value) {
    Object.assign(form.value, settings.value)
  }
}

// Handle form submission
const handleSubmit = async () => {
  try {
    await updateSettings(form.value as any)
    success('Settings updated successfully')
  } catch {
    // Error handled by service
  }
}

// Alias for template compatibility
const isSubmitting = isUpdating
</script>
