<template>
  <div class="homepage">
    <!-- 如果已选择格式，显示文档预览 -->
    <div v-if="showDocumentPreview" class="home-panel" :style="panelStyle">
      <!-- 其他格式：使用滚动条 -->
      <el-scrollbar class="home-panel-scrollbar">
        <div class="home-panel-content">
          <!-- 文档元信息区域 -->
          <div class="document-meta-section">
            <div class="meta-header">
              <!-- 标题：所有格式都显示 -->
              <h1 class="document-title" :style="{ color: currentTheme.textColor }">
                {{ metaTitle || '示例文档' }}
              </h1>
              
              <!-- 其他格式（Markdown/LaTeX）：显示作者和摘要 -->
              <div class="meta-info-row">
                <div class="meta-item" v-if="metaAuthor">
                  <span class="meta-label">作者</span>
                  <span class="meta-value" :style="{ color: currentTheme.textColor }">
                    {{ metaAuthor }}
                  </span>
                </div>
              </div>
              <div class="meta-description" v-if="metaDescription">
                <span class="description-label">摘要</span>
                <p class="description-text" :style="{ color: currentTheme.textColor }">
                  {{ metaDescription }}
                </p>
              </div>
            </div>
          </div>

          <!-- 文档内容预览区域 -->
          <div class="document-content-section">
            <!-- 其他格式：使用Markdown预览 -->
            <div 
              ref="previewContainerRef" 
              class="content-preview" 
              :class="currentTheme.mdeditorClass"
              :style="{ color: currentTheme.textColor }" 
            ></div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMockTheme } from '../utils/theme'
import Vditor from 'vditor'
import { getExampleMarkdown } from '../utils/exampleContent'

const { t, locale } = useI18n()
const { currentTheme } = useMockTheme()

// Mock 数据 - 使用 i18n
const metaTitle = computed(() => t('mock.exampleContent.title'))
const metaAuthor = ref('MetaDoc Team')
const metaDescription = computed(() => t('mock.exampleContent.subtitle'))

const previewContainerRef = ref(null)

// Vditor CDN 配置（Web 环境）
const vditorCDN = 'https://unpkg.com/vditor@latest'

// 是否显示文档预览
const showDocumentPreview = computed(() => true)

// 面板样式
const panelStyle = computed(() => ({
  backgroundColor: currentTheme.value.background2nd || currentTheme.value.background,
  borderColor: currentTheme.value.borderColor || 'rgba(0, 0, 0, 0.1)'
}))

// 渲染预览内容
const renderPreview = async () => {
  if (!previewContainerRef.value) return

  const container = previewContainerRef.value
  const isDark = currentTheme.value.type === 'dark'
  const contentTheme = currentTheme.value.vditorTheme || (isDark ? 'dark' : 'light')
  const codeTheme = currentTheme.value.codeTheme || (isDark ? 'a11y-dark' : 'github')
  
  // 清空容器
  container.innerHTML = ''
  
  // 设置容器文字颜色
  container.style.color = currentTheme.value.textColor
  
  try {
    // 使用 Vditor.preview 渲染 Markdown（使用 i18n）
    const markdown = getExampleMarkdown(t)
    await Vditor.preview(container, markdown, {
      cdn: vditorCDN,
      mode: isDark ? 'dark' : 'light',
      theme: {
        current: contentTheme,
      },
      markdown: {
        toc: true,
      },
      hljs: {
        style: codeTheme,
        lineNumber: true,
      },
    })
    
    // 渲染代码块和数学公式
    if (typeof Vditor.codeRender === 'function') {
      Vditor.codeRender(container)
    }
    
    if (typeof Vditor.mathRender === 'function') {
      Vditor.mathRender(container, { cdn: vditorCDN })
    }
  } catch (error) {
    console.error('渲染 Markdown 预览失败:', error)
    container.innerHTML = `<p style="color: var(--el-color-danger);">渲染失败: ${error instanceof Error ? error.message : String(error)}</p>`
  }
}

// 监听主题变化，重新渲染（参考 VditorPreview.vue 的实现）
watch(
  () => currentTheme.value.type,
  () => {
    nextTick(() => {
      if (showDocumentPreview.value && previewContainerRef.value) {
        renderPreview()
      }
    })
  },
  { immediate: false }
)

// 监听语言切换，重新渲染
watch(
  () => locale.value,
  () => {
    nextTick(() => {
      if (showDocumentPreview.value && previewContainerRef.value) {
        renderPreview()
      }
    })
  },
  { immediate: false }
)

