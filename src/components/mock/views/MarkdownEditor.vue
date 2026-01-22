<template>
  <div class="main-container">
    <div class="content-container" ref="containerRef">
      <!-- 主编辑器区域 -->
      <div 
        :id="editorDomId" 
        ref="vditorEl" 
        class="editor vditor-readonly"
        :style="{
          '--panel-background-color': currentTheme.editorPanelBackgroundColor || currentTheme.background2nd,
          '--toolbar-background-color': currentTheme.editorToolbarBackgroundColor || currentTheme.background,
          '--textarea-background-color': currentTheme.editorTextareaBackgroundColor || currentTheme.background,
          '--editor-min-width': '700px',
          '--editor-text-color': currentTheme.textColor,
          color: currentTheme.textColor,
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { useI18n } from 'vue-i18n'
import { useMockTheme } from '../utils/theme'
import { getExampleMarkdown } from '../utils/exampleContent'

const { t, locale } = useI18n()
const { currentTheme } = useMockTheme()

const containerRef = ref(null)
const vditorEl = ref(null)
const editorDomId = 'vditor-editor-mock'
let vditor = null

// 初始化 Vditor - 使用 Vditor.preview 而不是编辑器模式
const initVditor = async () => {
  if (!vditorEl.value) return

  await nextTick()

  try {
    const isDark = currentTheme.value.type === 'dark'
    const contentTheme = isDark ? 'dark' : 'light'
    const codeTheme = isDark ? 'a11y-dark' : 'github'
    const vditorCDN = 'https://unpkg.com/vditor@latest'
    
    // 清空容器
    vditorEl.value.innerHTML = ''
    
    // 设置容器文字颜色
    vditorEl.value.style.color = currentTheme.value.textColor
    
    // 使用 Vditor.preview 直接渲染，而不是创建编辑器实例（使用 i18n）
    const markdown = getExampleMarkdown(t)
    await Vditor.preview(vditorEl.value, markdown, {
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
      Vditor.codeRender(vditorEl.value)
    }
    
    if (typeof Vditor.mathRender === 'function') {
      Vditor.mathRender(vditorEl.value, { cdn: vditorCDN })
    }
    
    // 标记为已初始化（用于主题同步）
    vditor = { initialized: true }
  } catch (error) {
    console.error('初始化 Vditor 失败:', error)
  }
}

// 同步 Vditor 主题颜色
const syncVditorTheme = async () => {
  if (!vditor || !vditorEl.value) return
  
  // 重新渲染以应用新主题
  await initVditor()
}

// 监听主题变化
watch(() => currentTheme.value.type, () => {
  if (vditor) {
    syncVditorTheme()
  }
})

// 监听语言切换，重新渲染
watch(
  () => locale.value,
  () => {
    if (vditor) {
      nextTick(() => {
        initVditor()
      })
    }
  },
  { immediate: false }
)

onMounted(() => {
  nextTick(() => {
    initVditor()
  })
})

onBeforeUnmount(() => {
  // 清理预览内容
  if (vditorEl.value) {
    vditorEl.value.innerHTML = ''
  }
  vditor = null
})
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: v-bind('currentTheme.background');
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.editor {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 400px;
}

/* Vditor 样式覆盖 */
.editor :deep(.vditor) {
  height: 100%;
}

.editor :deep(.vditor-toolbar) {
  background-color: var(--toolbar-background-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.editor :deep(.vditor-content) {
  background-color: var(--textarea-background-color);
}

.editor :deep(.vditor-preview) {
  background-color: var(--textarea-background-color);
  color: var(--editor-text-color);
}

/* 只读模式样式 */
.vditor-readonly :deep(.vditor-content) {
  pointer-events: none;
  user-select: text;
}

.vditor-readonly :deep(.vditor-content__preview) {
  color: v-bind('currentTheme.textColor');
}

.vditor-readonly :deep(.vditor-content__preview h1),
.vditor-readonly :deep(.vditor-content__preview h2),
.vditor-readonly :deep(.vditor-content__preview h3),
.vditor-readonly :deep(.vditor-content__preview h4),
.vditor-readonly :deep(.vditor-content__preview h5),
.vditor-readonly :deep(.vditor-content__preview h6) {
  color: v-bind('currentTheme.textColor');
}

.vditor-readonly :deep(.vditor-content__preview p),
.vditor-readonly :deep(.vditor-content__preview li),
.vditor-readonly :deep(.vditor-content__preview td),
.vditor-readonly :deep(.vditor-content__preview th) {
  color: v-bind('currentTheme.textColor');
}

.vditor-readonly :deep(.vditor-content__preview code) {
  background-color: v-bind('currentTheme.background2nd');
  color: v-bind('currentTheme.textColor');
}

.vditor-readonly :deep(.vditor-content__preview blockquote) {
  border-left-color: v-bind('currentTheme.primaryColor');
  color: v-bind('currentTheme.textColor');
  opacity: 0.9;
}
</style>

