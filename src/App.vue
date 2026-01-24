<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDark } from '@vueuse/core'

// 统一配置 useDark，让它自动处理系统主题检测和localStorage
// 如果没有存储的主题，会自动检测系统偏好（prefers-color-scheme）
const isDark = useDark({
  storageKey: 'theme',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  selector: 'html'
})

const router = useRouter()
const route = useRoute()

// 确保首次加载时正确处理滚动
onMounted(() => {
  // 延迟一下确保 DOM 已经渲染
  setTimeout(() => {
    if (route.hash) {
      // 如果有 hash，滚动到对应元素
      const element = document.querySelector(route.hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else if (route.path === '/') {
      // 如果没有 hash，确保滚动到顶部
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, 150)
})
</script>