onMounted(() => {
  nextTick(() => {
    if (showDocumentPreview.value) {
      renderPreview()
    }
  })
})
</script>

<style scoped>
.homepage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: v-bind('currentTheme.background');
}

.home-panel {
  position: relative;
  z-index: 1;
  width: calc(100% - 48px);
  height: calc(100% - 48px);
  margin: 24px;
  border-radius: 16px;
  border: 1px solid;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.home-panel-scrollbar {
  flex: 1;
  width: 100%;
  height: 100%;
}

.home-panel-scrollbar :deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
  overflow-y: auto;
}

.home-panel-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 32px 40px;
  box-sizing: border-box;
  gap: 24px;
}

.document-meta-section {
  flex-shrink: 0;
  padding-bottom: 24px;
  border-bottom: 1px solid;
  border-bottom-color: v-bind('currentTheme.borderColor || "rgba(0, 0, 0, 0.08)"');
}

.meta-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.document-title {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
  margin: 0;
  padding: 0;
  color: v-bind('currentTheme.textColor');
  letter-spacing: -0.02em;
}

.meta-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.meta-label {
  font-weight: 500;
  opacity: 0.7;
  color: v-bind('currentTheme.textColor');
}

.meta-value {
  font-weight: 400;
  color: v-bind('currentTheme.textColor');
}

.meta-description {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.description-label {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.7;
  color: v-bind('currentTheme.textColor');
}

.description-text {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  padding: 0;
  color: v-bind('currentTheme.textColor');
  opacity: 0.85;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.document-content-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-preview {
  flex: 1;
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.7;
  font-size: 15px;
  min-height: 0;
}

.content-preview :deep(h1),
.content-preview :deep(h2),
.content-preview :deep(h3) {
  color: v-bind('currentTheme.textColor');
  margin-top: 24px;
  margin-bottom: 16px;
}

.content-preview :deep(p) {
  color: v-bind('currentTheme.textColor');
  opacity: 0.9;
  margin-bottom: 16px;
}

.content-preview :deep(code) {
  background-color: v-bind('currentTheme.background2nd');
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.content-preview :deep(pre) {
  background-color: v-bind('currentTheme.background2nd');
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.content-preview :deep(blockquote) {
  border-left: 4px solid v-bind('currentTheme.primaryColor');
  padding-left: 16px;
  margin: 16px 0;
  opacity: 0.8;
  color: v-bind('currentTheme.textColor');
}

/* Vditor 预览样式 */
.content-preview :deep(.vditor-preview) {
  color: v-bind('currentTheme.textColor');
}

.content-preview :deep(.vditor-preview h1),
.content-preview :deep(.vditor-preview h2),
.content-preview :deep(.vditor-preview h3),
.content-preview :deep(.vditor-preview h4),
.content-preview :deep(.vditor-preview h5),
.content-preview :deep(.vditor-preview h6) {
  color: v-bind('currentTheme.textColor');
}

.content-preview :deep(.vditor-preview p),
.content-preview :deep(.vditor-preview li),
.content-preview :deep(.vditor-preview td),
.content-preview :deep(.vditor-preview th) {
  color: v-bind('currentTheme.textColor');
  opacity: 0.9;
}

.content-preview :deep(.vditor-preview code) {
  background-color: v-bind('currentTheme.background2nd');
  color: v-bind('currentTheme.textColor');
}

.content-preview :deep(.vditor-preview pre) {
  background-color: v-bind('currentTheme.background2nd');
  color: v-bind('currentTheme.textColor');
}

.content-preview :deep(.vditor-preview blockquote) {
  border-left-color: v-bind('currentTheme.primaryColor');
  color: v-bind('currentTheme.textColor');
  opacity: 0.8;
}

/* 表格样式 */
.content-preview :deep(.vditor-preview table) {
  color: v-bind('currentTheme.textColor');
}

.content-preview :deep(.vditor-preview table th),
.content-preview :deep(.vditor-preview table td) {
  border-color: v-bind('currentTheme.borderColor');
}

/* 链接样式 */
.content-preview :deep(.vditor-preview a) {
  color: v-bind('currentTheme.primaryColor');
}

@media (max-width: 768px) {
  .home-panel {
    width: calc(100% - 32px);
    height: calc(100% - 32px);
    margin: 16px;
    border-radius: 12px;
  }

  .home-panel-content {
    padding: 24px;
    gap: 20px;
  }

  .document-title {
    font-size: 20px;
  }

  .content-preview {
    padding: 16px;
    font-size: 14px;
  }
}
</style>

