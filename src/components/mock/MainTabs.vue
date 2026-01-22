<template>
  <div class="main-tabs-wrapper">
    <div class="tabs-container">
      <el-tabs
        v-model="currentActiveId"
        type="card"
        class="main-tabs"
      >
        <el-tab-pane
          v-for="tab in mockTabs"
          :key="tab.id"
          :name="tab.id"
          :closable="false"
        >
          <template #label>
            <div
              class="main-tab-label"
              :title="getTabTooltip(tab)"
            >
              <span class="main-tab-label__text">
                {{ tab.subtitle || tab.title || '未命名' }}
              </span>
              <span
                v-if="tab.dirty"
                class="main-tab-label__dot"
              />
              <!-- 自定义关闭按钮 - 默认所有Tab都显示，活跃Tab始终显示 -->
              <!-- <span
                v-if="canCloseTab(tab)"
                class="main-tab-label__close"
                :class="{ 'main-tab-label__close--active': currentActiveId === tab.id }"
                @click.stop="handleCloseTab(tab.id)"
                @mousedown.stop
                @dragstart.stop
              >
                <el-icon><Close /></el-icon>
              </span> -->
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
      <!-- 新建文档按钮 -->
      <div
        class="new-tab-button"
        title="新建文档"
      >
        <el-icon><Plus /></el-icon>
      </div>
    </div>
    
    <!-- 窗口控制按钮 (最右侧，移动端隐藏) -->
    <div class="window-controls">
      <div class="window-control-btn">
        <el-icon><Minus /></el-icon>
      </div>
      <div class="window-control-btn">
        <el-icon><FullScreen /></el-icon>
      </div>
      <div class="window-control-btn window-control-btn--close">
        <el-icon><Close /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Minus, FullScreen, Close, Plus } from '@element-plus/icons-vue'
import { useMockTheme, mixColors } from './utils/theme'

const { t } = useI18n()

const { currentTheme } = useMockTheme()



// Mock 数据：只保留一个 example.md 标签页
const mockTabs = ref([
  { id: 'tab1', title: t('mock.tabs.example'), subtitle: 'example.md', dirty: true }
])

const currentActiveId = ref('tab1')

// 使用mixColors生成辅助色
const tabsContainerBackgroundColor = computed(() => {
  try {
    const baseColor = currentTheme.value.background
    return mixColors(baseColor, '#888888', 0.3)
  } catch {
    return '#f5f5f5'
  }
})

const tabItemBackgroundColor = computed(() => {
  try {
    const baseColor = currentTheme.value.background
    return mixColors(baseColor, '#888888', 0.2)
  } catch {
    return '#f7f7f7'
  }
})

const tabItemHoverBackgroundColor = computed(() => {
  try {
    const baseColor = currentTheme.value.background
    return mixColors(baseColor, '#888888', 0.15)
  } catch {
    return '#f0f0f0'
  }
})

const tabItemActiveBackgroundColor = computed(() => {
  try {
    const baseColor = currentTheme.value.background
    return mixColors(baseColor, '#888888', 0.08)
  } catch {
    return '#e8f0f8'
  }
})

const borderColor = computed(() => {
  try {
    const baseColor = currentTheme.value.background
    return mixColors(baseColor, '#888888', 0.4)
  } catch {
    return '#d0d0d0'
  }
})

const getTabTooltip = (tab) => {
  const primary = tab.subtitle || tab.title || t('mock.tabs.untitled')
  const secondary = tab.title
  if (!secondary || secondary === primary) {
    return primary
  }
  return secondary ? `${primary} — ${secondary}` : primary
}

const canCloseTab = (tab) => {
  // 所有Tab都可以关闭
  return true
}

const handleCloseTab = (tabId) => {
  // Mock 版本：关闭 tab 的逻辑（可以留空或显示提示）
  console.log('Close tab:', tabId)
}
</script>

<style scoped>
.main-tabs-wrapper {
  display: flex;
  align-items: center;
  height: 40px;
  background-color: v-bind('tabsContainerBackgroundColor');
  border-bottom: 1px solid v-bind('borderColor');
  user-select: none;
  -webkit-user-select: none;
  position: relative;
}

.tabs-container {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
  position: relative;
  gap: 0;
}

.main-tabs {
  flex: 1;
  border-bottom: none;
  min-width: 0;
  max-width: 100%;
  background-color: v-bind('tabsContainerBackgroundColor');
  position: relative;
  z-index: 1;
  margin-right: 0;
  padding-right: 0;
}

.main-tabs :deep(.el-tabs__nav) {
  display: flex;
  width: 100%;
  max-width: 100%;
  flex-wrap: nowrap;
  margin-right: 0;
  padding-right: 0;
}

.main-tabs :deep(.el-tabs__nav-wrap) {
  overflow: visible;
}

.main-tabs :deep(.el-tabs__item) {
  flex: 1 1 0;
  min-width: 0 !important;
  max-width: none !important;
  width: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
}

