/**
 * Tokens Service
 *
 * Authentication token management
 */

import { useQueryClient } from '@tanstack/vue-query'
import {
  useTokensGetToken,
  useTokensRefresh,
} from '~/api/generated/endpoints/tokens/tokens'
import type {
  TokenRequest,
  RefreshTokenRequest,
  TokenResponse,
} from '~/api/generated/models'

export function useTokensService() {
  const queryClient = useQueryClient()

  // Mutations (tokens are always mutations, not queries)
  const getTokenMutation = useTokensGetToken()
  const refreshTokenMutation = useTokensRefresh()

  // Computed
  const isLoading = computed(() =>
    getTokenMutation.isPending.value ||
    refreshTokenMutation.isPending.value
  )

  // Actions
  const login = async (data: TokenRequest): Promise<TokenResponse> => {
    return await getTokenMutation.mutateAsync({ data })
  }

  const refreshToken = async (data: RefreshTokenRequest): Promise<TokenResponse> => {
    return await refreshTokenMutation.mutateAsync({ data })
  }

  // Clear all cached data on logout
  const logout = () => {
    queryClient.clear()
  }

  return {
    isLoading,
    login,
    refreshToken,
    logout,
  }
}

export type { TokenRequest, RefreshTokenRequest, TokenResponse }
