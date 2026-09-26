import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import router from './router'
import { FlowpipeEditorPlugin } from 'flowpipe-web-editor'
import ToastService from 'primevue/toastservice'
import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';

const app = createApp(App)
app.use(FlowpipeEditorPlugin)
app.use(ToastService)
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
 });
app.mount('#app')
