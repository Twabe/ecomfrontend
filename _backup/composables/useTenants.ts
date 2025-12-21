import type {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  UpgradeSubscriptionRequest
} from '~/types/tenant'

export const useTenants = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const tenants = useState<Tenant[]>('tenants', () => [])
  const currentTenant = useState<Tenant | null>('current-tenant', () => null)
  const isLoading = useState<boolean>('tenants-loading', () => false)

  /**
   * Fetch all tenants
   */
  const fetchTenants = async (): Promise<void> => {
    isLoading.value = true
    try {
      const response = await api.get<Tenant[]>('/api/tenants')
      tenants.value = response
    } catch (err: any) {
      error('Failed to fetch tenants')
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get tenant by ID
   */
  const getTenant = async (id: string): Promise<Tenant | null> => {
    isLoading.value = true
    try {
      const response = await api.get<Tenant>(`/api/tenants/${id}`)
      currentTenant.value = response
      return response
    } catch (err: any) {
      error('Failed to fetch tenant details')
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create new tenant
   */
  const createTenant = async (request: CreateTenantRequest): Promise<string | null> => {
    isLoading.value = true
    try {
      const response = await api.post<string>('/api/tenants', request)
      success('Tenant created successfully!')

      // Refresh tenant list
      await fetchTenants()

      return response
    } catch (err: any) {
      error(err?.message || 'Failed to create tenant')
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update tenant
   */
  const updateTenant = async (id: string, request: UpdateTenantRequest): Promise<boolean> => {
    isLoading.value = true
    try {
      await api.put(`/api/tenants/${id}`, request)
      success('Tenant updated successfully!')

      // Refresh tenant list
      await fetchTenants()

      return true
    } catch (err: any) {
      error(err?.message || 'Failed to update tenant')
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Activate tenant
   */
  const activateTenant = async (id: string): Promise<boolean> => {
    isLoading.value = true
    try {
      await api.post(`/api/tenants/${id}/activate`, {})
      success('Tenant activated successfully!')

      // Update tenant in list
      const tenant = tenants.value.find(t => t.id === id)
      if (tenant) {
        tenant.isActive = true
      }

      // Update current tenant if it's the same
      if (currentTenant.value?.id === id) {
        currentTenant.value.isActive = true
      }

      return true
    } catch (err: any) {
      error(err?.message || 'Failed to activate tenant')
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Deactivate tenant
   */
  const deactivateTenant = async (id: string): Promise<boolean> => {
    isLoading.value = true
    try {
      await api.post(`/api/tenants/${id}/deactivate`, {})
      success('Tenant deactivated successfully!')

      // Update tenant in list
      const tenant = tenants.value.find(t => t.id === id)
      if (tenant) {
        tenant.isActive = false
      }

      // Update current tenant if it's the same
      if (currentTenant.value?.id === id) {
        currentTenant.value.isActive = false
      }

      return true
    } catch (err: any) {
      error(err?.message || 'Failed to deactivate tenant')
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Upgrade tenant subscription
   */
  const upgradeTenantSubscription = async (
    id: string,
    request: UpgradeSubscriptionRequest
  ): Promise<boolean> => {
    isLoading.value = true
    try {
      await api.post(`/api/tenants/${id}/upgrade`, request)
      success('Tenant subscription upgraded successfully!')

      // Refresh tenant
      await getTenant(id)

      return true
    } catch (err: any) {
      error(err?.message || 'Failed to upgrade subscription')
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get tenant statistics
   */
  const getTenantsStats = computed(() => {
    return {
      total: tenants.value.length,
      active: tenants.value.filter(t => t.isActive).length,
      inactive: tenants.value.filter(t => !t.isActive).length
    }
  })

  return {
    // State
    tenants,
    currentTenant,
    isLoading,

    // Computed
    getTenantsStats,

    // Methods
    fetchTenants,
    getTenant,
    createTenant,
    updateTenant,
    activateTenant,
    deactivateTenant,
    upgradeTenantSubscription
  }
}
