<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useDark } from '@vueuse/core'

const isDark = useDark({
  storageKey: 'theme',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: ''
})

// 初始化时设置主题
onMounted(() => {
  // 从localStorage读取主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
    isDark.value = true
  } else {
    document.documentElement.classList.remove('dark')
    isDark.value = false
  }
})

// 监听主题变化，确保同步
watch(isDark, (dark) => {
  if (dark) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}, { immediate: false })
</script>

