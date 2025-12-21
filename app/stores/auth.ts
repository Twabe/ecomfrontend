import { defineStore } from 'pinia'
import type { User } from '~/types/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isLoading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isSuperAdmin: (state) =>
      state.user?.roles?.includes('SuperAdmin') ||
      state.user?.roles?.includes('Administrator') ||
      false,
    userRoles: (state) => state.user?.roles || [],
    userPermissions: (state) => state.user?.permissions || []
  },

  actions: {
    setUser(user: User | null) {
      this.user = user
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    hasRole(role: string): boolean {
      return this.user?.roles?.includes(role) ?? false
    },

    hasPermission(permission: string): boolean {
      return this.user?.permissions?.includes(permission) ?? false
    },

    clear() {
      this.user = null
      this.isLoading = false
    }
  }
})
