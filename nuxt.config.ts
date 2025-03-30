// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primeuix/themes/aura'
import PrimeUI from 'tailwindcss-primeui'

const preventFlash = () => {
  try {
    const state = JSON.parse(localStorage.getItem('appThemeState') || '')
    if (!state) return

    if (state.darkMode) {
      document.documentElement.classList.add('p-dark')
    }

    document.documentElement.style.visibility = 'hidden'

    const showContent = () => (document.documentElement.style.visibility = '')

    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', () =>
        setTimeout(showContent, 50)
      )
    } else {
      setTimeout(showContent, 50)
    }
  } catch {
    document.documentElement.style.visibility = ''
  }
}

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@primevue/nuxt-module', '@vueuse/nuxt'],

  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.p-dark',
        },
      },
      ripple: true,
    },
    autoImport: true,
  },

  css: ['primeicons/primeicons.css', 'assets/css/main.css'],

  app: {
    head: {
      // This script must load before any rendering happens
      script: [
        {
          innerHTML: `(${preventFlash.toString()})();`,
          tagPosition: 'bodyOpen',
          type: 'text/javascript',
        },
      ],
      // CSS to help smooth the transition when it appears
      style: [
        {
          innerHTML: `
            /* Ensure smooth appearance once loaded */
            html {
              opacity: 1;
              transition: opacity 0.1s ease;
            }
          `,
          tagPosition: 'bodyOpen',
        },
      ],
    },
  },

  // Add a plugin to apply the complete theme state on client side
  plugins: [{ src: '~/plugins/apply-theme.client.ts', mode: 'client' }],

  compatibilityDate: '2025-03-29',
})
