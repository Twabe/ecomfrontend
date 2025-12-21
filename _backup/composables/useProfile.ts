export interface UpdateProfileRequest {
  id: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  email?: string
}

export interface ChangePasswordRequest {
  password: string
  newPassword: string
  confirmNewPassword: string
}

export const useProfile = () => {
  const api = useApi()
  const { success, error } = useNotification()

  /**
   * Update user profile
   */
  const updateProfile = async (data: UpdateProfileRequest) => {
    try {
      await api.put('/api/personal/profile', data)
      success('Profile updated successfully!')
    } catch (err: any) {
      error(err?.message || 'Failed to update profile')
      throw err
    }
  }

  /**
   * Change password
   */
  const changePassword = async (data: ChangePasswordRequest) => {
    try {
      await api.put('/api/personal/change-password', data)
      success('Password changed successfully!')
    } catch (err: any) {
      error(err?.message || 'Failed to change password')
      throw err
    }
  }

  return {
    updateProfile,
    changePassword
  }
}
