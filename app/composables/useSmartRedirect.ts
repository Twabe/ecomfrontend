/**
 * Smart Redirect Composable
 *
 * Handles intelligent routing based on user permissions.
 * Redirects users to the first page they have access to.
 * NO hardcoded routes - everything is permission-based!
 */

// Route priority - ordered by importance/common use
// Each route has a path and required permission
const ROUTE_PRIORITY = [
  // Super Admin (tenant management permission)
  { path: '/super-admin', permission: 'Permissions.Tenants.View' },

  // Main dashboards (highest priority)
  { path: '/dashboard', permission: 'Permissions.Dashboard.View' },
  { path: '/dashboard/supervisor', permission: 'Permissions.SupervisorDashboard.View' },
  { path: '/dashboard/worker', permission: 'Permissions.WorkerDashboard.View' },

  // Core business pages
  { path: '/dashboard/orders', permission: 'Permissions.Orders.View' },
  { path: '/dashboard/customers', permission: 'Permissions.Customers.View' },
  { path: '/dashboard/products', permission: 'Permissions.Products.View' },

  // Delivery & Logistics
  { path: '/dashboard/delivery-notes', permission: 'Permissions.DeliveryNotes.View' },
  { path: '/dashboard/shipments', permission: 'Permissions.Shipments.View' },
  { path: '/dashboard/delivery-companies', permission: 'Permissions.DeliveryCompanies.View' },

  // Financial
  { path: '/dashboard/payments', permission: 'Permissions.Payments.View' },
  { path: '/dashboard/invoices', permission: 'Permissions.Invoices.View' },
  { path: '/dashboard/expenses', permission: 'Permissions.Expenses.View' },

  // Inventory
  { path: '/dashboard/stocks', permission: 'Permissions.Stocks.View' },
  { path: '/dashboard/purchases', permission: 'Permissions.Purchases.View' },

  // Settings & Admin
  { path: '/dashboard/settings', permission: 'Permissions.Settings.View' },
  { path: '/dashboard/users', permission: 'Permissions.Users.View' },
  { path: '/dashboard/roles', permission: 'Permissions.Roles.View' },

  // Master data (Basic permissions - most users have these)
  { path: '/dashboard/brands', permission: 'Permissions.Brands.View' },
  { path: '/dashboard/cities', permission: 'Permissions.Cities.View' },
  { path: '/dashboard/sources', permission: 'Permissions.Sources.View' },
  { path: '/dashboard/reasons', permission: 'Permissions.Reasons.View' },
  { path: '/dashboard/trackingstates', permission: 'Permissions.TrackingStates.View' },
  { path: '/dashboard/stores', permission: 'Permissions.Stores.View' },
] as const

export const useSmartRedirect = () => {
  const { hasPermission } = useAuth()

  /**
   * Get the first accessible route for the current user
   * Returns the path of the first route the user has permission to view
   */
  const getFirstAccessibleRoute = (): string => {
    // Find first route user has permission for
    for (const route of ROUTE_PRIORITY) {
      if (hasPermission(route.permission)) {
        return route.path
      }
    }

    // No accessible routes found - this shouldn't happen normally
    // Return login as fallback
    console.warn('User has no accessible dashboard routes')
    return '/auth/login'
  }

  /**
   * Get fallback route when access is denied to a specific page
   * Excludes the denied path to prevent infinite loops
   */
  const getFallbackRoute = (deniedPath: string): string => {
    // Find first route user has permission for, excluding denied path
    for (const route of ROUTE_PRIORITY) {
      if (route.path !== deniedPath && hasPermission(route.permission)) {
        return route.path
      }
    }

    // No accessible routes found
    console.warn('User has no accessible routes after denial')
    return '/auth/login'
  }

  /**
   * Check if user has access to any dashboard route
   */
  const hasAnyDashboardAccess = (): boolean => {
    return ROUTE_PRIORITY.some(route => hasPermission(route.permission))
  }

  /**
   * Navigate to the first accessible route
   */
  const navigateToFirstAccessible = async () => {
    const route = getFirstAccessibleRoute()
    return navigateTo(route)
  }

  return {
    getFirstAccessibleRoute,
    getFallbackRoute,
    hasAnyDashboardAccess,
    navigateToFirstAccessible,
    ROUTE_PRIORITY
  }
}
