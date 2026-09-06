import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import FlowpipePreset from './theme/preset'
import 'primeicons/primeicons.css'
import './style.css'
import App from './App.vue'
// import 'flowpipe-web-editor/dist/flowpipe-web-editor.css'

const app = createApp(App)

app.use(ToastService)
app.use(PrimeVue, {
  theme: {
    preset: FlowpipePreset,
    options: {
      darkModeSelector: '.dark',
      cssLayer: false,
    },
  },
})

app.mount('#app')
