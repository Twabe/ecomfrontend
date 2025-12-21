import type { Statistic, CreateStatisticRequest, UpdateStatisticRequest, SearchStatisticsParams } from '~/types/statistic'
import type { PaginatedResponse } from '~/types/api'

export const useStatistics = () => {
  const api = useApi()
  const { t } = useI18n()
  const { success, error: showError } = useNotification()

  const statistics = useState<Statistic[]>('statistics', () => [])
  const isLoading = useState<boolean>('statistics-loading', () => false)
  const pagination = useState('statistics-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
    hasPreviousPage: false,
    hasNextPage: false
  }))

  const searchStatistics = async (params: SearchStatisticsParams = {}) => {
    isLoading.value = true
    try {
      const body: Record<string, unknown> = {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: params.orderBy || ['StatisticDate desc']
      }

      if (params.deliveryCompanyId) body.deliveryCompanyId = params.deliveryCompanyId
      if (params.cityId) body.cityId = params.cityId
      if (params.productId) body.productId = params.productId
      if (params.workerId) body.workerId = params.workerId

      const response = await api.post<PaginatedResponse<Statistic>>('/api/v1/statistics/search', body)

      statistics.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize,
        hasPreviousPage: response.hasPreviousPage,
        hasNextPage: response.hasNextPage
      }
      return response
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('common.error')
      showError(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const getStatistic = async (id: string) => {
    try {
      return await api.get<Statistic>(`/api/v1/statistics/${id}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('common.error')
      showError(message)
      throw error
    }
  }

  const createStatistic = async (data: CreateStatisticRequest) => {
    try {
      const id = await api.post<string>('/api/v1/statistics', data)
      success(t('messages.saveSuccess'))
      await searchStatistics({ pageNumber: pagination.value.currentPage, pageSize: pagination.value.pageSize })
      return id
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('messages.saveError')
      showError(message)
      throw error
    }
  }

  const updateStatistic = async (id: string, data: UpdateStatisticRequest) => {
    try {
      await api.put(`/api/v1/statistics/${id}`, data)
      success(t('messages.saveSuccess'))
      await searchStatistics({ pageNumber: pagination.value.currentPage, pageSize: pagination.value.pageSize })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('messages.saveError')
      showError(message)
      throw error
    }
  }

  const deleteStatistic = async (id: string) => {
    try {
      await api.delete(`/api/v1/statistics/${id}`)
      success(t('messages.deleteSuccess'))
      await searchStatistics({ pageNumber: pagination.value.currentPage, pageSize: pagination.value.pageSize })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('messages.deleteError')
      showError(message)
      throw error
    }
  }

  return {
    statistics,
    isLoading,
    pagination,
    searchStatistics,
    getStatistic,
    createStatistic,
    updateStatistic,
    deleteStatistic
  }
}
