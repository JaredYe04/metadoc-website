<template>
  <div class="view-menu-container" :class="{ 'is-collapsed': isCollapsed, 'is-mobile': isMobile }">
    <!-- 移动端底部导航 -->
    <div v-if="isMobile" class="mobile-nav-menu">
      <button
        v-for="item in menuItems"
        :key="item.index"
        @click="handleSelect(item.index)"
        :class="['mobile-nav-item', { 'is-active': activeMenuIndex === item.index }]"
      >
        <div class="mobile-nav-icon">
          <img :src="item.icon" class="menu-icon" :alt="item.label" />
        </div>
        <span class="mobile-nav-label">{{ item.label }}</span>
      </button>
    </div>
    
    <!-- 桌面端垂直菜单 -->
    <el-menu
      v-else
      :class="['modern-side-menu', 'sub-view-menu', { 'is-collapsed': isCollapsed }]"
      mode="vertical"
      :menu-trigger="'hover'"
      :default-active="activeMenuIndex"
      :background-color="currentTheme.background"
      :text-color="currentTheme.SideTextColor"
      :active-text-color="currentTheme.SideTextColor"
      @select="handleSelect"
    >
      <el-tooltip v-if="isCollapsed" :content="$t('mock.viewMenu.home')" placement="right">
        <el-menu-item index="home">
          <div class="icon-wrapper">
            <img :src="currentTheme.HomeIcon" class="menu-icon" alt="home" />
          </div>
        </el-menu-item>
      </el-tooltip>
      <el-menu-item v-if="!isCollapsed" index="home">
        <div class="icon-wrapper">
          <img :src="currentTheme.HomeIcon" class="menu-icon" alt="home" />
        </div>
        <span>{{ $t('mock.viewMenu.home') }}</span>
      </el-menu-item>
      
      <el-tooltip v-if="isCollapsed" :content="$t('mock.viewMenu.editor')" placement="right">
        <el-menu-item index="editor">
          <div class="icon-wrapper">
            <img :src="currentTheme.EditorIcon" class="menu-icon" alt="editor" />
          </div>
        </el-menu-item>
      </el-tooltip>
      <el-menu-item v-if="!isCollapsed" index="editor">
        <div class="icon-wrapper">
          <img :src="currentTheme.EditorIcon" class="menu-icon" alt="editor" />
        </div>
        <span>{{ $t('mock.viewMenu.editor') }}</span>
      </el-menu-item>
      
      <el-tooltip v-if="isCollapsed" :content="$t('mock.viewMenu.outline')" placement="right">
        <el-menu-item index="outline">
          <div class="icon-wrapper">
            <img :src="currentTheme.OutlineIcon" class="menu-icon" alt="outline" />
          </div>
        </el-menu-item>
      </el-tooltip>
      <el-menu-item v-if="!isCollapsed" index="outline">
        <div class="icon-wrapper">
          <img :src="currentTheme.OutlineIcon" class="menu-icon" alt="outline" />
        </div>
        <span>{{ $t('mock.viewMenu.outline') }}</span>
      </el-menu-item>
      
      <el-tooltip v-if="isCollapsed" :content="$t('mock.viewMenu.visualize')" placement="right">
        <el-menu-item index="visualize">
          <div class="icon-wrapper">
            <img :src="currentTheme.VisualIcon" class="menu-icon" alt="visualize" />
          </div>
        </el-menu-item>
      </el-tooltip>
      <el-menu-item v-if="!isCollapsed" index="visualize">
        <div class="icon-wrapper">
          <img :src="currentTheme.VisualIcon" class="menu-icon" alt="visualize" />
        </div>
        <span>{{ $t('mock.viewMenu.visualize') }}</span>
      </el-menu-item>
      
      <el-tooltip v-if="isCollapsed" :content="$t('mock.viewMenu.agent')" placement="right">
        <el-menu-item index="agent">
          <div class="icon-wrapper">
            <img :src="currentTheme.AgentIcon" class="menu-icon" alt="agent" />
          </div>
        </el-menu-item>
      </el-tooltip>
      <el-menu-item v-if="!isCollapsed" index="agent">
        <div class="icon-wrapper">
          <img :src="currentTheme.AgentIcon" class="menu-icon" alt="agent" />
        </div>
        <span>{{ $t('mock.viewMenu.agent') }}</span>
      </el-menu-item>
      
      <el-tooltip v-if="isCollapsed" :content="$t('mock.viewMenu.proofread')" placement="right">
        <el-menu-item index="proofread">
          <div class="icon-wrapper">
            <img :src="currentTheme.ProofreadIcon" class="menu-icon" alt="proofread" />
          </div>
        </el-menu-item>
      </el-tooltip>
      <el-menu-item v-if="!isCollapsed" index="proofread">
        <div class="icon-wrapper">
          <img :src="currentTheme.ProofreadIcon" class="menu-icon" alt="proofread" />
        </div>
        <span>{{ $t('mock.viewMenu.proofread') }}</span>
      </el-menu-item>
    </el-menu>
    <!-- 折叠按钮（仅桌面端） -->
    <div v-if="!isMobile" class="collapse-button" @click="toggleCollapse">
      <el-icon>
        <ArrowLeft v-if="!isCollapsed" />
        <ArrowRight v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { useMockTheme, mixColors } from './utils/theme'
