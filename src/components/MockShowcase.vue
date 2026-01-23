<template>
  <section id="mock-showcase" class="py-20 bg-gray-50 dark:bg-gray-800">
    <div class="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
      <div class="showcase-layout">
        <!-- 左侧：标题和说明 -->
        <div class="showcase-text">
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gradient">
            {{ $t('mock.title') }}
          </h2>
          <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-4">
            {{ $t('mock.subtitle') }}
          </p>
          <p class="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {{ currentDescription }}
          </p>
        </div>
        
        <!-- 右侧：Mock 界面容器 -->
        <div class="mock-container">
          <div class="mock-wrapper">
            <MockMain />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import MockMain from './mock/Main.vue'

const { t } = useI18n()

// 当前 tab 和 view
const currentTabId = ref('tab1')
const currentView = ref('home')

// 根据当前 tab 和 view 计算描述文字
const currentDescription = computed(() => {
  // LaTeX tab
  if (currentTabId.value === 'tab2') {
    return t('mock.descriptions.latex')
  }
  
  // Markdown tab 的不同视图
  if (currentTabId.value === 'tab1') {
    const viewKey = `mock.descriptions.${currentView.value}`
    const description = t(viewKey)
    // 如果翻译键不存在，返回默认值
    if (description === viewKey) {
      return t('mock.descriptions.home')
    }
    return description
  }
  
  // 默认返回主页描述
  return t('mock.descriptions.home')
})

// 监听 tab 切换事件
const handleTabChange = (event) => {
  const tabId = event.detail?.tabId
  if (tabId) {
    currentTabId.value = tabId
    // LaTeX tab 时设置 view 为 latex
    if (tabId === 'tab2') {
      currentView.value = 'latex'
    }
    // Markdown tab 时，不自动改变 view，保持当前 view（初始为 home）
    // view 的切换由 view-menu-select 事件处理
  }
}

// 监听视图切换事件
const handleViewMenuSelect = (event) => {
  const view = event.detail?.view
  if (view && currentTabId.value === 'tab1') {
    // 只在 Markdown tab 时更新 view
    currentView.value = view
  }
}

onMounted(() => {
  window.addEventListener('tab-change', handleTabChange)
  window.addEventListener('view-menu-select', handleViewMenuSelect)
})

onBeforeUnmount(() => {
  window.removeEventListener('tab-change', handleTabChange)
  window.removeEventListener('view-menu-select', handleViewMenuSelect)
})
</script>

<style scoped>
.showcase-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .showcase-layout {
    flex-direction: row;
    align-items: center;
    gap: 3rem;
  }
}

.showcase-text {
  flex: 0 0 auto;
  text-align: center;
}

@media (min-width: 1024px) {
  .showcase-text {
    flex: 0 0 25%;
    text-align: left;
  }
}

.showcase-text p {
  transition: opacity 0.3s ease;
}

.mock-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex: 1;
}

@media (min-width: 1024px) {
  .mock-container {
    flex: 0 0 75%;
  }
}

.mock-wrapper {
  width: 100%;
  max-width: 1200px;
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  background: var(--el-bg-color, #ffffff);
  border: 1px solid var(--el-border-color-lighter, #e0e0e0);
}

@media (min-width: 640px) {
  .mock-wrapper {
    height: 600px;
    max-width: 1300px;
    border-radius: 10px;
    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.25);
  }
}

@media (min-width: 1024px) {
  .mock-wrapper {
    height: 700px;
    max-width: 100%;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }
}

.dark .mock-wrapper {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  border-color: var(--el-border-color-lighter, #404040);
}

@media (min-width: 640px) {
  .dark .mock-wrapper {
    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.5);
  }
}

@media (min-width: 1024px) {
  .dark .mock-wrapper {
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  }
}

/* 确保 Mock 组件内部样式正确 */
.mock-wrapper :deep(.common-layout) {
  height: 100%;
  border-radius: 0;
}
</style>

