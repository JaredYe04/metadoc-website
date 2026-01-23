<template>
  <div class="common-layout">
    <!-- 顶部区域：Logo + MainTabs -->
    <div class="top-header-container">
      <LogoTab />
      <el-header class="top-header">
        <MainTabs />
      </el-header>
    </div>
    <!-- 主内容区域：左边LeftMenu，中间ViewMenuContainer，右边内容 -->
    <el-container class="main-shell">
      <el-aside v-if="!isMobile" class="side-menu">
        <LeftMenu />
      </el-aside>
      <!-- ViewMenuContainer：包含工作目录菜单和主内容区 -->
      <ViewMenuContainer>
        <div class="content-area-wrapper">
          <el-container class="content-area">
            <!-- 子视图菜单（仅在文档相关视图显示，移动端隐藏，LaTeX tab 不显示） -->
            <el-aside v-if="showSubViewMenu && !isMobile && !isLatexTab" class="sub-view-menu-aside" :class="{ 'is-collapsed': viewMenuCollapsed }">
              <ViewMenu @collapse-changed="handleViewMenuCollapseChanged" />
            </el-aside>
            <el-container class="content-shell">
              <el-main class="content-main">
                <!-- 根据当前 tab 和视图显示不同的组件 -->
                <component :is="currentViewComponent" />
              </el-main>
            </el-container>
          </el-container>
        </div>
      </ViewMenuContainer>
    </el-container>
    <!-- 移动端底部导航菜单（在 BottomMenu 上方，容器内） -->
    <div v-if="isMobile" class="mobile-view-menu">
      <ViewMenu @collapse-changed="handleViewMenuCollapseChanged" />
    </div>
    <!-- BottomMenu放在最下侧，在所有内容之上 -->
    <el-footer class="bottom-footer">
      <BottomMenu />
    </el-footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import LogoTab from './LogoTab.vue'
import MainTabs from './MainTabs.vue'
import LeftMenu from './LeftMenu.vue'
import ViewMenuContainer from './ViewMenuContainer.vue'
import ViewMenu from './ViewMenu.vue'
import BottomMenu from './BottomMenu.vue'
import { useMockTheme } from './utils/theme'
import Home from './views/Home.vue'
import MarkdownEditor from './views/MarkdownEditor.vue'
import LaTeXEditor from './views/LaTeXEditor.vue'
import Outline from './views/Outline.vue'
import Visualize from './views/Visualize.vue'
import AgentView from './views/AgentView.vue'
import ProofreadView from './views/ProofreadView.vue'

const { currentTheme } = useMockTheme()

// 判断是否显示子视图菜单（Mock 版本：桌面端显示，移动端隐藏）
const showSubViewMenu = computed(() => {
  // 移动端（宽度小于 768px）隐藏子视图菜单
  if (typeof window !== 'undefined') {
    return window.innerWidth >= 768
  }
  return true
})
const viewMenuCollapsed = ref(false) // 默认展开

// 响应式检测
const isMobile = ref(false)
const checkMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768
  }
}

// 处理 ViewMenu 折叠状态变化
const handleViewMenuCollapseChanged = (collapsed) => {
  viewMenuCollapsed.value = collapsed
}

// 当前 tab ID（从 MainTabs 获取）
const currentTabId = ref('tab1')

// 当前视图
const currentView = ref('home')

// 判断是否是 LaTeX tab
const isLatexTab = computed(() => {
  return currentTabId.value === 'tab2'
})

// 视图组件映射
const viewComponents = {
  home: Home,
  editor: MarkdownEditor,
  latex: LaTeXEditor,
  outline: Outline,
  visualize: Visualize,
  agent: AgentView,
  proofread: ProofreadView,
}

const currentViewComponent = computed(() => {
  // 如果是 LaTeX tab，直接显示 LaTeX 编辑器
  if (isLatexTab.value) {
    return LaTeXEditor
  }
  // 否则根据当前视图显示组件
  return viewComponents[currentView.value] || Home
})

