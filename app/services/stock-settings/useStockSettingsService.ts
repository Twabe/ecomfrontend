/**
 * Stock Settings Service
 *
 * Special service - only Get/Update operations (singleton settings)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { customInstance } from '~/api/axios-instance'

// Types (matching backend StockSettingsDto)
export interface StockSettingsDto {
  id: string
  stockDeductionTiming: 'on_confirm' | 'on_delivery_note' | 'manual'
  stockRestorationOnCancel: 'auto' | 'ask' | 'never'
  stockRestorationOnReturn: 'auto' | 'ask' | 'never'
  allowCancelFromDelivered: boolean
  allowCancelFromReturned: boolean
  blockConfirmOnInsufficientStock: boolean
  showStockWarningOnOrder: boolean
  lowStockThreshold: number
}

export interface UpdateStockSettingsRequest extends Omit<StockSettingsDto, 'id'> {
  id: string
}

// API functions
const getStockSettings = () =>
  customInstance<StockSettingsDto>({
    url: '/api/v1/stocksettings',
    method: 'GET',
  })

const updateStockSettings = (id: string, data: UpdateStockSettingsRequest) =>
  customInstance<string>({
    url: `/api/v1/stocksettings/${id}`,
    method: 'PUT',
    data,
  })

export function useStockSettingsService() {
  const queryClient = useQueryClient()
  const notification = useNotification()
  const { t } = useI18n()

  const queryKey = ['stock-settings'] as const

  // Query for settings
  const query = useQuery({
    queryKey,
    queryFn: () => getStockSettings(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Settings don't change often
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateStockSettingsRequest) => updateStockSettings(data.id, data),
    onSuccess: () => {
      notification.success(t('stockSettings.saved'))
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (error: any) => {
      notification.error(error?.message || t('stockSettings.saveFailed'))
    },
  })

  // Computed
  const settings = computed<StockSettingsDto | undefined>(() => query.data.value)
  const isLoading = computed(() => query.isLoading.value)
  const isFetching = computed(() => query.isFetching.value)
  const isUpdating = computed(() => updateMutation.isPending.value)

  // Actions
  const update = async (data: UpdateStockSettingsRequest): Promise<string> => {
    return await updateMutation.mutateAsync(data)
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey })
  const refetch = () => query.refetch()

  return {
    settings,
    isLoading,
    isFetching,
    isUpdating,
    update,
    invalidate,
    refetch,
  }
}
