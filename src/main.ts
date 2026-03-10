import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { i18n } from './i18n'
import './assets/styles/main.css'
import './assets/styles/animations.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Configure Pinia with persistedstate plugin
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(i18n)

// Configure TanStack Query
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,  // 5 minutes
        gcTime: 10 * 60 * 1000,     // 10 minutes (ex-cacheTime)
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  }
})

app.mount('#app')
