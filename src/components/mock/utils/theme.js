import { computed } from 'vue'
import { useDark } from '@vueuse/core'

// 简单的主题状态，用于 mock 组件
export const useMockTheme = () => {
  const isDark = useDark({
    storageKey: 'theme',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: ''
  })

  // 简化的主题配置
  const currentTheme = computed(() => {
    if (isDark.value) {
      return {
        type: 'dark',
        background: '#1e1e1e',
        background2nd: '#252526',
        textColor: '#cccccc',
        SideTextColor: '#cccccc',
        primaryColor: '#409eff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        outlineNode: mixColors('#409eff', '#4a4a4a', 0.6), // 暗色模式：节点背景色
        mdeditorClass: 'vditor-reset vditor-reset--dark',
        vditorTheme: 'dark',
        codeTheme: 'a11y-dark',
        // 图标路径
        FileIcon: new URL('../../../assets/icons/file-white.svg', import.meta.url).href,
        SettingIcon: new URL('../../../assets/icons/setting-white.svg', import.meta.url).href,
        RecentIcon: new URL('../../../assets/icons/recent-white.svg', import.meta.url).href,
        LanguageIcon: new URL('../../../assets/icons/language-white.svg', import.meta.url).href,
        KnowledgeIcon: new URL('../../../assets/icons/knowledge-white.svg', import.meta.url).href,
        FolderIcon: new URL('../../../assets/icons/folder-white.svg', import.meta.url).href,
        DebugIcon: new URL('../../../assets/icons/debug-white.svg', import.meta.url).href,
        MoreIcon: new URL('../../../assets/icons/more-white.svg', import.meta.url).href,
        AiLogo: new URL('../../../assets/icons/ai-white.svg', import.meta.url).href,
        HomeIcon: new URL('../../../assets/icons/home-white.svg', import.meta.url).href,
        EditorIcon: new URL('../../../assets/icons/editor-white.svg', import.meta.url).href,
        OutlineIcon: new URL('../../../assets/icons/outline-white.svg', import.meta.url).href,
        VisualIcon: new URL('../../../assets/icons/visual-white.svg', import.meta.url).href,
        AgentIcon: new URL('../../../assets/icons/agent-white.svg', import.meta.url).href,
        ProofreadIcon: new URL('../../../assets/icons/proofread-white.svg', import.meta.url).href,
        MetaIcon: new URL('../../../assets/icons/meta-white.svg', import.meta.url).href
      }
    } else {
      return {
        type: 'light',
        background: '#ffffff',
        background2nd: '#f5f5f5',
        textColor: '#333333',
        SideTextColor: '#333333',
        primaryColor: '#409eff',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        outlineNode: mixColors('#409eff', '#e8e8e8', 0.4), // 亮色模式：节点背景色
        mdeditorClass: 'vditor-reset',
        vditorTheme: 'light',
        codeTheme: 'github',
        // 图标路径
        FileIcon: new URL('../../../assets/icons/file-black.svg', import.meta.url).href,
        SettingIcon: new URL('../../../assets/icons/setting-black.svg', import.meta.url).href,
        RecentIcon: new URL('../../../assets/icons/recent-black.svg', import.meta.url).href,
        LanguageIcon: new URL('../../../assets/icons/language-black.svg', import.meta.url).href,
        KnowledgeIcon: new URL('../../../assets/icons/knowledge-black.svg', import.meta.url).href,
        FolderIcon: new URL('../../../assets/icons/folder-black.svg', import.meta.url).href,
        DebugIcon: new URL('../../../assets/icons/debug-black.svg', import.meta.url).href,
        MoreIcon: new URL('../../../assets/icons/more-black.svg', import.meta.url).href,
        AiLogo: new URL('../../../assets/icons/ai-black.svg', import.meta.url).href,
        HomeIcon: new URL('../../../assets/icons/home-black.svg', import.meta.url).href,
        EditorIcon: new URL('../../../assets/icons/editor-black.svg', import.meta.url).href,
        OutlineIcon: new URL('../../../assets/icons/outline-black.svg', import.meta.url).href,
        VisualIcon: new URL('../../../assets/icons/visual-black.svg', import.meta.url).href,
        AgentIcon: new URL('../../../assets/icons/agent-black.svg', import.meta.url).href,
        ProofreadIcon: new URL('../../../assets/icons/proofread-black.svg', import.meta.url).href,
        MetaIcon: new URL('../../../assets/icons/meta-black.svg', import.meta.url).href
      }
    }
  })

  return {
    isDark,
    currentTheme
  }
}

// 辅助函数：HEX转RGB
const hexToRgb = (hex) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

// 辅助函数：RGB转HEX
const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// 颜色混合函数 - 与真正的组件保持一致
export const mixColors = (color1, color2, weight) => {
  // 处理 rgb() 格式的颜色
  let c1, c2
  
  if (color1.startsWith('rgb')) {
    const match = color1.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      c1 = { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) }
    } else {
      c1 = hexToRgb('#ffffff')
    }
  } else {
    c1 = hexToRgb(color1)
  }
  
  if (color2.startsWith('rgb')) {
    const match = color2.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      c2 = { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) }
    } else {
      c2 = hexToRgb('#888888')
    }
  } else {
    c2 = hexToRgb(color2)
  }

  const r = Math.round(c1.r * (1 - weight) + c2.r * weight)
  const g = Math.round(c1.g * (1 - weight) + c2.g * weight)
  const b = Math.round(c1.b * (1 - weight) + c2.b * weight)

  return rgbToHex(r, g, b)
}

