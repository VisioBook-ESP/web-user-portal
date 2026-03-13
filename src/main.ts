// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import './styles/globals.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(vuetify);

// Initialize auth on app start
import { useAuthStore } from './store/auth';
const authStore = useAuthStore();
authStore.initializeAuth();

app.mount('#app');
