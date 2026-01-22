<template>
  <div class="dummy-view" :style="viewStyle">
    <div class="dummy-content">
      <el-icon class="dummy-icon">
        <component :is="iconComponent" />
      </el-icon>
      <h2 class="dummy-title" :style="{ color: currentTheme.textColor }">
        {{ title }}
      </h2>
      <p class="dummy-description" :style="{ color: currentTheme.textColor, opacity: 0.7 }">
        {{ $t('mock.dummy.description') }}
      </p>
      <el-button type="primary" size="large" @click="handleDownload">
        {{ $t('mock.dummy.download') }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { View, ChatDotRound, DocumentChecked } from '@element-plus/icons-vue'
import { useMockTheme } from '../utils/theme'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['visualize', 'agent', 'proofread'].includes(value)
  }
})

const { t } = useI18n()
const { currentTheme } = useMockTheme()

const iconMap = {
  visualize: View,
  agent: ChatDotRound,
  proofread: DocumentChecked
}

const titleMap = {
  visualize: t('mock.viewMenu.visualize'),
  agent: t('mock.viewMenu.agent'),
  proofread: t('mock.viewMenu.proofread')
}

const iconComponent = computed(() => iconMap[props.type])
const title = computed(() => titleMap[props.type])

const viewStyle = computed(() => ({
  backgroundColor: currentTheme.value.background,
}))

const handleDownload = () => {
  // 跳转到下载区域
  const downloadSection = document.getElementById('download')
  if (downloadSection) {
    downloadSection.scrollIntoView({ behavior: 'smooth' })
  } else {
    // 如果不在当前页面，跳转到主页的下载区域
    window.location.href = '/#download'
  }
}
</script>

<style scoped>
.dummy-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dummy-content {
  text-align: center;
  padding: 40px;
  max-width: 500px;
}

.dummy-icon {
  font-size: 80px;
  margin-bottom: 24px;
  opacity: 0.5;
  color: v-bind('currentTheme.primaryColor');
}

.dummy-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.dummy-description {
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 32px 0;
}
</style>

