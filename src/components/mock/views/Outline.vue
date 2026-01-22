<template>
  <div class="outline-page" :data-direction="direction">
    <div class="container">
      <!-- 大纲树容器 -->
      <vue-tree
        ref="treeRef"
        class="outline-tree-container"
        style="width: 100%; height: 100%; border: 1px solid gray; border-radius: 12px;"
        :style="{ backgroundColor: currentTheme.background }"
        :dataset="treeData"
        :config="treeConfig"
        :direction="direction"
        link-style="straight"
        @node-click="handleNodeClick"
        @wheel="handleWheelZoom"
      >
        <template #node="{ node }">
          <el-tooltip 
            :content="node.title || ''" 
            placement="top" 
            :disabled="!node.title || !isNodeTextTruncated(node.path)"
          >
            <div
              class="tree-node"
              :style="{ backgroundColor: currentTheme.outlineNode }"
            >
              <span class="tree-node-text" :ref="el => setTextElementRef(el, node.path)">{{ node.title }}</span>
            </div>
          </el-tooltip>
          <!-- 节点操作按钮 -->
          <el-tooltip content="编辑节点" placement="top">
            <el-button
              size="small"
              type="text"
              class="aero-btn"
              circle
              @click.stop="handleNodeButtonClick(node)"
              v-if="node.path !== 'dummy'"
            >
              <el-icon>
                <More />
              </el-icon>
            </el-button>
          </el-tooltip>
          <!-- 操作按钮组 -->
          <div v-if="dialogVisible[node.path]" class="aero-div node-edit-box" @click.stop @mousemove.stop @mousedown.stop @mouseup.stop>
            <div>
              <div class="button-group">
                <el-tooltip :content="direction === 'vertical' ? '左移' : '上移'" placement="top">
                  <el-button type="info" circle class="aero-btn" style="font-size: 12px; padding: 2px 6px" @click.stop>
                    <el-icon style="font-size: 14px">
                      <ArrowLeftBold v-if="direction === 'vertical'" />
                      <ArrowUpBold v-else />
                    </el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="添加子节点" placement="top">
                  <el-button type="success" circle class="aero-btn" style="font-size: 12px; padding: 2px 6px" @click.stop>
                    <el-icon style="font-size: 14px">
                      <Plus />
                    </el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="编辑内容" placement="top">
                  <el-button type="primary" circle class="aero-btn" style="font-size: 12px; padding: 2px 6px" @click.stop>
                    <el-icon style="font-size: 14px">
                      <Edit />
                    </el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button type="danger" circle class="aero-btn" style="font-size: 12px; padding: 2px 6px" @click.stop>
                    <el-icon style="font-size: 14px">
                      <Delete />
                    </el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip :content="direction === 'vertical' ? '右移' : '下移'" placement="top">
                  <el-button type="info" circle class="aero-btn" style="font-size: 12px; padding: 2px 6px" @click.stop>
                    <el-icon style="font-size: 14px">
                      <ArrowRightBold v-if="direction === 'vertical'" />
                      <ArrowDownBold v-else />
                    </el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
          </div>
        </template>
      </vue-tree>

      <!-- 底部按钮组 -->
      <div class="bottom-menu aero-div">
        <el-tooltip content="放大" placement="top">
          <el-button type="success" circle @click="zoomIn">
            <el-icon>
              <Plus />
            </el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="缩小" placement="top">
          <el-button type="warning" circle @click="zoomOut">
            <el-icon>
              <Minus />
            </el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="重置" placement="top">
          <el-button type="info" circle @click="resetScale">
            <el-icon>
              <Refresh />
            </el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Minus, Refresh, More, Edit, Delete, ArrowLeftBold, ArrowRightBold, ArrowUpBold, ArrowDownBold } from '@element-plus/icons-vue'
import { useMockTheme } from '../utils/theme'
import { getExampleOutlineTree } from '../utils/exampleContent'
import '../assets/aero-div.css'
import '../assets/aero-btn.css'

const { t } = useI18n()
const { currentTheme } = useMockTheme()

