/**
 * Dashboard Service
 *
 * Special service - analytics/statistics queries only (no CRUD)
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  dashboardGet,
  dashboardGetOverview,
} from '~/api/generated/endpoints/dashboard/dashboard'
import type {
  StatsDto,
  DashboardStatsDto,
  DashboardGetOverviewParams,
} from '~/api/generated/models'

export function useDashboardService(overviewParams?: Ref<DashboardGetOverviewParams | undefined>) {
  const queryClient = useQueryClient()

  // Base stats query
  const statsQueryKey = ['dashboard', 'stats'] as const
  const statsQuery = useQuery({
    queryKey: statsQueryKey,
    queryFn: () => dashboardGet(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  })

  // Overview query with params
  const overviewQueryKey = computed(() => ['dashboard', 'overview', overviewParams?.value] as const)
  const overviewQuery = useQuery({
    queryKey: overviewQueryKey,
    queryFn: () => dashboardGetOverview(overviewParams?.value),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: computed(() => !!overviewParams?.value),
  })

  // Computed
  const stats = computed<StatsDto | undefined>(() => statsQuery.data.value)
  const overview = computed<DashboardStatsDto | undefined>(() => overviewQuery.data.value)
  const isLoadingStats = computed(() => statsQuery.isLoading.value)
  const isLoadingOverview = computed(() => overviewQuery.isLoading.value)
  const isLoading = computed(() => isLoadingStats.value || isLoadingOverview.value)

  // Actions
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const refetchStats = () => statsQuery.refetch()
  const refetchOverview = () => overviewQuery.refetch()

  return {
    stats,
    overview,
    isLoading,
    isLoadingStats,
    isLoadingOverview,
    invalidateAll,
    refetchStats,
    refetchOverview,
  }
}

export type { StatsDto, DashboardStatsDto, DashboardGetOverviewParams }
