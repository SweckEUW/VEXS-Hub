import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { FlowpipeEditorPlugin } from 'flowpipe-web-editor'
import ToastService from 'primevue/toastservice'

const app = createApp(App)
app.use(FlowpipeEditorPlugin)
app.use(ToastService)
app.mount('#app')