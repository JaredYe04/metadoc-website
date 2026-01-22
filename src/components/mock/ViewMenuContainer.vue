<template>
  <div class="view-menu-container-wrapper">
    <div class="view-menu-container-main-only">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
// Mock 版本：简化版本，不包含侧边栏
</script>

<style scoped>
.view-menu-container-wrapper {
  flex: 1;
  display: flex;
  height: 100%;
  overflow: hidden;
  min-width: 0;
}

.view-menu-container-main-only {
  flex: 1;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>

