<template>
  <div class="max-w-5xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Profile Settings</h1>
      <p class="mt-2 text-sm text-gray-600">Manage your account information and security settings</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Card -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex flex-col items-center">
            <!-- Avatar -->
            <div class="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
              <span class="text-3xl font-bold text-white">{{ userInitials }}</span>
            </div>

            <h3 class="text-xl font-bold text-gray-900">{{ fullName }}</h3>
            <p class="text-sm text-gray-600">{{ user?.email }}</p>
            <span class="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Super Admin
            </span>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-200">
            <dl class="space-y-3">
              <div>
                <dt class="text-xs font-medium text-gray-500">Username</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user?.userName }}</dd>
              </div>
              <div v-if="user?.phoneNumber">
                <dt class="text-xs font-medium text-gray-500">Phone</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user?.phoneNumber }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Account Status</dt>
                <dd class="mt-1">
                  <span :class="user?.isActive ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
                    {{ user?.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Email Verified</dt>
                <dd class="mt-1">
                  <span :class="user?.emailConfirmed ? 'text-green-600' : 'text-amber-600'" class="text-sm font-medium">
                    {{ user?.emailConfirmed ? 'Verified' : 'Not Verified' }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <!-- Profile Forms -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Update Profile Information -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Profile Information</h2>
            <p class="mt-1 text-sm text-gray-600">Update your account's profile information</p>
          </div>

          <form @submit.prevent="handleUpdateProfile" class="px-6 py-4 space-y-4">
            <!-- First Name & Last Name -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  v-model="profileForm.firstName"
                  type="text"
                  id="firstName"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  v-model="profileForm.lastName"
                  type="text"
                  id="lastName"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                v-model="profileForm.email"
                type="email"
                id="email"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter email"
              />
            </div>

            <!-- Phone Number -->
            <div>
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                v-model="profileForm.phoneNumber"
                type="tel"
                id="phoneNumber"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter phone number"
              />
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end pt-4">
              <button
                type="submit"
                :disabled="isUpdatingProfile"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="isUpdatingProfile" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isUpdatingProfile ? 'Updating...' : 'Update Profile' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Change Password -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Change Password</h2>
            <p class="mt-1 text-sm text-gray-600">Ensure your account is using a strong password</p>
          </div>

          <form @submit.prevent="handleChangePassword" class="px-6 py-4 space-y-4">
            <!-- Current Password -->
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700">Current Password</label>
              <div class="mt-1 relative">
                <input
                  v-model="passwordForm.password"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  id="currentPassword"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg v-if="showCurrentPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- New Password -->
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
              <div class="mt-1 relative">
                <input
                  v-model="passwordForm.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  id="newPassword"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg v-if="showNewPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Confirm New Password -->
            <div>
              <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <div class="mt-1 relative">
                <input
                  v-model="passwordForm.confirmNewPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirmNewPassword"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg v-if="showConfirmPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Password Requirements -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="text-xs font-medium text-blue-800 mb-2">Password Requirements:</p>
              <ul class="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>At least 8 characters long</li>
                <li>Contains at least one uppercase letter</li>
                <li>Contains at least one lowercase letter</li>
                <li>Contains at least one number</li>
                <li>Contains at least one special character</li>
              </ul>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end pt-4">
              <button
                type="submit"
                :disabled="isChangingPassword"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="isChangingPassword" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UpdateProfileRequest, ChangePasswordRequest } from '~/composables/useProfile'

definePageMeta({
  layout: 'super-admin',
  middleware: ['auth', 'super-admin']
})

const { user, fetchUserProfile } = useAuth()
const { updateProfile, changePassword } = useProfile()

// Profile form
const profileForm = reactive<UpdateProfileRequest>({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: ''
})

// Password form
const passwordForm = reactive<ChangePasswordRequest>({
  password: '',
  newPassword: '',
  confirmNewPassword: ''
})

// Loading states
const isUpdatingProfile = ref(false)
const isChangingPassword = ref(false)

// Password visibility toggles
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Computed properties
const userInitials = computed(() => {
  if (!user.value) return 'SA'
  const firstName = user.value.firstName || user.value.userName || ''
  const lastName = user.value.lastName || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'SA'
})

const fullName = computed(() => {
  if (!user.value) return 'Super Admin'
  const firstName = user.value.firstName || ''
  const lastName = user.value.lastName || ''
  return firstName || lastName ? `${firstName} ${lastName}`.trim() : user.value.userName
})

// Initialize form with user data
watch(user, (newUser) => {
  if (newUser) {
    profileForm.id = newUser.id
    profileForm.firstName = newUser.firstName || ''
    profileForm.lastName = newUser.lastName || ''
    profileForm.email = newUser.email
    profileForm.phoneNumber = newUser.phoneNumber || ''
  }
}, { immediate: true })

// Handle profile update
const handleUpdateProfile = async () => {
  isUpdatingProfile.value = true
  try {
    await updateProfile(profileForm)
    // Refresh user profile to get updated data
    await fetchUserProfile()
  } catch (error) {
    console.error('Failed to update profile:', error)
  } finally {
    isUpdatingProfile.value = false
  }
}

// Handle password change
const handleChangePassword = async () => {
  // Validate passwords match
  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    const { error } = useNotification()
    error('New passwords do not match')
    return
  }

  isChangingPassword.value = true
  try {
    await changePassword(passwordForm)
    // Reset form after successful password change
    passwordForm.password = ''
    passwordForm.newPassword = ''
    passwordForm.confirmNewPassword = ''
  } catch (error) {
    console.error('Failed to change password:', error)
  } finally {
    isChangingPassword.value = false
  }
}
</script>
