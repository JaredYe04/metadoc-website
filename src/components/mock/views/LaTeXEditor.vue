<template>
  <div class="main-container">
    <div class="content-container">
      <div class="latex-layout">
        <div class="latex-main">
          <!-- 左侧编辑器区域 -->
          <div class="latex-column left-column">
            <!-- 工具栏 -->
            <div class="toolbar" :style="{
              backgroundColor: currentTheme.editorToolbarBackgroundColor || currentTheme.background
            }">
              <el-tooltip :content="$t('mock.latexEditor.toolbar.undo')" placement="bottom">
                <div class="toolbar-icon">
                  <el-icon><ArrowLeft /></el-icon>
                </div>
              </el-tooltip>
              <el-tooltip :content="$t('mock.latexEditor.toolbar.redo')" placement="bottom">
                <div class="toolbar-icon">
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </el-tooltip>
              <el-tooltip :content="$t('mock.latexEditor.toolbar.zoomIn')" placement="bottom">
                <div class="toolbar-icon" @click="zoomIn">
                  <el-icon><ZoomIn /></el-icon>
                </div>
              </el-tooltip>
              <el-tooltip :content="$t('mock.latexEditor.toolbar.zoomOut')" placement="bottom">
                <div class="toolbar-icon" @click="zoomOut">
                  <el-icon><ZoomOut /></el-icon>
                </div>
              </el-tooltip>
              <el-divider direction="vertical"></el-divider>
              <el-tooltip :content="$t('mock.latexEditor.toolbar.showPdf')" placement="bottom">
                <div class="toolbar-icon" @click="togglePdf">
                  <el-icon><Document /></el-icon>
                </div>
              </el-tooltip>
              <el-tooltip :content="$t('mock.latexEditor.toolbar.showConsole')" placement="bottom">
                <div class="toolbar-icon" @click="toggleConsole">
                  <el-icon><Monitor /></el-icon>
                </div>
              </el-tooltip>
              <el-tooltip :content="$t('mock.latexEditor.toolbar.compile')" placement="bottom">
                <div class="toolbar-icon" @click="compile">
                  <el-icon><Setting /></el-icon>
                </div>
              </el-tooltip>
            </div>
            
            <!-- 编辑器和控制台容器 -->
            <div class="editor-console-container" ref="editorConsoleContainerRef">
              <!-- Monaco 编辑器 -->
              <div class="editor-wrapper" :class="{ 'console-visible': showConsole }">
                <div class="editor" :id="editorDomId" ref="editorEl"></div>
              </div>
              
              <!-- 控制台分隔条 -->
              <div 
                v-if="showConsole" 
                class="console-resizer"
                @mousedown="startResizeConsole"
              ></div>
              
              <!-- 控制台输出 -->
              <div v-show="showConsole" class="console-wrapper" :style="{ height: consoleHeight + 'px' }">
                <div class="console-panel" ref="consolePanelRef" :style="{
                  background: currentTheme.background
                }">
                  <div class="console-content">
                    <div 
                      v-for="(line, index) in consoleOutput" 
                      :key="index"
                      class="console-line"
                      :class="{ 'console-line-error': line.type === 'error' }"
                    >
                      {{ line.content }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 右侧 PDF 预览区域 -->
          <div v-if="showPdfPanel" class="latex-column pdf-column">
            <!-- PDF 工具栏 -->
            <div class="pdf-toolbar" :style="{
              backgroundColor: currentTheme.editorToolbarBackgroundColor || currentTheme.background
            }">
              <el-tooltip :content="$t('mock.latexEditor.prevPage')" placement="bottom">
                <div class="pdf-toolbar-icon" :class="{ 'disabled': currentPdfPage <= 1 }" @click="goPrevPage">
                  <el-icon><ArrowLeft /></el-icon>
                </div>
              </el-tooltip>
              <el-tooltip :content="$t('mock.latexEditor.nextPage')" placement="bottom">
                <div class="pdf-toolbar-icon" :class="{ 'disabled': currentPdfPage >= totalPdfPages }" @click="goNextPage">
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </el-tooltip>
              <span class="pdf-toolbar__page">
                <input 
                  type="number" 
                  v-model.number="inputPdfPage" 
                  @change="jumpToPage" 
                  :min="1"
                  :max="totalPdfPages"
                />
                <span class="pdf-toolbar__page-label">/ {{ totalPdfPages }} {{ $t('mock.latexEditor.pages') }}</span>
              </span>
            </div>
            
            <!-- PDF 预览容器 - DOM 级别预加载，所有 PDF 都渲染，只显示当前的 -->
            <!-- 使用 v-show 而不是 v-if，确保 PDF 始终在 DOM 中，编译时只是隐藏 -->
            <el-scrollbar
              ref="pdfScrollbarRef"
              v-show="!isPdfLoading"
              class="pdf-preview-container"
              :class="{ 'hand-mode': pdfViewMode === 'hand', 'pointer-mode': pdfViewMode === 'pointer' }"
              :style="{ background: currentTheme.background }"
            >
              <!-- 为每个 PDF 创建独立的 DOM 结构，通过 v-show 控制显示 -->
              <template v-for="(config, key) in allPdfConfigs" :key="key">
                <div 
                  v-show="currentPdfKey === key"
                  class="pdf-pages-wrapper"
                  :style="pdfWrapperStyle"
                >
                  <div 
                    class="pdf-pages-container"
                    :style="{ ...pdfContainerStyle, transform: `scale(${zoomScale / PDF_RENDER_SCALE})`, transformOrigin: 'top left' }"
                  >
                    <!-- 先渲染第一页以触发 total-pages 事件，然后根据页数渲染所有页面 -->
                    <template v-if="!pdfPagesCache[key] || pdfPagesCache[key] === 0">
                      <!-- 初始状态：渲染第一页以获取总页数 -->
                      <div
                        :key="`pdf-page-${key}-1-init-${pdfRenderKeys[key] || 0}`"
                        :ref="el => setPageRef(el, 1, key)"
                        class="pdf-page-wrapper"
                        :data-page-number="1"
                        :data-pdf-key="key"
                      >
                        <VuePdf
                          :key="`vue-pdf-${key}-1-init-${pdfRenderKeys[key] || 0}`"
                          :src="config"
                          :page="1"
                          :scale="PDF_RENDER_SCALE"
                          :enable-text-selection="true"
                          :enable-annotations="false"
                          :text-layer="true"
                          @total-pages="(num) => handleNumPages(num, key)"
                          @pdf-loaded="handlePdfLoaded($event, key)"
                          @error="(error) => handlePdfError(error, 1, key)"
                          class="vue-pdf-wrapper"
                        />
                      </div>
                    </template>
                    <template v-else>
                      <!-- 已知页数后，渲染所有页面 -->
                      <div
                        v-for="pageNum in pdfPagesCache[key]"
                        :key="`pdf-page-${key}-${pageNum}-${pdfRenderKeys[key] || 0}`"
                        :ref="el => setPageRef(el, pageNum, key)"
                        class="pdf-page-wrapper"
                        :data-page-number="pageNum"
                        :data-pdf-key="key"
                      >
                        <VuePdf
                          :key="`vue-pdf-${key}-${pageNum}-${pdfRenderKeys[key] || 0}`"
                          :src="config"
                          :page="pageNum"
                          :scale="PDF_RENDER_SCALE"
                          :enable-text-selection="true"
                          :enable-annotations="false"
                          :text-layer="true"
                          @total-pages="(num) => handleNumPages(num, key)"
                          @pdf-loaded="pageNum === 1 ? handlePdfLoaded($event, key) : undefined"
                          @error="(error) => handlePdfError(error, pageNum, key)"
                          class="vue-pdf-wrapper"
                        />
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </el-scrollbar>
            <!-- PDF 加载状态 -->
            <div v-show="isPdfLoading" class="pdf-preview-container pdf-loading-container" :style="{ background: currentTheme.background }">
              <div class="pdf-loading-content">
                <el-icon class="is-loading" :size="32">
                  <Loading />
                </el-icon>
                <p class="pdf-loading-text">{{ $t('mock.latexEditor.compileOutput.compiling') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, onActivated, nextTick, watch, shallowRef } from 'vue'
import * as monaco from 'monaco-editor'
import { useI18n } from 'vue-i18n'
import { useMockTheme } from '../utils/theme'
import { getExampleLatex, getExampleCompileOutput } from '../utils/exampleLatexContent'
import { registerLatexLanguage } from '../utils/monaco-latex'
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, Refresh, Document, Monitor, Setting, Loading } from '@element-plus/icons-vue'
import { VuePdf, createLoadingTask } from 'vue3-pdfjs'
import { ElScrollbar } from 'element-plus'
import { debounce } from 'lodash-es'
import * as pdfjsLib from 'pdfjs-dist'