.main-tabs :deep(.el-tabs__nav:not(:has(.el-tabs__item:nth-child(17)))) .el-tabs__item {
  max-width: 200px !important;
}

.main-tabs :deep(.el-tabs__item .el-tabs__label) {
  min-width: 0 !important;
  width: 100%;
  max-width: 100%;
  overflow: hidden !important;
  flex-shrink: 1;
  display: flex;
  align-items: center;
}

.main-tab-label {
  display: flex;
  align-items: center;
  gap: 4px;
  line-height: 1.2;
  width: 100%;
  min-width: 0 !important;
  max-width: 100%;
  height: 100%;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  position: relative;
  flex-shrink: 1;
  box-sizing: border-box;
  overflow: hidden;
  flex: 0 1 auto;
  padding-right: 20px; /* 为关闭按钮留出空间 */
}

.main-tab-label__text {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  flex: 1 1 0;
  min-width: 0 !important;
  max-width: 100%;
  width: 0;
}

@media (max-width: 767px) {
  .main-tab-label__text {
    font-size: 12px;
  }
  
  .main-tabs :deep(.el-tabs__item) {
    padding-left: 8px !important;
    padding-right: 2px !important;
  }
}

.main-tab-label__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--el-text-color-primary);
  flex-shrink: 0;
}

.main-tabs :deep(.el-tabs__header.is-top) {
  margin: 0;
  margin-bottom: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.main-tabs :deep(.el-tabs__item) {
  padding-left: 12px !important;
  padding-right: 2px !important;
  margin-left: 0 !important;
  margin-right: 2px !important;
  height: 40px;
  line-height: 40px;
  transition: background-color 0.15s ease, color 0.15s ease;
  margin-bottom: 0 !important;
  margin-top: 0 !important;
  border-radius: 6px 6px 0 0;
  box-sizing: border-box;
  overflow: hidden;
}

.main-tabs :deep(.el-tabs__nav-wrap) {
  margin-bottom: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  height: 40px;
}

.main-tabs :deep(.el-tabs__header) {
  margin-bottom: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-bottom: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  height: 40px;
  padding-top: 0 !important;
}

.main-tabs :deep(.el-tabs__nav-scroll) {
  height: 40px;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.main-tabs :deep(.el-tabs__nav) {
  margin-bottom: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  height: 40px;
}

.main-tabs :deep(.el-tabs__item) {
  background-color: v-bind('tabItemBackgroundColor');
}

.main-tabs :deep(.el-tabs__item.is-active) {
  background-color: v-bind('tabItemActiveBackgroundColor');
  color: var(--el-color-primary);
  border-radius: 6px 6px 0 0;
  font-weight: 600;
}

.main-tabs :deep(.el-tabs__item:not(.is-active):hover) {
  background-color: v-bind('tabItemHoverBackgroundColor');
}

.main-tabs :deep(.el-tabs__item .el-icon-close) {
  display: none !important;
}

.main-tab-label__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  position: absolute;
  right: 2px; 
  top: 0;
  bottom: 0;
  margin: 0;
  border-radius: 3px;
  cursor: pointer;
  color: var(--el-text-color-primary);
  transition: all 0.2s ease;
  flex-shrink: 0;
  z-index: 10;
  padding: 0;
  /* 默认所有Tab的关闭按钮都显示 */
  opacity: 1;
  pointer-events: auto;
}

/* 活跃Tab的关闭按钮：始终显示 */
.main-tab-label__close--active {
  opacity: 1 !important;
  pointer-events: auto !important;
  visibility: visible !important;
}

.main-tab-label__close:hover {
  background-color: var(--el-fill-color-light, rgba(0, 0, 0, 0.06));
  color: var(--el-text-color-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.main-tab-label__close .el-icon {
  font-size: 12px;
}

.window-controls {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 4px;
  border-left: 1px solid v-bind('borderColor');
  gap: 4px;
}

@media (max-width: 767px) {
  .window-controls {
    display: none;
  }
  
  .new-tab-button {
    margin-left: 8px;
    margin-right: 8px;
  }
}

.window-control-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: var(--el-text-color-primary);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.window-control-btn:hover {
  background-color: var(--el-fill-color-light, rgba(0, 0, 0, 0.06));
}

.window-control-btn--close:hover {
  background-color: var(--el-color-danger);
  color: #ffffff;
}

.window-control-btn .el-icon {
  font-size: 16px;
}

.new-tab-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: var(--el-text-color-primary);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  flex-shrink: 0;
  margin-left: 20px;
  margin-right: 0;
  background-color: v-bind('tabItemBackgroundColor');
  position: relative;
  z-index: 10;
  padding: 0;
}

.new-tab-button:hover {
  background-color: v-bind('tabItemHoverBackgroundColor');
}

.new-tab-button .el-icon {
  font-size: 16px;
  font-weight: 600;
}
</style>

