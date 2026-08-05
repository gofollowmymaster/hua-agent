import { createApp } from 'vue';
import App from './app.vue';
import { setupRouter } from './router';
import { setupStore } from './stores';
import '@aplus-frontend/antdv/dist/reset.css';
import './styles/global.less';

const app = createApp(App);

setupStore(app);
setupRouter(app);

app.mount('#app');