const { t, locale } = useI18n()
const { currentTheme } = useMockTheme()

// 配置 PDF.js 支持中文字体渲染
// 设置 CMap URL 和 CMap 打包选项，用于正确渲染中文
if (typeof window !== 'undefined') {
  // 使用 CDN 提供的 CMap 文件（字符映射表，用于中文字体渲染）
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
}

const editorEl = ref(null)
const editorDomId = 'latex-editor-mock'
let editor = null

const showPdfPanel = ref(true)
const showConsole = ref(false)
const consoleHeight = ref(200)
const editorConsoleContainerRef = ref(null)
const consolePanelRef = ref(null)
let isResizingConsole = false
let resizeStartY = 0
let resizeStartHeight = 0

// PDF 相关
// 所有 PDF 的配置（DOM 级别预加载）
const allPdfConfigs = computed(() => {
  const configs = {}
  const langs = ['zh', 'en']
  const themes = ['', 'dark']
  // 使用 BASE_URL 确保在生产环境中路径正确
  const baseUrl = import.meta.env.BASE_URL
  langs.forEach(lang => {
    themes.forEach(theme => {
      const themeSuffix = theme ? `-${theme}` : ''
      // 确保路径以 / 开头，并正确处理 base URL
      const url = `${baseUrl}pdfs/example-${lang}${themeSuffix}.pdf`.replace(/\/+/g, '/')
      const key = `${lang}-${theme || 'light'}`
      configs[key] = {
        url: url,
        cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
      }
    })
  })
  return configs
})

// 当前显示的 PDF key
const currentPdfKey = computed(() => {
  const lang = locale.value === 'zh_CN' ? 'zh' : 'en'
  const theme = currentTheme.value.type === 'dark' ? 'dark' : 'light'
  return `${lang}-${theme}`
})

// PDF 加载状态
const isPdfLoading = ref(false)
// 每个 PDF 的页数缓存
const pdfPagesCache = ref({}) // { 'zh-light': 10, 'zh-dark': 10, ... }
// 每个 PDF 的页面引用缓存
const pdfPageRefsCache = ref({}) // { 'zh-light': Map(), 'zh-dark': Map(), ... }
// 每个 PDF 的渲染 key
const pdfRenderKeys = ref({}) // { 'zh-light': 0, 'zh-dark': 0, ... }

