import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入 Element Plus 暗黑模式 CSS
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VueTree from '@ssthouse/vue3-tree-chart'
import '@ssthouse/vue3-tree-chart/dist/vue3-tree-chart.css'
import './style.css'

const app = createApp(App)

// 注册 Element Plus
app.use(ElementPlus)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册 VueTree 组件
app.component('VueTree', VueTree)

app.use(router)
app.use(i18n)

app.mount('#app')

