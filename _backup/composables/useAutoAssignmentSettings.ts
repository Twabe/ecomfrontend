import type {
  AutoAssignmentSettings,
  UpdateAutoAssignmentSettingsRequest
} from '~/types/orderAssignment'

export const useAutoAssignmentSettings = () => {
  const api = useApi()
  const { success, error } = useNotification()

  // State
  const settings = useState<AutoAssignmentSettings | null>('autoAssignmentSettings', () => null)
  const isLoading = useState<boolean>('autoAssignmentSettings-loading', () => false)

  // Get settings
  // Note: This may fail with 403 for workers who don't have AutoAssignmentSettings.View permission
  // In that case, we silently fail since settings are optional for worker panels
  const getSettings = async (showError: boolean = false) => {
    isLoading.value = true
    try {
      const response = await api.get<AutoAssignmentSettings>('/api/v1/autoassignmentsettings')
      settings.value = response
      return response
    } catch (err: any) {
      // Only show error notification if explicitly requested
      // Workers don't have permission to view these settings, so we silently fail
      if (showError && err?.response?.status !== 403) {
        error('Failed to load auto-assignment settings')
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update settings
  const updateSettings = async (data: UpdateAutoAssignmentSettingsRequest) => {
    try {
      const response = await api.put<AutoAssignmentSettings>(
        '/api/v1/autoassignmentsettings',
        data
      )
      settings.value = response
      success('Auto-assignment settings updated')
      return response
    } catch (err) {
      error('Failed to update settings')
      throw err
    }
  }

  return {
    settings: readonly(settings),
    isLoading: readonly(isLoading),
    getSettings,
    updateSettings
  }
}
