// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n'
  ],

  i18n: {
    locales: [
      { code: 'fr', language: 'fr-FR', file: 'fr.json', name: 'Français', dir: 'ltr' },
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English', dir: 'ltr' },
      { code: 'ar', language: 'ar-MA', file: 'ar.json', name: 'العربية', dir: 'rtl' }
    ],
    defaultLocale: 'fr',
    langDir: 'locales',
    strategy: 'no_prefix',
    // Enable cookie-based locale persistence
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      cookieSecure: false,
      alwaysRedirect: false,
      fallbackLocale: 'fr',
      redirectOn: 'root'  // Only redirect on root path
    },
    lazy: false
  },

  css: [
    '~/assets/css/main.css'
  ],

  app: {
    head: {
      title: 'E-commerce Admin',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'E-commerce Multi-Tenant Admin Dashboard' }
      ]
    }
  },

  typescript: {
    strict: true,
    typeCheck: false  // Disabled for faster dev
  },

  // Disable SSR for authenticated pages (like your working code with localStorage)
  routeRules: {
    '/super-admin/**': { ssr: false },
    '/auth/**': { ssr: false },
    '/dashboard/**': { ssr: false }
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'https://localhost:5001',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'E-commerce Admin',
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION || '1.0.0'
    }
  },

  nitro: {
    devProxy: {
      '/api': {
        target: process.env.NUXT_PUBLIC_API_BASE_URL || 'https://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
