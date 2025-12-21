import type {
  WorkerServiceConfig,
  WorkerSummaryDto,
  SetOnlineStatusRequest
} from '~/types/orderAssignment'

export const useWorkerStatus = () => {
  const api = useApi()
  const { success, error } = useNotification()

  // State
  const myConfig = useState<WorkerServiceConfig | null>('myWorkerConfig', () => null)
  const isOnline = useState<boolean>('workerIsOnline', () => false)
  const isLoading = useState<boolean>('workerStatus-loading', () => false)

  // Get my worker config
  const getMyConfig = async () => {
    isLoading.value = true
    try {
      const config = await api.get<WorkerServiceConfig | null>('/api/v1/workerserviceconfigs/me')
      myConfig.value = config
      isOnline.value = config?.isOnline ?? false
      return config
    } catch (err) {
      // Not an error if config doesn't exist
      myConfig.value = null
      isOnline.value = false
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Set online status
  const setOnlineStatus = async (online: boolean) => {
    try {
      const response = await api.post<WorkerServiceConfig>(
        '/api/v1/workerserviceconfigs/online',
        { isOnline: online } as SetOnlineStatusRequest
      )
      myConfig.value = response
      isOnline.value = response.isOnline
      success(online ? 'You are now online' : 'You are now offline')
      return response
    } catch (err) {
      error('Failed to update status')
      throw err
    }
  }

  // Toggle online/offline
  const toggleOnline = async () => {
    return setOnlineStatus(!isOnline.value)
  }

  // Get available workers for assignment (supervisor use)
  const getAvailableWorkers = async (serviceType: string = 'confirmation', onlyOnline: boolean = false) => {
    try {
      return await api.get<WorkerSummaryDto[]>(
        `/api/v1/workerserviceconfigs/available?serviceType=${serviceType}&onlyOnline=${onlyOnline}`
      )
    } catch (err) {
      error('Failed to load available workers')
      throw err
    }
  }

  return {
    myConfig: readonly(myConfig),
    isOnline: readonly(isOnline),
    isLoading: readonly(isLoading),
    getMyConfig,
    setOnlineStatus,
    toggleOnline,
    getAvailableWorkers
  }
}