// 监听 tab 切换事件
const handleTabChange = (event) => {
  const tabId = event.detail?.tabId
  if (tabId) {
    currentTabId.value = tabId
    // LaTeX tab 不需要视图菜单，直接显示编辑器
    if (tabId === 'tab2') {
      currentView.value = 'latex'
    } else if (tabId === 'tab1') {
      // Markdown tab 默认显示编辑器
      currentView.value = 'editor'
    }
  }
}

// 监听视图切换事件
const handleViewMenuSelect = (event) => {
  const view = event.detail?.view
  if (view && viewComponents[view] && !isLatexTab.value) {
    currentView.value = view
  }
}

onMounted(() => {
  window.addEventListener('view-menu-select', handleViewMenuSelect)
  window.addEventListener('tab-change', handleTabChange)
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('view-menu-select', handleViewMenuSelect)
  window.removeEventListener('tab-change', handleTabChange)
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.common-layout {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--el-bg-color, #ffffff);
}

.common-layout,
.common-layout * {
  box-sizing: border-box;
}

.top-header-container {
  display: flex;
  height: 40px;
  background-color: var(--el-bg-color, #ffffff);
  border-bottom: 1px solid var(--el-border-color-lighter, #f0f0f0);
  z-index: 100;
}

.top-header {
  flex: 1;
  height: 40px;
  padding: 0;
  margin: 0;
  line-height: 40px;
  background-color: var(--el-bg-color, #ffffff);
  border-bottom: none;
  z-index: 100;
}

.sub-view-menu-aside {
  width: 120px;
  min-width: 120px;
  background-color: var(--el-bg-color, #ffffff);
  border-right: 1px solid var(--el-border-color-lighter, #f0f0f0);
  overflow: hidden;
  transition: width 0.3s ease, min-width 0.3s ease;
}

.sub-view-menu-aside.is-collapsed {
  width: 64px;
  min-width: 64px;
}

.main-shell {
  flex: 1;
  display: flex;
  flex-direction: row;
  min-height: 0;
  overflow: hidden;
  background-color: var(--el-bg-color, #ffffff);
}

@media (max-width: 767px) {
  .main-shell {
    flex: 1 1 auto;
    min-height: 0;
  }
  
  .content-main {
    padding-bottom: 0;
  }
}

.content-area-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: var(--el-bg-color-page, #f5f7fa);
}

.content-area {
  flex: 1;
  display: flex;
  height: 100%;
  overflow: hidden;
}

.side-menu {
  width: fit-content;
  min-width: 64px;
  background-color: var(--el-bg-color, #ffffff);
  border-right: 1px solid var(--el-border-color-lighter, #f0f0f0);
  overflow: hidden;
}

.content-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  flex: 1;
  background-color: var(--el-bg-color-page, #f5f7fa);
}

.content-main {
  flex: 1 1 auto;
  padding: 0;
  margin: 0;
  position: relative;
  overflow: hidden;
}

.content-main > :deep(.el-scrollbar__wrap),
.content-main > :deep(.el-scrollbar__bar) {
  display: none;
}

.bottom-footer {
  height: 30px;
  padding: 0;
  flex: 0 0 30px;
  display: flex;
  align-items: stretch;
  background-color: var(--el-bg-color, #ffffff);
  border-top: 1px solid var(--el-border-color-lighter, #f0f0f0);
  z-index: 10;
}

/* 移动端底部导航菜单（在容器内，BottomMenu 上方） */
.mobile-view-menu {
  height: 50px;
  flex: 0 0 50px;
  background-color: var(--el-bg-color, #ffffff);
  border-top: 1px solid var(--el-border-color-lighter, #f0f0f0);
  border-bottom: 1px solid var(--el-border-color-lighter, #f0f0f0);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
  .mobile-view-menu {
    display: none;
  }
}

</style>

