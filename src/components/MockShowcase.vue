<template>
  <section id="mock-showcase" class="py-20 bg-gray-50 dark:bg-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8 md:mb-12">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gradient px-4">
          {{ $t('mock.title') }}
        </h2>
        <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-400 px-4">
          {{ $t('mock.subtitle') }}
        </p>
      </div>
      
      <!-- Mock 界面容器 -->
      <div class="mock-container">
        <div class="mock-wrapper">
          <MockMain />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import MockMain from './mock/Main.vue'

const { t } = useI18n()
</script>

<style scoped>
.mock-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 10px 0;
}

@media (min-width: 640px) {
  .mock-container {
    padding: 20px 0;
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
    max-width: 1400px;
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

