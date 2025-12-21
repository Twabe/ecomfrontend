export interface TenantSettings {
  id: string
  // Branding
  companyName: string
  brandName?: string
  logoUrl?: string
  faviconUrl?: string
  // Theme
  primaryColor: string
  secondaryColor: string
  dangerColor: string
  warningColor: string
  successColor: string
  infoColor: string
  enableDarkMode: boolean
  defaultTheme: 'light' | 'dark' | 'system'
  // Locale
  currency: string
  currencySymbol: string
  currencyPosition: 'before' | 'after'
  defaultLanguage: 'fr' | 'ar' | 'en'
  timezone: string
  dateFormat: string
  timeFormat: string
  // Order
  orderCodePrefix: string
}

const defaultSettings: TenantSettings = {
  id: '',
  companyName: 'My Company',
  brandName: '',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#4f46e5',
  secondaryColor: '#2ecc71',
  dangerColor: '#e74c3c',
  warningColor: '#f39c12',
  successColor: '#27ae60',
  infoColor: '#17a2b8',
  enableDarkMode: true,
  defaultTheme: 'light',
  currency: 'MAD',
  currencySymbol: 'DH',
  currencyPosition: 'after',
  defaultLanguage: 'fr',
  timezone: 'Africa/Casablanca',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'HH:mm',
  orderCodePrefix: 'CMD'
}

export const useSettings = () => {
  const api = useApi()
  const { setLocale } = useI18n()
  const { success, error } = useNotification()

  // State
  const settings = useState<TenantSettings>('tenant-settings', () => ({ ...defaultSettings }))
  const isLoading = useState<boolean>('settings-loading', () => false)
  const isLoaded = useState<boolean>('settings-loaded', () => false)

  // Fetch settings from API
  const fetchSettings = async () => {
    if (isLoaded.value) return settings.value

    isLoading.value = true
    try {
      const response = await api.get<TenantSettings>('/api/v1/settings')
      settings.value = response
      isLoaded.value = true

      // Apply settings
      applySettings(response)

      return response
    } catch (err) {
      console.error('Failed to fetch settings:', err)
      // Use defaults on error
      return settings.value
    } finally {
      isLoading.value = false
    }
  }

  // Update settings
  const updateSettings = async (data: Partial<TenantSettings>) => {
    isLoading.value = true
    try {
      const updatedSettings = { ...settings.value, ...data }
      await api.put(`/api/v1/settings/${settings.value.id}`, updatedSettings)
      settings.value = updatedSettings
      success('Settings updated successfully')

      // Apply new settings
      applySettings(updatedSettings)

      return updatedSettings
    } catch (err) {
      error('Failed to update settings')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Apply settings to the app
  const applySettings = (s: TenantSettings) => {
    // Apply language if different from current and no localStorage override
    const savedLocale = localStorage.getItem('locale')
    if (!savedLocale && s.defaultLanguage) {
      setLocale(s.defaultLanguage)
      document.documentElement.dir = s.defaultLanguage === 'ar' ? 'rtl' : 'ltr'
    }

    // Apply dark mode preference
    const savedTheme = localStorage.getItem('theme')
    if (!savedTheme && s.defaultTheme) {
      if (s.defaultTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (s.defaultTheme === 'light') {
        document.documentElement.classList.remove('dark')
      } else if (s.defaultTheme === 'system') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark')
        }
      }
    }

    // Update favicon if provided
    if (s.faviconUrl) {
      const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (favicon) {
        favicon.href = s.faviconUrl
      }
    }

    // Update page title with company name
    if (s.companyName) {
      document.title = `${s.companyName} - Dashboard`
    }
  }

  // Format currency
  const formatCurrency = (amount: number): string => {
    const formatted = new Intl.NumberFormat(settings.value.defaultLanguage === 'ar' ? 'ar-MA' : 'fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)

    if (settings.value.currencyPosition === 'before') {
      return `${settings.value.currencySymbol} ${formatted}`
    }
    return `${formatted} ${settings.value.currencySymbol}`
  }

  // Format date
  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(settings.value.defaultLanguage === 'ar' ? 'ar-MA' : 'fr-MA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d)
  }

  // Format time
  const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(settings.value.defaultLanguage === 'ar' ? 'ar-MA' : 'fr-MA', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(d)
  }

  // Format date and time
  const formatDateTime = (date: Date | string): string => {
    return `${formatDate(date)} ${formatTime(date)}`
  }

  return {
    settings: readonly(settings),
    isLoading: readonly(isLoading),
    isLoaded: readonly(isLoaded),
    fetchSettings,
    updateSettings,
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime
  }
}
