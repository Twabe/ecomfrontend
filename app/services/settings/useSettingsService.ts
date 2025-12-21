/**
 * Settings Service
 *
 * Special service - singleton tenant settings (Get/Update only)
 * Also provides formatting utilities based on tenant locale settings
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  settingsGet,
  useSettingsUpdate,
} from '~/api/generated/endpoints/settings/settings'
import type {
  TenantSettingsDto,
  UpdateTenantSettingsRequest,
} from '~/api/generated/models'

export function useSettingsService() {
  const queryClient = useQueryClient()

  const queryKey = ['settings'] as const

  // Query for settings
  const query = useQuery({
    queryKey,
    queryFn: () => settingsGet(),
    staleTime: 5 * 60 * 1000, // 5 minutes - settings don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  })

  // Update mutation
  const updateMutation = useSettingsUpdate()

  // Computed
  const settings = computed<TenantSettingsDto | undefined>(() => query.data.value)
  const isLoading = computed(() => query.isLoading.value)
  const isFetching = computed(() => query.isFetching.value)
  const isUpdating = computed(() => updateMutation.isPending.value)

  // Actions
  const update = async (data: UpdateTenantSettingsRequest): Promise<void> => {
    await updateMutation.mutateAsync({ data })
    queryClient.invalidateQueries({ queryKey })
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey })
  const refetch = () => query.refetch()

  // Formatting utilities based on tenant locale settings
  const formatCurrency = (amount: number): string => {
    const s = settings.value
    const locale = s?.defaultLanguage === 'ar' ? 'ar-MA' : 'fr-MA'
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)

    const symbol = s?.currencySymbol || 'DH'
    if (s?.currencyPosition === 'before') {
      return `${symbol} ${formatted}`
    }
    return `${formatted} ${symbol}`
  }

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    const locale = settings.value?.defaultLanguage === 'ar' ? 'ar-MA' : 'fr-MA'
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d)
  }

  const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    const locale = settings.value?.defaultLanguage === 'ar' ? 'ar-MA' : 'fr-MA'
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(d)
  }

  const formatDateTime = (date: Date | string): string => {
    return `${formatDate(date)} ${formatTime(date)}`
  }

  return {
    settings,
    isLoading,
    isFetching,
    isUpdating,
    update,
    invalidate,
    refetch,
    // Formatting utilities
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime,
  }
}

export type { TenantSettingsDto, UpdateTenantSettingsRequest }
