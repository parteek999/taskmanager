import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
axios.defaults.headers.common['Content-Type'] = 'application/json'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
