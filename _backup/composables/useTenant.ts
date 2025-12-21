import type { Tenant, CreateTenantRequest, UpgradeSubscriptionRequest } from '~/types/tenant'
import type { PaginatedResponse } from '~/types/api'

export const useTenant = () => {
  const api = useApi()
  const { success, error } = useNotification()

  /**
   * Get all tenants with pagination
   */
  const getAllTenants = async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await api.get<PaginatedResponse<Tenant>>('/api/multitenancy/tenants', {
        params: {
          pageNumber,
          pageSize
        }
      })
      return response
    } catch (err: any) {
      error(err?.message || 'Failed to fetch tenants')
      throw err
    }
  }

  /**
   * Get tenant by ID
   */
  const getTenant = async (id: string) => {
    try {
      const response = await api.get<Tenant>(`/api/multitenancy/tenants/${id}`)
      return response
    } catch (err: any) {
      error(err?.message || 'Failed to fetch tenant')
      throw err
    }
  }

  /**
   * Create new tenant
   */
  const createTenant = async (data: CreateTenantRequest) => {
    try {
      const response = await api.post<string>('/api/multitenancy/tenants', data)
      success('Tenant created successfully!')
      return response
    } catch (err: any) {
      error(err?.message || 'Failed to create tenant')
      throw err
    }
  }

  /**
   * Activate tenant
   */
  const activateTenant = async (id: string) => {
    try {
      const response = await api.post<string>(`/api/multitenancy/tenants/${id}/activate`, {
        tenantId: id
      })
      success('Tenant activated successfully!')
      return response
    } catch (err: any) {
      error(err?.message || 'Failed to activate tenant')
      throw err
    }
  }

  /**
   * Deactivate tenant
   */
  const deactivateTenant = async (id: string) => {
    try {
      const response = await api.post<string>(`/api/multitenancy/tenants/${id}/deactivate`, {
        tenantId: id
      })
      success('Tenant deactivated successfully!')
      return response
    } catch (err: any) {
      error(err?.message || 'Failed to deactivate tenant')
      throw err
    }
  }

  /**
   * Upgrade subscription (extend expiry date)
   */
  const upgradeSubscription = async (id: string, extendedExpiryDate: string) => {
    try {
      const response = await api.post<string>(`/api/multitenancy/tenants/${id}/upgrade-subscription`, {
        tenantId: id,
        extendedExpiryDate
      })
      success('Subscription upgraded successfully!')
      return response
    } catch (err: any) {
      error(err?.message || 'Failed to upgrade subscription')
      throw err
    }
  }

  return {
    getAllTenants,
    getTenant,
    createTenant,
    activateTenant,
    deactivateTenant,
    upgradeSubscription
  }
}
