// 丰富的示例文章内容 - 支持 i18n
// 接受 i18n 的 t 函数作为参数
export const getExampleMarkdown = (t) => {
  const tc = (key) => t(`mock.exampleContent.${key}`)
  
  return `# 🚀 ${tc('title')}

> **${tc('subtitle')}**

## 🏗️ ${tc('architectureTitle')}

${tc('architectureDesc')}

\`\`\`plantuml
@startuml
!theme plain
title MetaDoc System Architecture

' ===== Global Style =====
skinparam componentStyle rectangle
skinparam linetype ortho
skinparam shadowing true
skinparam roundcorner 10
skinparam defaultFontSize 10
skinparam packageStyle rectangle
skinparam BackgroundColor #FFFFFF
skinparam ArrowColor #666666

left to right direction

' ================= UI Layer =================
package "UI Layer" #E8F0FE {
  [MainWindow] as Main #D2E3FC
  [Editor] #D2E3FC
  [Preview] #D2E3FC
  [Outline] #D2E3FC
}

' ================= Logic Layer =================
package "Logic Layer" #EAF7F1 {
  [DocumentManager] as DocMgr #CDEFE0
  [ThemeManager] as ThemeMgr #CDEFE0
  [ExportManager] as ExportMgr #CDEFE0
}

' ================= AI Layer =================
package "AI Layer" #F2ECFD {
  [AIAssistant] as AI #D9CEF9
  [ContentGenerator] as Gen #D9CEF9
  [ProofreadService] as Proof #D9CEF9
  [LLMEngine] as LLM #C5B6F2
}

' ================= Render Layer =================
package "Render Layer" #E6FAF8 {
  [MarkdownRenderer] as MD #C8F1ED
  [ChartRenderer] as Chart #C8F1ED
  [MathRenderer] as Math #C8F1ED
}

' ================= Storage Layer =================
package "Storage Layer" #EFF3F8 {
  [LocalStorage] as Local #D6DFEB
  [FileSystem] as FS #D6DFEB
  [ConfigManager] as Config #D6DFEB
}

' ================= External =================
package "External" #FFF4E5 {
  [Vditor] #FFE2B8
  [Mermaid] #FFE2B8
  [PlantUML Server] as PUML #FFE2B8
}

' ================= Connections =================

' UI -> Logic
Main --> DocMgr
Editor --> DocMgr
Outline --> DocMgr
Main --> ThemeMgr
ExportMgr --> DocMgr

' UI -> AI
Editor --> AI
Editor --> Gen
Editor --> Proof

' Logic -> Storage
DocMgr --> Local
DocMgr --> FS
ThemeMgr --> Config

' AI -> LLM
AI --> LLM
Gen --> LLM
Proof --> LLM

' Render Flow
Editor --> MD
Preview --> MD
Preview --> Chart
Preview --> Math

' External deps
MD --> Vditor
Math --> Vditor
Chart --> Mermaid
Chart --> PUML

@enduml
\`\`\`

## ✨ ${tc('highlightsTitle')}

### 🎯 ${tc('intelligentTitle')}

${tc('intelligentDesc')}

${tc('intelligentFeatures')}
- ${tc('intelligentFeature1')}
- ${tc('intelligentFeature2')}
- ${tc('intelligentFeature3')}

### 📊 ${tc('visualizationTitle')}

${tc('visualizationDesc')}

#### ${tc('mermaidGanttTitle')}

${tc('mermaidGanttDesc')}

\`\`\`mermaid
gantt
    title MetaDoc 产品开发路线图
    dateFormat  YYYY-MM-DD
    section 核心功能
    文档编辑器开发           :done,    des1, 2024-01-01, 2024-03-31
    AI 智能助手集成          :done,    des2, 2024-02-01, 2024-04-30
    图表渲染引擎             :active,  des3, 2024-03-01, 2024-06-30
    section 高级功能
    多格式导出支持           :         des4, 2024-05-01, 2024-07-31
    云端同步功能             :         des5, 2024-06-01, 2024-08-31
    协作编辑功能             :         des6, 2024-07-01, 2024-09-30
    section 优化与发布
    性能优化                 :         des7, 2024-08-01, 2024-10-31
    用户测试与反馈           :         des8, 2024-09-01, 2024-11-30
    正式版发布               :milestone, m1, 2024-12-01, 0d
\`\`\`

#### ${tc('echartsTitle')}

${tc('echartsDesc')}

\`\`\`echarts
{
  "title": {
    "text": "MetaDoc 功能使用统计",
    "left": "center"
  },
  "tooltip": {
    "trigger": "item"
  },
  "legend": {
    "orient": "vertical",
    "left": "left"
  },
  "series": [
    {
      "name": "功能使用",
      "type": "pie",
      "radius": "50%",
      "data": [
        { "value": 35, "name": "文档编辑" },
        { "value": 25, "name": "AI 助手" },
        { "value": 20, "name": "图表绘制" },
        { "value": 15, "name": "数据可视化" },
        { "value": 5, "name": "其他功能" }
      ],
      "emphasis": {
        "itemStyle": {
          "shadowBlur": 10,
          "shadowOffsetX": 0,
          "shadowColor": "rgba(0, 0, 0, 0.5)"
        }
      }
    }
  ]
}
\`\`\`

#### ${tc('plantumlClassTitle')}

${tc('plantumlClassDesc')}

\`\`\`plantuml
@startuml
!theme cerulean-outline

' ===== layout =====
skinparam componentStyle rectangle
skinparam linetype ortho
skinparam shadowing true
skinparam roundcorner 10
skinparam defaultFontSize 10
skinparam packageStyle rectangle
skinparam BackgroundColor #FFFFFF
skinparam ArrowColor #666666

' ===== stereotype styles =====
skinparam class<<Core>> {
  BackgroundColor #FFE5E5
  BorderColor #333333
  FontColor #000000
}

skinparam class<<Manager>> {
  BackgroundColor #E5F3FF
  BorderColor #333333
  FontColor #000000
}

skinparam class<<Service>> {
  BackgroundColor #FFF5E5
  BorderColor #333333
  FontColor #000000
}

skinparam class<<Data>> {
  BackgroundColor #E5FFE5
  BorderColor #333333
  FontColor #000000
}

' ===== classes =====
class MetaDoc <<Core>> {
  -version : String
  -currentTheme : Theme
  -docManager : DocumentManager
  -aiAssistant : AIAssistant
  -visualizer : Visualizer
  --
  +openDocument(path : String)
  +saveDocument(path : String)
  +exportDocument(format : String)
  +switchTheme(theme : Theme)
}

class DocumentManager <<Manager>> {
  -documents : List<Document>
  -activeDocument : Document
  --
  +createDocument(format : String) : Document
  +openDocument(path : String)
  +saveDocument(doc : Document)
  +closeDocument(path : String)
}

class Editor <<Service>> {
  -content : String
  -format : String
  -vditor : VditorInstance
  --
  +edit()
  +preview()
  +setContent(content : String)
  +getContent() : String
}

class AIAssistant <<Service>> {
  -engine : LLMEngine
  -apiKey : String
  --
  +generateContent(prompt : String) : String
  +proofread(content : String)
  +suggestImprovements(content : String) : List<String>
}

class Visualizer <<Service>> {
  -renderer : ChartRenderer
  --
  +renderMermaid(code : String)
  +renderECharts(config : String)
  +renderPlantUML(code : String)
}

class Document <<Data>> {
  -path : String
  -format : String
  -content : String
  -outline : OutlineTree
  --
  +updateContent(content : String)
  +extractOutline() : OutlineTree
}

' ===== relations (orthogonal & compact) =====
MetaDoc *-- DocumentManager : manages
MetaDoc *-- AIAssistant : uses


DocumentManager *-- Document : contains
DocumentManager --> Editor : controls
Editor --> Document : edits
Document *-- Visualizer : uses
AIAssistant --> LLMEngine : uses
Visualizer --> ChartRenderer : uses

@enduml
\`\`\`

### 🎨 ${tc('textStylesTitle')}

${tc('textStylesDesc')}

#### ${tc('codeHighlightTitle')}

${tc('codeHighlightDesc')}

\`\`\`javascript
// MetaDoc 示例代码
function createDocument(title, content) {
  const doc = {
    title: title,
    content: content,
    format: 'markdown',
    createdAt: new Date()
  };
  return doc;
}

const myDoc = createDocument('我的文档', '# Hello MetaDoc');
console.log(myDoc);
\`\`\`

\`\`\`python
# Python 示例
def process_document(doc_path):
    """处理文档并提取关键信息"""
    with open(doc_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return {
        'word_count': len(content.split()),
        'lines': len(content.splitlines())
    }
\`\`\`

#### ${tc('latexTitle')}

${tc('latexDesc')}

${tc('latexInlineExample')}

${tc('latexBlockExample')}

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

${tc('latexComplexExample')}

$$
\\sum_{i=1}^{n} \\frac{1}{i^2} = \\frac{\\pi^2}{6}
$$

${tc('latexMatrixExample')}

$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
\\begin{pmatrix}
x \\\\
y
\\end{pmatrix}
=
\\begin{pmatrix}
ax + by \\\\
cx + dy
\\end{pmatrix}
$$

### 📚 ${tc('formatSupportTitle')}

${tc('formatSupportDesc')}

| 格式 | 用途 | 导出支持 |
|------|------|----------|
| ${tc('formatMarkdown')} | ${tc('formatMarkdownUse')} | ✅ HTML, PDF, DOCX |
| ${tc('formatLatex')} | ${tc('formatLatexUse')} | ✅ PDF, TEX |
| ${tc('formatText')} | ${tc('formatTextUse')} | ✅ TXT |

### 🔧 ${tc('featuresTitle')}

#### ${tc('feature1Title')}

${tc('feature1Desc')}

#### ${tc('feature2Title')}

${tc('feature2Desc')}

#### ${tc('feature3Title')}

${tc('feature3Desc')}

#### ${tc('feature4Title')}

${tc('feature4Desc')}

### 💼 ${tc('scenariosTitle')}

- ${tc('scenario1')}
- ${tc('scenario2')}
- ${tc('scenario3')}
- ${tc('scenario4')}

### 🎯 ${tc('whyTitle')}

${tc('why1')}
${tc('why2')}
${tc('why3')}
${tc('why4')}

### 📈 ${tc('futureTitle')}

${tc('futureDesc')}

${tc('future1')}
${tc('future2')}
${tc('future3')}
${tc('future4')}

---

> ${tc('footer')}

*${tc('footerNote')}*
`
}