// 树实例引用
const treeRef = ref(null)

// 节点操作对话框显示状态
const dialogVisible = ref({})

// 存储每个节点的文本元素引用，用于检查文本是否被截断
const textElementRefs = new Map()
// 存储每个节点的截断状态（响应式）
const textTruncatedState = reactive({})

// 设置文本元素引用并检查截断状态
const setTextElementRef = (el, nodePath) => {
  if (el && el instanceof HTMLElement) {
    textElementRefs.set(nodePath, el)
    // 检查文本是否被截断
    nextTick(() => {
      const isTruncated = el.scrollWidth > el.clientWidth || 
                         el.scrollHeight > el.clientHeight
      textTruncatedState[nodePath] = isTruncated
    })
  } else if (!el) {
    textElementRefs.delete(nodePath)
    delete textTruncatedState[nodePath]
  }
}

// 检查节点的文本是否被截断
const isNodeTextTruncated = (nodePath) => {
  return textTruncatedState[nodePath] === true
}

// 使用示例大纲树数据 - 使用 i18n
const treeData = computed(() => getExampleOutlineTree(t))

// 树配置
const direction = ref('vertical')
const treeConfig = reactive({
  nodeWidth: 180,
  nodeHeight: 50,
  levelHeight: 200,
  layout: direction.value,
})

// 缩放限制：最小30%，最大200%
const MIN_SCALE = 0.3
const MAX_SCALE = 2.0
// 缩放步长：每次缩放10%
const ZOOM_STEP = 0.1

// 维护当前的缩放比例
const currentScale = ref(1.0)

// 处理节点点击
const handleNodeClick = (node) => {
  console.log('点击节点:', node)
}

// 处理节点按钮点击
const handleNodeButtonClick = (node) => {
  // 显示/隐藏操作框
  if (dialogVisible.value[node.path] != null) {
    dialogVisible.value[node.path] = !dialogVisible.value[node.path]
  } else {
    dialogVisible.value[node.path] = true
  }

  // 一次只能打开一个操作框，所以关闭其他操作框
  for (let key in dialogVisible.value) {
    if (key !== node.path) {
      dialogVisible.value[key] = false
    }
  }
}

// 缩放功能
const zoomIn = () => {
  if (currentScale.value >= MAX_SCALE) {
    return // 已达到最大缩放，不执行
  }
  // 计算新的缩放比例，但不超过最大值
  const newScale = Math.min(currentScale.value + ZOOM_STEP, MAX_SCALE)
  currentScale.value = newScale
  treeRef.value?.zoomIn()
  // 缩放后重新检查文本截断状态
  nextTick(() => {
    recheckTextTruncation()
  })
}

const zoomOut = () => {
  if (currentScale.value <= MIN_SCALE) {
    return // 已达到最小缩放，不执行
  }
  // 计算新的缩放比例，但不低于最小值
  const newScale = Math.max(currentScale.value - ZOOM_STEP, MIN_SCALE)
  currentScale.value = newScale
  treeRef.value?.zoomOut()
  // 缩放后重新检查文本截断状态
  nextTick(() => {
    recheckTextTruncation()
  })
}

const resetScale = () => {
  currentScale.value = 1.0
  treeRef.value?.restoreScale()
  // 重置后重新检查文本截断状态
  nextTick(() => {
    recheckTextTruncation()
  })
}

