import type { BasicStats, DashboardStats, DashboardOverviewParams } from '~/types/dashboard'

export const useDashboard = () => {
  const api = useApi()
  const { error: showError } = useNotification()
  const { t } = useI18n()

  const basicStats = ref<BasicStats | null>(null)
  const dashboardStats = ref<DashboardStats | null>(null)
  const isLoading = ref(false)

  const getBasicStats = async () => {
    isLoading.value = true
    try {
      const response = await api.get<BasicStats>('/api/v1/dashboard')
      basicStats.value = response
      return response
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('common.error')
      showError(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const getDashboardOverview = async (params?: DashboardOverviewParams) => {
    isLoading.value = true
    try {
      const queryParams = new URLSearchParams()
      if (params?.startDate) queryParams.append('startDate', params.startDate)
      if (params?.endDate) queryParams.append('endDate', params.endDate)

      const queryString = queryParams.toString()
      const url = queryString ? `/api/v1/dashboard/overview?${queryString}` : '/api/v1/dashboard/overview'

      const response = await api.get<DashboardStats>(url)
      dashboardStats.value = response
      return response
    } catch (error: any) {
      // Silently handle 403 errors - user may not have dashboard permission
      // They will see empty stats instead of an error
      if (error?.statusCode === 403 || error?.response?.status === 403) {
        console.warn('Dashboard: User does not have permission to view dashboard statistics')
        return null
      }
      const message = error instanceof Error ? error.message : t('common.error')
      showError(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    basicStats,
    dashboardStats,
    isLoading,
    getBasicStats,
    getDashboardOverview
  }
}
