import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（浏览器前进/后退），使用保存的位置
    if (savedPosition) {
      return savedPosition
    }
    // 如果有 hash，滚动到对应元素
    if (to.hash) {
      // 返回一个 Promise，等待 DOM 渲染完成后再滚动
      return new Promise((resolve) => {
        setTimeout(() => {
          const element = document.querySelector(to.hash)
          if (element) {
            resolve({ el: to.hash, behavior: 'smooth' })
          } else {
            // 如果找不到元素，滚动到顶部
            resolve({ top: 0, behavior: 'auto' })
          }
        }, 100)
      })
    }
    // 如果没有 hash，滚动到顶部（主页）
    return { top: 0, behavior: 'auto' }
  }
})

export default router