const currentPdfPage = ref(1)
const totalPdfPages = computed(() => {
  return pdfPagesCache.value[currentPdfKey.value] || 0
})
const inputPdfPage = ref(1)
const zoomScale = ref(1.0)
const pagesPerRow = ref(1) // 每行显示的页数
const pdfViewMode = ref('pointer') // 'pointer' | 'hand'
const pdfScrollbarRef = shallowRef(null)

// 获取当前显示的 PDF 的容器元素
const getCurrentPdfContainer = () => {
  if (!pdfScrollbarRef.value) return null
  const scrollbarEl = pdfScrollbarRef.value.$el
  const scrollbarWrap = scrollbarEl?.querySelector('.el-scrollbar__wrap')
  if (!scrollbarWrap) return null
  
  // 查找当前显示的 PDF 容器（通过 data-pdf-key 或 v-show）
  const currentKey = currentPdfKey.value
  const pdfWrapper = scrollbarWrap.querySelector(`[data-pdf-key="${currentKey}"]`)?.closest('.pdf-pages-wrapper')
  return pdfWrapper ? {
    wrapper: pdfWrapper,
    container: pdfWrapper.querySelector('.pdf-pages-container')
  } : null
}

// 存储每个页面的DOM引用（已废弃，改用 pdfPageRefsCache）

// PDF 渲染分辨率倍数
const PDF_RENDER_SCALE = 2.5

// 标志：是否正在自动更新页码（避免触发跳转）
let isAutoUpdatingPage = false

// 控制台输出
const consoleOutput = ref([])


// 初始化 Monaco 编辑器
const initEditor = async () => {
  if (!editorEl.value) return
  
  await nextTick()
  
  try {
    // 注册 LaTeX 语言支持
    registerLatexLanguage()
    
    const isDark = currentTheme.value.type === 'dark'
    // 确保 t 函数正确工作，传入完整的 i18n 实例
    const latexContent = getExampleLatex(t, locale.value, isDark)
    // 调试：检查翻译是否正确
    if (process.env.NODE_ENV === 'development') {
      console.log('LaTeX Content Preview:', latexContent.substring(0, 200))
      console.log('Translation test:', t('mock.latexEditor.exampleLatexContent.title'))
    }
    
    editor = monaco.editor.create(editorEl.value, {
      value: latexContent,
      language: 'latex', // 使用 LaTeX 语言，支持语法高亮
      theme: isDark ? 'vs-dark' : 'vs',
      readOnly: true,
      automaticLayout: true,
      fontSize: 14,
      wordWrap: 'on',
      lineNumbers: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false
    })
  } catch (error) {
    console.error('初始化 Monaco 编辑器失败:', error)
  }
}

// 同步编辑器内容（语言或主题切换时）
const syncEditorContent = () => {
  if (!editor) return
  const isDark = currentTheme.value.type === 'dark'
  const latexContent = getExampleLatex(t, locale.value, isDark)
  editor.setValue(latexContent)
}

// 计算最优缩放比例
function calculateOptimalScale(baseScale) {
  const rounded = Math.round(baseScale * 10) / 10
  return Math.max(0.2, Math.min(5, rounded))
}

