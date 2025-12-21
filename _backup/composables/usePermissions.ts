import type { Permission, PermissionGroup } from '~/types/permission'

// State to store all permissions (fetched from backend)
const allPermissions = useState<Permission[]>('all-permissions', () => [])
const isLoading = useState<boolean>('permissions-loading', () => false)
const isLoaded = useState<boolean>('permissions-loaded', () => false)

export const usePermissions = () => {
  const api = useApi()

  // Fetch all permissions from backend API
  const fetchAllPermissions = async (): Promise<Permission[]> => {
    // Return cached permissions if already loaded
    if (isLoaded.value && allPermissions.value.length > 0) {
      return allPermissions.value
    }

    try {
      isLoading.value = true
      const response = await api.get<Permission[]>('/api/roles/permissions')
      allPermissions.value = response
      isLoaded.value = true
      return response
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Get all permissions (fetch if not loaded)
  const getAllPermissions = async (): Promise<Permission[]> => {
    if (!isLoaded.value) {
      await fetchAllPermissions()
    }
    return allPermissions.value
  }

  // Get permissions grouped by resource
  const getPermissionGroups = async (): Promise<PermissionGroup[]> => {
    const permissions = await getAllPermissions()
    const groups: { [key: string]: Permission[] } = {}

    permissions.forEach(permission => {
      if (!groups[permission.resource]) {
        groups[permission.resource] = []
      }
      groups[permission.resource].push(permission)
    })

    return Object.keys(groups).map(resource => ({
      resource,
      permissions: groups[resource]
    }))
  }

  // Get basic permissions only
  const getBasicPermissions = async (): Promise<Permission[]> => {
    const permissions = await getAllPermissions()
    return permissions.filter(p => p.isBasic)
  }

  // Get root permissions only
  const getRootPermissions = async (): Promise<Permission[]> => {
    const permissions = await getAllPermissions()
    return permissions.filter(p => p.isRoot)
  }

  // Get admin permissions (non-root)
  const getAdminPermissions = async (): Promise<Permission[]> => {
    const permissions = await getAllPermissions()
    return permissions.filter(p => !p.isRoot)
  }

  // Clear cached permissions (useful for refreshing)
  const clearPermissionsCache = () => {
    allPermissions.value = []
    isLoaded.value = false
  }

  return {
    // Data
    allPermissions: readonly(allPermissions),
    isLoading: readonly(isLoading),
    isLoaded: readonly(isLoaded),

    // Methods
    fetchAllPermissions,
    getAllPermissions,
    getPermissionGroups,
    getBasicPermissions,
    getRootPermissions,
    getAdminPermissions,
    clearPermissionsCache
  }
}
