import { useQuery } from '@tanstack/vue-query'
import { unref, type MaybeRef } from 'vue'
import { customInstance } from '~/api/axios-instance'

export interface ProviderCityDto {
  name: string
  district?: string
  deliveryFees?: number
  deliveryFeesSameCity?: number
}

// Delivery company types that have providers
export type DeliveryCompanyType =
  | 'Ameex'
  | 'OzoneOld'
  | 'OzoneNew'
  | 'Digylog'
  | 'Livo'
  | 'Sendit'
  | 'Onessta'
  | 'KargoExpress'
  | 'TawsilexNew'
  | 'LivCash'
  | 'PalExpress'
  | 'Ibex'
  | 'TawsilexOld'
  | 'AtlasLivraison'
  | 'EagleExpress'
  | 'ForceLog'

/**
 * Fetch cities from a delivery provider API.
 */
export async function fetchProviderCities(
  providerType: DeliveryCompanyType,
  search?: string
): Promise<ProviderCityDto[]> {
  const params = search ? { search } : {}
  const response = await customInstance<ProviderCityDto[]>({
    url: `/api/v1/deliverycompanies/provider-cities/${providerType}`,
    method: 'GET',
    params
  })
  return response
}

/**
 * Vue Query composable for fetching provider cities.
 */
export function useProviderCities(
  providerType: MaybeRef<DeliveryCompanyType>,
  search?: MaybeRef<string | undefined>,
  options?: { enabled?: MaybeRef<boolean> }
) {
  return useQuery({
    queryKey: ['provider-cities', providerType, search],
    queryFn: () => fetchProviderCities(unref(providerType), unref(search)),
    enabled: options?.enabled,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  })
}
