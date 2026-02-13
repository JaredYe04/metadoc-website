<template>
  <div class="logo-tab-wrapper">
    <div class="logo-tab">
      <img src="/logo.svg" alt="MetaDoc" class="logo-tab__image" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMockTheme, mixColors } from './utils/theme'

const { currentTheme } = useMockTheme()

// 与 MainTabs 背景色完全一致
const logoTabBackgroundColor = computed(() => {
  try {
    const baseColor = currentTheme.value.background
    return mixColors(baseColor, '#888888', 0.3)
  } catch {
    return '#e8e8e8'
  }
})
</script>

<style scoped>
.logo-tab-wrapper {
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 40px;
  /* 与左侧栏总宽一致：LeftMenu 折叠 64px + .side-menu border-right 1px = 65px */
  width: 65px;
  min-width: 65px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  background-color: v-bind('logoTabBackgroundColor');
}

.logo-tab {
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: default;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  transition: background-color 0.2s ease;
}

.logo-tab:hover {
  background-color: var(--el-fill-color-light, rgba(0, 0, 0, 0.06));
}

.logo-tab__image {
  width: 24px;
  height: 24px;
  display: block;
}
</style>