// 大纲树数据（基于示例文章内容）- 支持 i18n
// 注意：vue3-tree-chart 需要 title_level 属性
export const getExampleOutlineTree = (t) => {
  const tc = (key) => t(`mock.exampleContent.outline.${key}`)
  
  return {
    title: tc('title'),
    title_level: 0,
    path: 'dummy',
    text: '',
    children: [
      {
        title: tc('architecture'),
        title_level: 1,
        path: '0.0',
        text: '',
        children: []
      },
      {
        title: tc('highlights'),
        title_level: 1,
        path: '0.1',
        text: '',
        children: [
          {
            title: tc('intelligent'),
            title_level: 2,
            path: '0.1.0',
            text: '',
            children: []
          },
          {
            title: tc('visualization'),
            title_level: 2,
            path: '0.1.1',
            text: '',
            children: [
              {
                title: tc('mermaidGantt'),
                title_level: 3,
                path: '0.1.1.0',
                text: '',
                children: []
              },
              {
                title: tc('echarts'),
                title_level: 3,
                path: '0.1.1.1',
                text: '',
                children: []
              },
              {
                title: tc('plantumlArchitecture'),
                title_level: 3,
                path: '0.1.1.2',
                text: '',
                children: []
              },
              {
                title: tc('plantumlClass'),
                title_level: 3,
                path: '0.1.1.3',
                text: '',
                children: []
              }
            ]
          },
          {
            title: tc('textStyles'),
            title_level: 2,
            path: '0.1.2',
            text: '',
            children: [
              {
                title: tc('codeHighlight'),
                title_level: 3,
                path: '0.1.2.0',
                text: '',
                children: []
              },
              {
                title: tc('latex'),
                title_level: 3,
                path: '0.1.2.1',
                text: '',
                children: []
              }
            ]
          }
        ]
      },
      {
        title: tc('formatSupport'),
        title_level: 1,
        path: '0.2',
        text: '',
        children: []
      },
      {
        title: tc('features'),
        title_level: 1,
        path: '0.3',
        text: '',
        children: [
          {
            title: tc('realtimePreview'),
            title_level: 2,
            path: '0.3.0',
            text: '',
            children: []
          },
          {
            title: tc('outlineNav'),
            title_level: 2,
            path: '0.3.1',
            text: '',
            children: []
          },
          {
            title: tc('multiTabs'),
            title_level: 2,
            path: '0.3.2',
            text: '',
            children: []
          },
          {
            title: tc('themeSwitch'),
            title_level: 2,
            path: '0.3.3',
            text: '',
            children: []
          }
        ]
      },
      {
        title: tc('scenarios'),
        title_level: 1,
        path: '0.4',
        text: '',
        children: []
      },
      {
        title: tc('why'),
        title_level: 1,
        path: '0.5',
        text: '',
        children: []
      },
      {
        title: tc('future'),
        title_level: 1,
        path: '0.6',
        text: '',
        children: []
      }
    ]
  }
}

// 注意：所有使用此文件的组件都应该使用 getExampleMarkdown(t) 和 getExampleOutlineTree(t)
// 传入正确的 i18n t 函数以确保多语言支持
