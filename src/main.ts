
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css';
import '@/access.ts'
import VueCropper from 'vue-cropper/dist/vue-cropper.es.js'
import 'vue-cropper/dist/index.css'
import '@/styles/sketch-theme.css'
import '@/styles/sketch-theme-overrides.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)
app.use(VueCropper as any)
app.mount('#app')