// 容器样式（使用 CSS transform 实现缩放，保持原始 DPI）
const pdfContainerStyle = computed(() => {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${pagesPerRow.value}, 1fr)`,
    gap: '20px',
    gridAutoRows: 'min-content',
    justifyItems: 'start'
  }
})

// 包装器大小
const pdfWrapperHeight = ref('auto')
const pdfWrapperWidth = ref('auto')

// 更新包装器大小（使用当前 PDF 的页面引用）
const updateWrapperSize = () => {
  const container = getCurrentPdfContainer()
  const pageRefs = getCurrentPageRefs()
  const pages = totalPdfPages.value
  
  if (pages === 0 || !container) return
  
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        let containerHeight = 0
        let containerWidth = 0
        
        // 方法1：优先使用页面引用计算
        if (pageRefs.size > 0 && pages > 0) {
          const columns = pagesPerRow.value
          const rows = Math.ceil(pages / columns)
          
          const firstPageEl = pageRefs.get(1)
          if (firstPageEl) {
            const pageWidth = firstPageEl.offsetWidth
            const pageHeight = firstPageEl.offsetHeight
            const gap = 20
            const padding = 40
            
            containerWidth = columns * pageWidth + (columns - 1) * gap + padding
            containerHeight = rows * pageHeight + (rows - 1) * gap + padding
          }
        }
        
        // 方法2：使用容器的实际尺寸
        if ((containerHeight === 0 || containerWidth === 0) && container.container) {
          containerHeight = container.container.scrollHeight
          containerWidth = container.container.scrollWidth
        }
        
        if (containerHeight > 0 && containerWidth > 0) {
          const scaleFactor = zoomScale.value / PDF_RENDER_SCALE
          pdfWrapperHeight.value = containerHeight * scaleFactor
          pdfWrapperWidth.value = containerWidth * scaleFactor
        } else {
          pdfWrapperHeight.value = 'auto'
          pdfWrapperWidth.value = 'auto'
        }
      })
    })
  })
}

// 包装器样式
const pdfWrapperStyle = computed(() => {
  return {
    position: 'relative',
    height: typeof pdfWrapperHeight.value === 'number' ? `${pdfWrapperHeight.value}px` : pdfWrapperHeight.value,
    width: typeof pdfWrapperWidth.value === 'number' ? `${pdfWrapperWidth.value}px` : pdfWrapperWidth.value,
    display: 'block'
  }
})

// 设置页面DOM引用（支持多个 PDF）
function setPageRef(el, pageNum, pdfKey) {
  if (!pdfPageRefsCache.value[pdfKey]) {
    pdfPageRefsCache.value[pdfKey] = new Map()
  }
  const pageRefs = pdfPageRefsCache.value[pdfKey]
  if (el && el instanceof HTMLElement) {
    pageRefs.set(pageNum, el)
  } else if (el === null) {
    pageRefs.delete(pageNum)
  }
}

// 获取当前 PDF 的页面引用
const getCurrentPageRefs = () => {
  return pdfPageRefsCache.value[currentPdfKey.value] || new Map()
}

// 处理 PDF 总页数事件（支持多个 PDF）
function handleNumPages(numPages, pdfKey) {
  if (!pdfPagesCache.value[pdfKey] || pdfPagesCache.value[pdfKey] !== numPages) {
    pdfPagesCache.value[pdfKey] = numPages
    // 初始化渲染 key
    if (!pdfRenderKeys.value[pdfKey]) {
      pdfRenderKeys.value[pdfKey] = 0
    }
    // 如果是当前显示的 PDF，更新页码输入框的最大值
    if (pdfKey === currentPdfKey.value) {
      nextTick(() => {
        updateWrapperSize()
        autoFitPdfToContainer()
      })
    }
  }
}

// 处理 PDF 加载完成事件（支持多个 PDF）
function handlePdfLoaded(pdf, pdfKey) {
  if (pdf && pdf.numPages) {
    pdfPagesCache.value[pdfKey] = pdf.numPages
  }
  // 无论是否显示，都执行适应容器大小，确保PDF在显示前已经适配好
  if (pdfKey === currentPdfKey.value) {
    nextTick(() => {
      // 立即适配，确保PDF尺寸正确
      autoFitPdfToContainer()
      setTimeout(() => {
        updateWrapperSize()
        // 再次适配，确保尺寸稳定
        autoFitPdfToContainer()
      }, 100)
    })
  }
}

// 处理 PDF 渲染错误（支持多个 PDF）
function handlePdfError(error, pageNum, pdfKey) {
  // 静默处理错误，避免控制台污染
  console.warn('PDF 渲染错误', { pdfKey, pageNum, error })
}

// 滚动到指定页面
async function scrollToPage(pageNumber) {
  await nextTick()
  const pageRefs = getCurrentPageRefs()
  const pageElement = pageRefs.get(pageNumber)
  if (pageElement && pdfScrollbarRef.value) {
    const scrollbarEl = pdfScrollbarRef.value.$el
    const scrollbarWrap = scrollbarEl?.querySelector('.el-scrollbar__wrap')
    if (scrollbarWrap && pageElement) {
      const containerRect = scrollbarWrap.getBoundingClientRect()
      const pageRect = pageElement.getBoundingClientRect()
      
      const scrollTop = scrollbarWrap.scrollTop
      const pageTopInScrollContent = scrollTop + pageRect.top - containerRect.top
      const viewportHeight = containerRect.height
      const pageHeight = pageRect.height
      const targetScrollTop = pageTopInScrollContent - (viewportHeight - pageHeight) / 2
      
      const scrollLeft = scrollbarWrap.scrollLeft
      const pageLeftInScrollContent = scrollLeft + pageRect.left - containerRect.left
      const viewportWidth = containerRect.width
      const pageWidth = pageRect.width
      const targetScrollLeft = pageLeftInScrollContent - (viewportWidth - pageWidth) / 2
      
      scrollbarWrap.scrollTo({
        top: Math.max(0, targetScrollTop),
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth'
      })
    }
  }
}

// 检测当前视口显示的页面
function detectCurrentPage() {
  if (!pdfScrollbarRef.value || totalPdfPages.value === 0) {
    return
  }
  
  const scrollbarEl = pdfScrollbarRef.value.$el
  const scrollbarWrap = scrollbarEl?.querySelector('.el-scrollbar__wrap')
  if (!scrollbarWrap) return
  
  const pageRefs = getCurrentPageRefs()
  const containerRect = scrollbarWrap.getBoundingClientRect()
  const viewportCenterX = containerRect.left + containerRect.width / 2
  const viewportCenterY = containerRect.top + containerRect.height / 2
  
  let currentPage = 1
  let minDistance = Infinity
  
  for (let pageNum = 1; pageNum <= totalPdfPages.value; pageNum++) {
    const pageElement = pageRefs.get(pageNum)
    if (!pageElement) continue
    
    const pageRect = pageElement.getBoundingClientRect()
    const pageCenterX = pageRect.left + pageRect.width / 2
    const pageCenterY = pageRect.top + pageRect.height / 2
    
    const distanceX = Math.abs(viewportCenterX - pageCenterX)
    const distanceY = Math.abs(viewportCenterY - pageCenterY)
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
    
    const toleranceX = pageRect.width / 2
    const toleranceY = pageRect.height / 2
    const isInCenter = distanceX <= toleranceX && distanceY <= toleranceY
    
    if (isInCenter) {
      if (distance < minDistance) {
        minDistance = distance
        currentPage = pageNum
      }
    } else if (minDistance === Infinity) {
      if (distance < minDistance) {
        minDistance = distance
        currentPage = pageNum
      }
    }
  }
  
  if (currentPage !== currentPdfPage.value) {
    isAutoUpdatingPage = true
    currentPdfPage.value = currentPage
    inputPdfPage.value = currentPage
    nextTick(() => {
      isAutoUpdatingPage = false
    })
  }
}

// 滚动事件处理（防抖）
const handleScrollDebounced = debounce(() => {
  detectCurrentPage()
}, 100)

// 监听滚动事件
function setupScrollListener() {
  if (!pdfScrollbarRef.value) return
  
  const scrollbarEl = pdfScrollbarRef.value.$el
  const scrollbarWrap = scrollbarEl?.querySelector('.el-scrollbar__wrap')
  if (scrollbarWrap) {
    scrollbarWrap.addEventListener('scroll', handleScrollDebounced, { passive: true })
  }
}

// 移除滚动监听器
function removeScrollListener() {
  if (!pdfScrollbarRef.value) return
  
  const scrollbarEl = pdfScrollbarRef.value.$el
  const scrollbarWrap = scrollbarEl?.querySelector('.el-scrollbar__wrap')
  if (scrollbarWrap) {
    scrollbarWrap.removeEventListener('scroll', handleScrollDebounced)
  }
}

// 加载 PDF（优先使用缓存）
async function loadPdf(url, preservePage = false) {
  if (!url || url.trim() === '') {
    loadedPdfUrl = null
    return false
  }
  
  // 如果当前已加载的 PDF 就是目标 URL，直接返回
  if (pdfDoc && loadedPdfUrl === url) {
    if (preservePage) {
      const savedPage = currentPdfPage.value
      const targetPage = Math.min(Math.max(savedPage, 1), totalPdfPages.value)
      currentPdfPage.value = targetPage
      inputPdfPage.value = targetPage
      await nextTick()
      scrollToPage(targetPage)
    }
    await nextTick()
    setupScrollListener()
    // 已加载的 PDF，也需要自动适应容器大小
    await nextTick()
    autoFitPdfToContainer()
    setTimeout(() => {
      updateWrapperSize()
    }, 100)
    return true
  }
  
  // 检查缓存
  const cached = pdfCache.get(url)
  if (cached) {
    // 使用缓存的 PDF
    pdfDoc = cached.doc
    totalPdfPages.value = cached.totalPages
    loadedPdfUrl = url
    
    // 更新 renderKey 以触发重新渲染
    cached.renderKey++
    pdfRenderKey.value = cached.renderKey
    
    const savedPage = preservePage ? currentPdfPage.value : 1
    const targetPage = preservePage ? Math.min(Math.max(savedPage, 1), cached.totalPages) : 1
    currentPdfPage.value = targetPage
    inputPdfPage.value = targetPage
    
    pageRefs.clear()
    
    await nextTick()
    scrollToPage(targetPage)
    
    await nextTick()
    setupScrollListener()
    
    // PDF 加载完成后，自动适应容器大小
    await nextTick()
    autoFitPdfToContainer()
    setTimeout(() => {
      updateWrapperSize()
    }, 100)
    
    return true
  }
  
  // 缓存中没有，需要加载
  const savedPage = preservePage ? currentPdfPage.value : 1
  
  try {
    // 配置 PDF.js 加载选项，支持中文字体渲染
    const loadingTask = createLoadingTask({
      url: url,
      cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
    })
    pdfDoc = await loadingTask.promise
    totalPdfPages.value = pdfDoc.numPages
    
    // 存入缓存
    pdfCache.set(url, {
      doc: pdfDoc,
      totalPages: pdfDoc.numPages,
      renderKey: 0
    })
    
    loadedPdfUrl = url
    
    const targetPage = preservePage ? Math.min(Math.max(savedPage, 1), pdfDoc.numPages) : 1
    currentPdfPage.value = targetPage
    inputPdfPage.value = targetPage
    
    const cached = pdfCache.get(url)
    cached.renderKey++
    pdfRenderKey.value = cached.renderKey
    pageRefs.clear()
    
    await nextTick()
    scrollToPage(targetPage)
    
    await nextTick()
    setupScrollListener()
    
    // PDF 加载完成后，自动适应容器大小
    await nextTick()
    autoFitPdfToContainer()
    setTimeout(() => {
      updateWrapperSize()
    }, 100)
    
    return true
  } catch (error) {
    // 静默处理错误，避免控制台污染
    const errorMessage = error?.message || String(error)
    const isFileNotFound = 
      error?.name === 'ResponseException' || 
      error?.status === 0 ||
      (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('missing pdf'))
    
    if (!isFileNotFound) {
      console.warn('加载 PDF 失败', { url, error: errorMessage })
    }
    
    // 不清空 URL，允许重试
    loadedPdfUrl = null
    pdfDoc = null
    totalPdfPages.value = 0
    return false
  }
}

// 工具栏操作
const zoomIn = () => {
  if (!editor) return
  const currentFontSize = editor.getOption(monaco.editor.EditorOption.fontSize)
  editor.updateOptions({ fontSize: currentFontSize + 1 })
}

const zoomOut = () => {
  if (!editor) return
  const currentFontSize = editor.getOption(monaco.editor.EditorOption.fontSize)
  editor.updateOptions({ fontSize: currentFontSize - 1 })
}

const togglePdf = () => {
  showPdfPanel.value = !showPdfPanel.value
}

const toggleConsole = () => {
  showConsole.value = !showConsole.value
}

// 滚动控制台到底部
const scrollConsoleToBottom = () => {
  // 使用双重 nextTick 确保 DOM 已更新
  nextTick(() => {
    nextTick(() => {
      if (consolePanelRef.value) {
        // 使用 scrollHeight 确保滚动到最底部
        const scrollHeight = consolePanelRef.value.scrollHeight
        const clientHeight = consolePanelRef.value.clientHeight
        consolePanelRef.value.scrollTop = scrollHeight - clientHeight
      }
    })
  })
}

// 模拟编译
const compile = () => {
  showConsole.value = true
  consoleOutput.value = []
  
  // 在编译开始前，确保PDF已经加载并适配好尺寸
  // PDF始终在DOM中（v-show），所以可以在编译前就适配
  nextTick(() => {
    // 确保PDF已经渲染完成
    if (pdfScrollbarRef.value && totalPdfPages.value > 0) {
      autoFitPdfToContainer()
    }
  })
  
  // 开始编译，显示加载状态
  isPdfLoading.value = true
  
  const output = getExampleCompileOutput(t)
  const lines = output.stdout.split('\n')
  
  // 逐行显示输出（模拟实时输出，速度稍慢）
  lines.forEach((line, index) => {
    setTimeout(() => {
      consoleOutput.value.push({
        type: 'stdout',
        content: line
      })
      
      // 每次添加新行后都滚动到底部，确保始终显示最新内容
      scrollConsoleToBottom()
      
      // 最后一行输出后，直接隐藏加载状态，PDF已经适配好了
      if (index === lines.length - 1) {
        setTimeout(() => {
          isPdfLoading.value = false
          // 确保最后一行也滚动到底部
          scrollConsoleToBottom()
        }, 500) // 延迟 500ms 让用户看到编译完成
      }
    }, index * 80) // 从 50ms 改为 80ms，速度稍慢
  })
}

// 自动编译函数（用于首次切换到 LaTeX tab 时）
const autoCompile = () => {
  // 延迟一下，确保组件完全渲染
  setTimeout(() => {
    compile()
  }, 300)
}

// PDF 操作
const goPrevPage = () => {
  if (currentPdfPage.value > 1) {
    currentPdfPage.value--
    inputPdfPage.value = currentPdfPage.value
  }
}

const goNextPage = () => {
  if (currentPdfPage.value < totalPdfPages.value) {
    currentPdfPage.value++
    inputPdfPage.value = currentPdfPage.value
  }
}

const jumpToPage = () => {
  const page = Math.min(Math.max(inputPdfPage.value, 1), totalPdfPages.value)
  currentPdfPage.value = page
  inputPdfPage.value = page
}

// PDF 自动适应容器大小
const autoFitPdfToContainer = () => {
  const container = getCurrentPdfContainer()
  if (!container || !pdfScrollbarRef.value || totalPdfPages.value === 0) return
  
  nextTick(() => {
    if (!container || !pdfScrollbarRef.value) return
    
    requestAnimationFrame(() => {
      if (!container || !pdfScrollbarRef.value) return
      
      requestAnimationFrame(() => {
        if (!container || !pdfScrollbarRef.value) return
        
        const scrollbarEl = pdfScrollbarRef.value.$el
        const scrollbarWrap = scrollbarEl?.querySelector('.el-scrollbar__wrap')
        if (!scrollbarWrap) return
        
        const containerWidth = scrollbarWrap.clientWidth
        if (containerWidth <= 0) return
        
        // 获取第一页的宽度（所有页面尺寸相同）
        const pageRefs = getCurrentPageRefs()
        const firstPageEl = pageRefs.get(1)
        if (!firstPageEl) {
          // 如果页面还没渲染，延迟重试
          setTimeout(() => {
            autoFitPdfToContainer()
          }, 100)
          return
        }
        
        // 从 VuePdf 渲染的 canvas 获取实际渲染宽度（不考虑 CSS transform）
        // 查找 canvas 元素
        const canvas = firstPageEl.querySelector('canvas')
        if (!canvas) {
          // 如果 canvas 还没渲染，延迟重试
          setTimeout(() => {
            autoFitPdfToContainer()
          }, 100)
          return
        }
        
        // canvas 的实际宽度就是 PDF_RENDER_SCALE 倍数的原始宽度
        // canvas.width = PDF 原始宽度（以 CSS 像素为单位）× PDF_RENDER_SCALE
        // 但我们需要的是 CSS 像素宽度，所以用 canvas.offsetWidth 或 canvas.clientWidth
        const canvasWidth = canvas.clientWidth || canvas.offsetWidth
        if (canvasWidth <= 0) {
          setTimeout(() => {
            autoFitPdfToContainer()
          }, 100)
          return
        }
        
        // canvas 的 CSS 宽度 = PDF 原始宽度 × PDF_RENDER_SCALE
        // 所以 PDF 原始宽度 = canvasWidth / PDF_RENDER_SCALE
        const originalPageWidth = canvasWidth / PDF_RENDER_SCALE
        
        // 计算需要的缩放比例，使 PDF 宽度刚好占满容器（留出最小边距）
        const padding = 20 // 左右各 10px，留出一些边距
        const availableWidth = containerWidth - padding
        const targetScale = availableWidth / originalPageWidth
        
        // 应用缩放（zoomScale 是用户可见的缩放比例）
        const newZoomScale = Math.max(0.2, Math.min(5, targetScale))
        zoomScale.value = newZoomScale
        
        // 更新包装器大小
        nextTick(() => {
          updateWrapperSize()
          // 再次检查并微调，确保没有横向滚动条
          setTimeout(() => {
            const finalScrollbarWrap = scrollbarEl?.querySelector('.el-scrollbar__wrap')
            if (finalScrollbarWrap && firstPageEl) {
              const finalContainerWidth = finalScrollbarWrap.clientWidth
              // 重新获取当前显示的页面宽度（已经应用了新缩放）
              const finalPageWidth = firstPageEl.offsetWidth
              // 如果还有横向滚动条，微调缩放
              if (finalPageWidth > finalContainerWidth - 10) {
                const fineTuneScale = (finalContainerWidth - 10) / originalPageWidth
                zoomScale.value = Math.max(0.2, Math.min(5, fineTuneScale))
                nextTick(() => {
                  updateWrapperSize()
                })
              }
            }
          }, 100)
        })
      })
    })
  })
}

// 控制台 resize 功能
const startResizeConsole = (e) => {
  if (!showConsole.value || !editorConsoleContainerRef.value) return
  
  e.preventDefault()
  e.stopPropagation()
  
  isResizingConsole = true
  resizeStartY = e.clientY
  resizeStartHeight = consoleHeight.value
  
  document.addEventListener('mousemove', onResizingConsole)
  document.addEventListener('mouseup', stopResizeConsole)
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'row-resize'
}

const onResizingConsole = (e) => {
  if (!isResizingConsole || !editorConsoleContainerRef.value) return
  
  e.preventDefault()
  e.stopPropagation()
  
  const deltaY = resizeStartY - e.clientY // 向上为正，向下为负
  const newHeight = resizeStartHeight + deltaY
  
  const containerRect = editorConsoleContainerRef.value.getBoundingClientRect()
  const containerHeight = containerRect.height
  
  const minHeight = 100
  const maxHeight = Math.max(containerHeight * 0.8, minHeight)
  const clampedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight))
  
  if (clampedHeight >= minHeight && clampedHeight <= maxHeight) {
    consoleHeight.value = clampedHeight
  }
}

const stopResizeConsole = () => {
  if (!isResizingConsole) return
  
  isResizingConsole = false
  document.removeEventListener('mousemove', onResizingConsole)
  document.removeEventListener('mouseup', stopResizeConsole)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
  
  if (consoleHeight.value < 100) {
    consoleHeight.value = 200
  }
}

// 监听主题变化
watch(() => currentTheme.value.type, () => {
  if (editor) {
    const isDark = currentTheme.value.type === 'dark'
    monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs')
  }
})

// 监听页码变化，自动滚动到对应页面
watch(
  () => currentPdfPage.value,
  (newPage) => {
    if (!isAutoUpdatingPage) {
      scrollToPage(newPage)
    }
  }
)

// 监听 zoomScale 变化，更新布局
watch(
  () => zoomScale.value,
  () => {
    nextTick(() => {
      updateWrapperSize()
    })
  }
)

// 监听控制台输出变化，自动滚动到底部
watch(
  () => consoleOutput.value.length,
  () => {
    scrollConsoleToBottom()
  }
)

// 监听 PDF 页面数量变化，更新包装器大小并自动适应
watch(
  () => totalPdfPages.value,
  () => {
    nextTick(() => {
      updateWrapperSize()
      autoFitPdfToContainer()
    })
  }
)

// 监听当前 PDF key 变化，重新适应容器
watch(
  () => currentPdfKey.value,
  () => {
    nextTick(() => {
      updateWrapperSize()
      autoFitPdfToContainer()
    })
  }
)

// 监听语言切换
watch(
  () => locale.value,
  async () => {
    if (editor) {
      await nextTick()
      // 使用最新的 t 函数、locale 和主题获取内容
      const isDark = currentTheme.value.type === 'dark'
      const latexContent = getExampleLatex(t, locale.value, isDark)
      editor.setValue(latexContent)
      // 滚动到顶部
      editor.setScrollTop(0)
      
      // PDF 切换通过 currentPdfKey 自动完成（DOM 已预加载）
      await nextTick()
      // 重置到第一页
      currentPdfPage.value = 1
      inputPdfPage.value = 1
      await nextTick()
      scrollToPage(1)
      updateWrapperSize()
      autoFitPdfToContainer()
    }
  },
  { immediate: false }
)

// 监听主题切换
watch(
  () => currentTheme.value.type,
  async () => {
    if (editor) {
      await nextTick()
      // 主题切换时更新编辑器内容和 PDF
      const isDark = currentTheme.value.type === 'dark'
      const latexContent = getExampleLatex(t, locale.value, isDark)
      editor.setValue(latexContent)
      editor.setScrollTop(0)
      
      // PDF 切换通过 currentPdfKey 自动完成（DOM 已预加载）
      await nextTick()
      // 重置到第一页
      currentPdfPage.value = 1
      inputPdfPage.value = 1
      await nextTick()
      scrollToPage(1)
      updateWrapperSize()
      autoFitPdfToContainer()
    }
  },
  { immediate: false }
)

onMounted(async () => {
  await nextTick()
  initEditor()
  
  // DOM 级别的预加载：所有 PDF 的 DOM 都已经在模板中渲染，只需要初始化当前显示的
  // 初始化当前 PDF 的页码
  currentPdfPage.value = 1
  inputPdfPage.value = 1
  
  // 设置滚动监听器
  await nextTick()
  setupScrollListener()
  
  // 监听容器大小变化，自动适应 PDF
  // 只在用户调整浏览器窗口大小时适配，编译时PDF已经在DOM中并已适配好
  await nextTick()
  if (pdfScrollbarRef.value) {
    const scrollbarEl = pdfScrollbarRef.value.$el
    const scrollbarWrap = scrollbarEl?.querySelector('.el-scrollbar__wrap')
    if (scrollbarWrap) {
      // 初始适配，确保PDF已经渲染并适配好
      setTimeout(() => {
        autoFitPdfToContainer()
      }, 300)
      
      // 监听容器大小变化（用户调整浏览器窗口时）
      const resizeObserver = new ResizeObserver(() => {
        // 直接适配，不防抖，确保用户窗口变化时立即响应
        autoFitPdfToContainer()
      })
      resizeObserver.observe(scrollbarWrap)
      // 保存 observer 以便清理
      window._pdfResizeObserver = resizeObserver
    }
  }
  
  // 首次切换到 LaTeX tab 时，自动显示控制台并执行编译
  autoCompile()
})

// 如果使用了 keep-alive，组件激活时也自动编译
onActivated(() => {
  autoCompile()
})

onBeforeUnmount(() => {
  // 清理编辑器
  if (editor) {
    editor.dispose()
    editor = null
  }
  
  // 清理 resize 事件监听器
  if (isResizingConsole) {
    stopResizeConsole()
  }
  document.removeEventListener('mousemove', onResizingConsole)
  document.removeEventListener('mouseup', stopResizeConsole)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
  
  // 移除滚动监听器
  removeScrollListener()
  
  // 清理 ResizeObserver
  if (window._pdfResizeObserver) {
    window._pdfResizeObserver.disconnect()
    delete window._pdfResizeObserver
  }
  
  // 清理PDF页面引用缓存
  Object.values(pdfPageRefsCache.value).forEach(refs => {
    if (refs instanceof Map) {
      refs.clear()
    }
  })
  pdfPageRefsCache.value = {}
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

.latex-layout {
  display: flex;
  height: 100%;
  width: 100%;
}

.latex-main {
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
}

.latex-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.left-column {
  min-width: 360px;
  border-right: 1px solid var(--el-border-color-lighter);
  flex: 1 1 auto;
  overflow: hidden;
  position: relative;
}

.pdf-column {
  min-width: 400px;
  width: 50%;
  border-left: 1px solid var(--el-border-color-lighter);
  background-color: var(--el-bg-color-page);
  position: relative;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  gap: 8px;
  flex-shrink: 0;
}

.toolbar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.toolbar-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.editor-console-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: var(--el-bg-color-page);
}

.editor-wrapper {
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
}

.editor-wrapper.console-visible {
  flex: 1 1 auto;
  min-height: 0;
}

.editor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.console-resizer {
  height: 4px;
  cursor: row-resize;
  background: var(--el-border-color-lighter);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  transition: background-color 0.2s;
  user-select: none;
}

.console-resizer:hover {
  background: var(--el-color-primary);
  height: 6px;
}

.console-wrapper {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);
  border-top: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
}

.console-panel {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px;
  /* 使用与 Monaco 编辑器相同的等宽字体 */
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: v-bind('currentTheme.textColor');
  font-feature-settings: 'liga' off, 'calt' off;
  font-variant-ligatures: none;
  letter-spacing: 0;
}

.console-content {
  white-space: pre-wrap;
  word-break: break-all;
}

.console-line {
  line-height: 1.5;
}

.console-line-error {
  color: #f56c6c;
}

.pdf-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}

.pdf-toolbar__page {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  margin: 0 8px;
}

.pdf-toolbar__page input {
  width: 50px;
  text-align: center;
}

.pdf-toolbar__page-label {
  white-space: nowrap;
}

.pdf-toolbar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 5px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.pdf-toolbar-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.pdf-toolbar-icon.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pdf-preview-container {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--el-border-color-lighter);
}

.pdf-preview-container :deep(.el-scrollbar__wrap) {
  overflow-x: auto;
  overflow-y: auto;
}

/* 手型模式：隐藏滚动条 */
.pdf-preview-container.hand-mode :deep(.el-scrollbar__wrap) {
  overflow: hidden;
}

.pdf-preview-container.hand-mode :deep(.el-scrollbar__bar) {
  display: none;
}

/* 手型模式：设置光标 */
.pdf-preview-container.hand-mode .pdf-pages-wrapper {
  cursor: grab;
  user-select: none;
}

.pdf-preview-container.hand-mode .pdf-pages-wrapper:active {
  cursor: grabbing;
}

/* 指针模式：允许文本选择 */
.pdf-preview-container.pointer-mode .pdf-pages-wrapper {
  cursor: default;
  user-select: text;
}

/* 包装器：根据缩放比例动态调整大小 */
.pdf-pages-wrapper {
  position: relative;
  display: block;
  text-align: left;
}

.pdf-pages-container {
  padding: 20px;
  box-sizing: border-box;
  overflow: visible;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.pdf-page-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  /* 背景色根据主题动态设置，浅色主题用白色，暗色主题用深色 */
  background-color: v-bind('currentTheme.type === "dark" ? "#1e1e1e" : "#ffffff"');
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: fit-content;
  margin: 0;
  flex-shrink: 0;
}

.vue-pdf-wrapper {
  display: inline-block;
}

/* PDF 页面背景：根据主题动态设置 */
.pdf-page-wrapper :deep(.vue-pdf-main) {
  background-color: transparent;
}

.pdf-page-wrapper :deep(.vue-pdf) {
  background-color: transparent;
}

.pdf-page-wrapper :deep(.vue-pdf__wrapper) {
  background-color: transparent;
}

/* PDF页面canvas背景：根据主题动态设置 */
.pdf-page-wrapper :deep(canvas) {
  background-color: transparent;
  image-rendering: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 优化文本层渲染 */
.pdf-page-wrapper :deep(.textLayer) {
  opacity: 1;
  /* 确保中文字体正确显示 */
  font-family: 'SimSun', 'SimHei', 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', 'sans-serif', 'Arial Unicode MS', 'Arial';
  /* 确保文本层正确渲染 */
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 1;
  line-height: 1;
}

/* 确保 PDF 文本层中的 span 元素使用正确的字体 */
.pdf-page-wrapper :deep(.textLayer span) {
  font-family: 'SimSun', 'SimHei', 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', 'sans-serif', 'Arial Unicode MS', 'Arial';
  color: transparent;
  position: absolute;
  white-space: pre;
  cursor: text;
  transform-origin: 0% 0%;
}

.pdf-empty-text {
  color: #999;
  font-weight: normal;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  pointer-events: none;
  margin: 0;
  font-size: 1.1rem;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.pdf-loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.pdf-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.pdf-loading-text {
  margin: 0;
  font-size: 1rem;
  color: #999;
  user-select: none;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.pdf-loading-content .is-loading {
  animation: rotating 1s linear infinite;
  color: #999;
}
</style>

