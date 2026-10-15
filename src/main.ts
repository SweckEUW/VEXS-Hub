import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import router from './router'
import ToastService from 'primevue/toastservice'
import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';
import { registerFlowPipeEditor } from 'flowpipe-web-editor';

registerFlowPipeEditor();

const app = createApp(App)
app.use(ToastService)
app.use(router)
app.directive('tooltip', Tooltip);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
 });
app.mount('#app')