// 以光标位置为中心的缩放
const zoomAtPoint = (deltaY, clientX, clientY) => {
  if (!treeRef.value) return
  
  // 获取 vue-tree 的 DOM 元素
  const treeElement = document.querySelector('.outline-tree-container')
  if (!treeElement || !(treeElement instanceof Element)) return
  
  // 查找内部的滚动容器
  let scrollContainer = null
  
  // 尝试多种方式找到滚动容器
  const possibleContainers = [
    treeElement.querySelector('svg')?.parentElement,
    treeElement.querySelector('[style*="overflow"]'),
    treeElement.querySelector('.vue-tree'),
    treeElement
  ]
  
  for (const container of possibleContainers) {
    if (container && container instanceof Element && (container.scrollHeight > container.clientHeight || container.scrollWidth > container.clientWidth)) {
      scrollContainer = container
      break
    }
  }
  
  if (!scrollContainer || !(scrollContainer instanceof Element)) {
    scrollContainer = treeElement
  }
  
  // 获取光标相对于滚动容器的位置
  try {
    const rect = scrollContainer.getBoundingClientRect()
    const pointX = clientX - rect.left
    const pointY = clientY - rect.top
    
    // 获取当前滚动位置
    const scrollLeft = scrollContainer.scrollLeft || 0
    const scrollTop = scrollContainer.scrollTop || 0
    
    // 计算光标在内容中的绝对位置（考虑滚动偏移）
    const contentX = scrollLeft + pointX
    const contentY = scrollTop + pointY
    
    // 确定缩放方向（向上滚动 = 放大，向下滚动 = 缩小）
    const isZoomIn = deltaY < 0
    
    // 检查缩放限制
    if (isZoomIn && currentScale.value >= MAX_SCALE) {
      return // 已达到最大缩放，不执行
    }
    if (!isZoomIn && currentScale.value <= MIN_SCALE) {
      return // 已达到最小缩放，不执行
    }
    
    // 执行缩放
    if (isZoomIn) {
      zoomIn()
    } else {
      zoomOut()
    }
    
    // 等待 DOM 更新后调整滚动位置
    nextTick(() => {
      requestAnimationFrame(() => {
        if (!scrollContainer || !(scrollContainer instanceof Element)) return
        try {
          // 重新获取容器（可能因为缩放而改变）
          const newRect = scrollContainer.getBoundingClientRect()
          const newPointX = clientX - newRect.left
          const newPointY = clientY - newRect.top
          
          // 计算新的滚动位置，使光标位置在内容中保持相对不变
          const newScrollLeft = contentX - newPointX
          const newScrollTop = contentY - newPointY
          
          // 设置新的滚动位置，确保不超出边界
          scrollContainer.scrollLeft = Math.max(0, Math.min(newScrollLeft, scrollContainer.scrollWidth - scrollContainer.clientWidth))
          scrollContainer.scrollTop = Math.max(0, Math.min(newScrollTop, scrollContainer.scrollHeight - scrollContainer.clientHeight))
        } catch (error) {
          console.warn('Failed to adjust scroll position after zoom:', error)
        }
      })
    })
  } catch (error) {
    console.warn('Failed to zoom at point:', error)
  }
}

// 处理滚轮缩放事件
const handleWheelZoom = (event) => {
  // 检查是否按下了 Ctrl 键（Windows/Linux）或 Meta 键（Mac）
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault() // 阻止默认的滚动行为
    event.stopPropagation() // 阻止事件冒泡
    
    // 以光标位置为中心进行缩放
    zoomAtPoint(event.deltaY, event.clientX, event.clientY)
  }
}

// 重新检查所有文本元素的截断状态（使用防抖避免频繁触发）
let recheckTextTruncationTimer = null
const recheckTextTruncation = () => {
  // 清除之前的定时器
  if (recheckTextTruncationTimer) {
    clearTimeout(recheckTextTruncationTimer)
  }
  // 使用防抖，延迟 200ms 执行，避免在缩放过程中频繁触发
  recheckTextTruncationTimer = setTimeout(() => {
    recheckTextTruncationTimer = null
    textElementRefs.forEach((el, nodePath) => {
      const isTruncated = el.scrollWidth > el.clientWidth || 
                         el.scrollHeight > el.clientHeight
      textTruncatedState[nodePath] = isTruncated
    })
  }, 200)
}

// 处理窗口大小改变，重新检查文本截断状态
const handleResize = () => {
  recheckTextTruncation()
}

// 组件挂载时添加调试日志
onMounted(() => {
  console.log('Outline 组件已挂载')
  console.log('treeData:', treeData.value)
  console.log('treeConfig:', treeConfig)
  console.log('currentTheme:', currentTheme.value)
  console.log('treeRef:', treeRef.value)
  
  // 等待 DOM 渲染完成后初始检查文本截断状态
  nextTick(() => {
    recheckTextTruncation()
  })
  
  // 添加窗口大小改变监听器
  window.addEventListener('resize', handleResize)
})

