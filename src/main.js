import { createApp } from 'vue';
import ui from '@nuxt/ui/vue-plugin';
import App from './App.vue';
import router from './router';

import 'vue-loading-overlay/dist/css/index.css';
import 'vue3-json-viewer/dist/vue3-json-viewer.css';
import './assets/css/main.css';

const app = createApp(App);

app.use(router);
app.use(ui);

app.mount('#app');