import './assets/modern-side-menu.css'

const { t } = useI18n()

const { currentTheme } = useMockTheme()

// 定义 emits
const emit = defineEmits(['collapse-changed'])

// 折叠状态 - 默认展开
const isCollapsed = ref(false)
const activeMenuIndex = ref('home')

// 移动端检测
const isMobile = ref(false)
const checkMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768
  }
}

// 菜单项配置
const menuItems = computed(() => [
  { index: 'home', label: t('mock.viewMenu.home'), icon: currentTheme.value.HomeIcon },
  { index: 'editor', label: t('mock.viewMenu.editor'), icon: currentTheme.value.EditorIcon },
  { index: 'outline', label: t('mock.viewMenu.outline'), icon: currentTheme.value.OutlineIcon },
  { index: 'visualize', label: t('mock.viewMenu.visualize'), icon: currentTheme.value.VisualIcon },
  { index: 'agent', label: t('mock.viewMenu.agent'), icon: currentTheme.value.AgentIcon },
  { index: 'proofread', label: t('mock.viewMenu.proofread'), icon: currentTheme.value.ProofreadIcon },
])

// 监听折叠状态变化，通知父组件
watch(isCollapsed, (newVal) => {
  emit('collapse-changed', newVal)
})

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  // 通过事件通知父组件更新布局
  emit('collapse-changed', isCollapsed.value)
}

// 处理菜单选择
const handleSelect = (key) => {
  activeMenuIndex.value = key
  // 通过事件通知父组件切换视图
  if (window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('view-menu-select', { detail: { view: key } }))
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})

// 计算选中状态的背景色（使用辅助背景色）
const activeBackgroundColor = computed(() => mixColors(currentTheme.value.background2nd, currentTheme.value.textColor, 0.3))
const activeTextColor = computed(() => currentTheme.value.textColor)
</script>

<style scoped>
.view-menu-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.view-menu-container.is-collapsed .modern-side-menu {
  width: 64px;
}

/* 组件特定的菜单样式 */
.modern-side-menu.sub-view-menu {
  width: 120px;
  height: 100%;
  padding-bottom: 48px; /* 为折叠按钮留出空间 */
}

.modern-side-menu.sub-view-menu.is-collapsed {
  width: 64px;
  padding-bottom: 48px;
}

/* 激活状态的颜色绑定（ViewMenu 特定） */
.modern-side-menu :deep(.el-menu-item.is-active) {
  background-color: v-bind('activeBackgroundColor') !important;
  color: v-bind('activeTextColor') !important;
  border-radius: 6px !important;
}

/* 确保 hover 状态也有圆角 */
.modern-side-menu :deep(.el-menu-item:hover) {
  border-radius: 6px !important;
}

/* 折叠按钮 */
.collapse-button {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--el-text-color-primary);
  background-color: transparent;
  z-index: 10;
}

.collapse-button:hover {
  background-color: var(--el-fill-color-light, rgba(0, 0, 0, 0.06));
}

.collapse-button .el-icon {
  font-size: 16px;
}

/* 图标容器 - 固定尺寸的正方形 */
.icon-wrapper {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 图标样式 - 在容器内自适应 */
.menu-icon {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* 展开状态下，图标容器和文字之间的间距 */
.modern-side-menu.sub-view-menu:not(.is-collapsed) .el-menu-item .icon-wrapper {
  margin-right: 8px;
}

/* 移动端底部导航样式 */
.mobile-nav-menu {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  height: 100%;
  padding: 4px 0;
  background-color: var(--el-bg-color, #ffffff);
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--el-text-color-regular, #606266);
  min-width: 0;
}

.mobile-nav-item.is-active {
  color: var(--el-color-primary, #409eff);
}

.mobile-nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  flex-shrink: 0;
}

.mobile-nav-icon .menu-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.mobile-nav-label {
  font-size: 10px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-align: center;
}

.view-menu-container.is-mobile {
  height: 100%;
  width: 100%;
}
</style>