// 组件卸载时移除事件监听器并清理定时器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  // 清理定时器
  if (recheckTextTruncationTimer) {
    clearTimeout(recheckTextTruncationTimer)
    recheckTextTruncationTimer = null
  }
})
</script>

<style scoped>
.outline-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* 设置主题背景色 */
  background-color: v-bind('currentTheme.background');
  /* 创建新的层叠上下文，隔离渲染，防止影响其他组件 */
  isolation: isolate;
  /* 使用 containment 限制重绘范围 */
  contain: layout style;
}

.outline-page > .container {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  /* 使用 containment 限制重绘范围 */
  contain: layout style;
  /* 创建新的层叠上下文 */
  isolation: isolate;
}

.outline-tree-container {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  /* 使用严格的 CSS containment，限制重绘和重排范围，防止影响其他组件 */
  contain: strict;
  /* 创建新的层叠上下文，隔离渲染 */
  isolation: isolate;
  /* 使用 GPU 加速 */
  transform: translateZ(0);
  will-change: scroll-position;
}

.tree-node {
  margin-bottom: 12px;
  /* 增加底部间距 */
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 12px;
  /* 增加圆角，使其看起来像小tab */
  padding: 8px 16px;
  /* 增加内边距，使节点更大，更易点击 */
  margin: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  /* 添加过渡效果 */
  max-width: 200px;
  /* 限制最大宽度 */
  max-height: 60px;
  /* 限制最大高度，允许2-3行 */
  overflow: hidden;
  /* 隐藏溢出内容 */
  box-sizing: border-box;
  /* 包含 padding 在宽度计算中 */
  /* 添加边框，使其更像小tab */
  border: 1px solid v-bind('currentTheme.borderColor');
  /* 添加阴影，增强tab效果 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* 使用 containment 限制重绘范围 */
  contain: layout style paint;
  /* 创建新的层叠上下文 */
  isolation: isolate;
}

.tree-node-text {
  display: -webkit-box;
  /* 使用 webkit 的 box 模型以支持多行截断 */
  font-size: 14px;
  /* 设置默认字体大小 */
  color: v-bind('currentTheme.textColor');
  /* 设置文本颜色 - 使用主题文字颜色 */
  flex: 1;
  /* 占据剩余空间 */
  min-width: 0;
  /* 允许收缩 */
  overflow: hidden;
  /* 隐藏溢出内容 */
  text-overflow: ellipsis;
  /* 文本溢出时显示省略号 */
  word-break: break-word;
  /* 允许在单词内换行，处理长单词 */
  line-height: 1.4;
  /* 设置行高 */
  -webkit-line-clamp: 2;
  line-clamp: 2;
  /* 限制显示2行 */
  -webkit-box-orient: vertical;
  /* 垂直方向排列 */
}

.bottom-menu {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%) !important;
  align-items: center;
  display: flex;
  gap: 10px;
  z-index: 1000;
  padding: 6px 10px;
  border-radius: 12px;
  box-sizing: border-box;
  width: fit-content;
  /* 覆盖 aero-div 的 transform transition，防止 hover 时偏移 */
  transition: backdrop-filter 0.3s ease, box-shadow 0.3s ease !important;
}

.bottom-menu:hover {
  transform: translateX(-50%) !important;
}

.node-edit-box {
  display: flex;
  flex-direction: column;
  /* 垂直布局 */
  align-items: center;
  position: fixed;
  margin-top: 100%;
  width: fit-content;
  transition: width 0.8s ease, all 0.3s ease;
  z-index: 10;
  /* 确保覆盖其他元素 */
}

.button-group {
  display: flex;
  /* 水平布局 */
  justify-content: space-around;
  /* 按钮间隔均匀 */
  width: fit-content;
  transition: all 0.3s;
  /* 满宽布局 */
}
</style>
