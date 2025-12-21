import type { WorkerServiceConfig } from '~/types/orderAssignment'

export interface CreateWorkerConfigRequest {
  userId: string
  canDoConfirmation: boolean
  canDoSuivi: boolean
  canDoQuality: boolean
  canDoCallback: boolean
  maxConcurrentAssignments: number
  autoAssignPriority: number
}

export interface UpdateWorkerConfigRequest {
  canDoConfirmation?: boolean
  canDoSuivi?: boolean
  canDoQuality?: boolean
  canDoCallback?: boolean
  maxConcurrentAssignments?: number
  autoAssignPriority?: number
}

export interface WorkerConfigDto extends WorkerServiceConfig {
  userName?: string
  userEmail?: string
  createdOn: string
  lastModifiedOn?: string
}

export const useWorkerConfigs = () => {
  const api = useApi()
  const { success, error } = useNotification()

  // State
  const configs = useState<WorkerConfigDto[]>('workerConfigs', () => [])
  const isLoading = useState<boolean>('workerConfigs-loading', () => false)

  // Get all worker configs
  const getAllConfigs = async (onlyOnline: boolean = false, serviceType?: string) => {
    isLoading.value = true
    try {
      let url = '/api/v1/workerserviceconfigs'
      const params: string[] = []
      if (onlyOnline) params.push('onlyOnline=true')
      if (serviceType) params.push(`serviceType=${serviceType}`)
      if (params.length > 0) url += '?' + params.join('&')

      const result = await api.get<WorkerConfigDto[]>(url)
      configs.value = result
      return result
    } catch (err) {
      error('Failed to load worker configs')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Create new worker config
  const createConfig = async (request: CreateWorkerConfigRequest) => {
    try {
      const result = await api.post<WorkerConfigDto>(
        '/api/v1/workerserviceconfigs',
        request
      )
      // Add to local state
      configs.value.push(result)
      success('Worker config created successfully')
      return result
    } catch (err) {
      error('Failed to create worker config')
      throw err
    }
  }

  // Update existing worker config
  const updateConfig = async (id: string, request: UpdateWorkerConfigRequest) => {
    try {
      const result = await api.put<WorkerConfigDto>(
        `/api/v1/workerserviceconfigs/${id}`,
        request
      )
      // Update in local state
      const index = configs.value.findIndex(c => c.id === id)
      if (index !== -1) {
        configs.value[index] = result
      }
      success('Worker config updated successfully')
      return result
    } catch (err) {
      error('Failed to update worker config')
      throw err
    }
  }

  // Get users who don't have a config yet (for the "add" button)
  const getConfiguredUserIds = () => {
    return configs.value.map(c => c.userId)
  }

  return {
    configs: readonly(configs),
    isLoading: readonly(isLoading),
    getAllConfigs,
    createConfig,
    updateConfig,
    getConfiguredUserIds
  }
}
