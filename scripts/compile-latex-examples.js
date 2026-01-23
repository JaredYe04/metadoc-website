/**
 * 编译示例 LaTeX 文件为 PDF
 * 使用 node-latex-compiler 编译中英文示例 LaTeX 文档
 */

import { compile } from 'node-latex-compiler'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getExampleLatex } from '../src/components/mock/utils/exampleLatexContent.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 简单的 i18n t 函数模拟（用于编译脚本）
const createTFunction = (locale) => {
  const translations = {
    zh_CN: {
      'mock.latexEditor.exampleLatexContent.title': 'MetaDoc LaTeX 示例文档',
      'mock.latexEditor.exampleLatexContent.author': 'MetaDoc 团队',
      'mock.latexEditor.exampleLatexContent.team': 'MetaDoc 团队',
      'mock.latexEditor.exampleLatexContent.theorem': '定理',
      'mock.latexEditor.exampleLatexContent.lemma': '引理',
      'mock.latexEditor.exampleLatexContent.proposition': '命题',
      'mock.latexEditor.exampleLatexContent.corollary': '推论',
      'mock.latexEditor.exampleLatexContent.definition': '定义',
      'mock.latexEditor.exampleLatexContent.example': '例子',
      'mock.latexEditor.exampleLatexContent.abstract': '本文档展示了 MetaDoc 对 LaTeX 的完整支持，包括复杂的数学公式、表格、图表、代码块等多种元素。LaTeX 是一种专业的文档排版系统，广泛用于学术论文、技术报告等场景。',
      'mock.latexEditor.exampleLatexContent.introductionTitle': '简介',
      'mock.latexEditor.exampleLatexContent.introductionContent': '本文档展示了 MetaDoc 对 LaTeX 的支持。LaTeX 是一种专业的文档排版系统，广泛用于学术论文、技术报告等场景。',
      'mock.latexEditor.exampleLatexContent.introductionContent2': '本文档将展示以下内容：',
      'mock.latexEditor.exampleLatexContent.item1': '复杂的数学公式和定理环境',
      'mock.latexEditor.exampleLatexContent.item2': '精美的表格和图表',
      'mock.latexEditor.exampleLatexContent.item3': '代码块和算法展示',
      'mock.latexEditor.exampleLatexContent.item4': '多列布局和浮动体',
      'mock.latexEditor.exampleLatexContent.item5': '交叉引用和超链接',
      'mock.latexEditor.exampleLatexContent.featuresTitle': '功能特性',
      'mock.latexEditor.exampleLatexContent.feature1Title': '数学公式支持',
      'mock.latexEditor.exampleLatexContent.feature1Content': 'MetaDoc 支持完整的 LaTeX 数学公式语法，包括行内公式和块级公式。例如，',
      'mock.latexEditor.exampleLatexContent.famousEquation': '著名的质能方程：',
      'mock.latexEditor.exampleLatexContent.einsteinTheorem': '爱因斯坦质能方程',
      'mock.latexEditor.exampleLatexContent.einsteinTheoremContent': '对于任何质量为 $m$ 的物体，其能量 $E$ 满足：',
      'mock.latexEditor.exampleLatexContent.einsteinTheoremNote': '其中 $c$ 是光速。',
      'mock.latexEditor.exampleLatexContent.feature2Title': '复杂数学表达式',
      'mock.latexEditor.exampleLatexContent.feature2Content': '支持复杂的数学表达式，如积分和级数：',
      'mock.latexEditor.exampleLatexContent.importantMathResults': '以下是一些重要的数学结果：',
      'mock.latexEditor.exampleLatexContent.gaussianIntegral': '高斯积分',
      'mock.latexEditor.exampleLatexContent.gaussianIntegralContent': '方程 \\eqref{eq:gaussian} 被称为高斯积分，在概率论和统计学中具有重要应用。',
      'mock.latexEditor.exampleLatexContent.feature3Title': '矩阵运算',
      'mock.latexEditor.exampleLatexContent.feature3Content': '支持矩阵的表示和运算：',
      'mock.latexEditor.exampleLatexContent.complexTableTitle': '复杂表格示例',
      'mock.latexEditor.exampleLatexContent.complexTableIntro': '表 \\ref{tab:example} 展示了一个复杂的表格示例：',
      'mock.latexEditor.exampleLatexContent.complexTableCaption': '复杂表格示例',
      'mock.latexEditor.exampleLatexContent.category': '类别',
      'mock.latexEditor.exampleLatexContent.year2023': '2023年',
      'mock.latexEditor.exampleLatexContent.year2024': '2024年',
      'mock.latexEditor.exampleLatexContent.count': '数量',
      'mock.latexEditor.exampleLatexContent.share': '占比',
      'mock.latexEditor.exampleLatexContent.categoryA': '类别A',
      'mock.latexEditor.exampleLatexContent.categoryB': '类别B',
      'mock.latexEditor.exampleLatexContent.categoryC': '类别C',
      'mock.latexEditor.exampleLatexContent.codeExampleTitle': '代码示例',
      'mock.latexEditor.exampleLatexContent.codeExampleIntro': '以下是一个 Python 代码示例：',
      'mock.latexEditor.exampleLatexContent.codeExampleCaption': '示例代码',
      'mock.latexEditor.exampleLatexContent.fibonacciDocstring': '计算斐波那契数列的第 n 项',
      'mock.latexEditor.exampleLatexContent.usageExample': '使用示例',
      'mock.latexEditor.exampleLatexContent.algorithmExampleTitle': '算法示例',
      'mock.latexEditor.exampleLatexContent.algorithmExampleIntro': '以下是一个算法伪代码示例：',
      'mock.latexEditor.exampleLatexContent.quicksortTitle': '快速排序算法',
      'mock.latexEditor.exampleLatexContent.algorithmRequire': '数组 $A[1..n]$',
      'mock.latexEditor.exampleLatexContent.algorithmEnsure': '排序后的数组',
      'mock.latexEditor.exampleLatexContent.algorithmStep1': '选择基准元素 $pivot = A[\\lfloor n/2 \\rfloor]$',
      'mock.latexEditor.exampleLatexContent.algorithmStep2': '将 $A$ 分为三部分：$L = \\{x | x < pivot\\}$, $E = \\{x | x = pivot\\}$, $R = \\{x | x > pivot\\}$',
      'mock.latexEditor.exampleLatexContent.graphicsExampleTitle': '图形绘制示例',
      'mock.latexEditor.exampleLatexContent.graphicsExampleIntro': '使用 TikZ 绘制的图形示例：',
      'mock.latexEditor.exampleLatexContent.tikzDrawAxes': '绘制坐标轴',
      'mock.latexEditor.exampleLatexContent.tikzDrawCurve1': '绘制函数曲线 y = x^2',
      'mock.latexEditor.exampleLatexContent.tikzDrawCurve2': '绘制函数曲线 y = sqrt(x)',
      'mock.latexEditor.exampleLatexContent.tikzMarkIntersection': '标记交点',
      'mock.latexEditor.exampleLatexContent.tikzAddGrid': '添加网格',
      'mock.latexEditor.exampleLatexContent.graphicsCaption': '函数图像示例：$y = x^2$ 和 $y = \\sqrt{x}$',
      'mock.latexEditor.exampleLatexContent.multicolTitle': '多列布局示例',
      'mock.latexEditor.exampleLatexContent.multicolIntro': '以下是一个多列布局的示例：',
      'mock.latexEditor.exampleLatexContent.column1Title': '第一列内容：',
      'mock.latexEditor.exampleLatexContent.column1Content': 'LaTeX 是一种专业的文档排版系统，由 Leslie Lamport 开发。它基于 TeX 排版系统，提供了更高级的文档结构命令。',
      'mock.latexEditor.exampleLatexContent.column2Title': '第二列内容：',
      'mock.latexEditor.exampleLatexContent.column2Content': 'MetaDoc 提供了完整的 LaTeX 支持，包括语法高亮、实时预览、自动补全等功能，让您能够高效地编写 LaTeX 文档。',
      'mock.latexEditor.exampleLatexContent.physicsFormulasTitle': '物理公式示例',
      'mock.latexEditor.exampleLatexContent.physicsFormulasIntro': '以下是一些物理公式示例：',
      'mock.latexEditor.exampleLatexContent.physicsFormulasExplanation': '方程 \\eqref{eq:newton} 是牛顿第二定律，方程 \\eqref{eq:energy} 是机械能公式，方程 \\eqref{eq:maxwell} 是麦克斯韦方程组之一。',
      'mock.latexEditor.exampleLatexContent.chemistryFormulasTitle': '化学公式示例',
      'mock.latexEditor.exampleLatexContent.chemistryFormulasIntro': '以下是一些化学公式示例：',
      'mock.latexEditor.exampleLatexContent.waterMolecule': '水分子',
      'mock.latexEditor.exampleLatexContent.carbonDioxide': '二氧化碳',
      'mock.latexEditor.exampleLatexContent.chemicalReaction': '化学反应',
      'mock.latexEditor.exampleLatexContent.equilibriumReaction': '平衡反应',
      'mock.latexEditor.exampleLatexContent.moreMathEnvironmentsTitle': '更多数学环境',
      'mock.latexEditor.exampleLatexContent.continuousFunction': '连续函数',
      'mock.latexEditor.exampleLatexContent.continuousFunctionDef': '设函数 $f: \\mathbb{R} \\to \\mathbb{R}$，如果对于任意 $x_0 \\in \\mathbb{R}$，都有',
      'mock.latexEditor.exampleLatexContent.continuousFunctionConclusion': '则称 $f$ 在 $x_0$ 处连续。',
      'mock.latexEditor.exampleLatexContent.meanValueTheorem': '中值定理',
      'mock.latexEditor.exampleLatexContent.meanValueTheoremContent': '如果函数 $f$ 在闭区间 $[a, b]$ 上连续，在开区间 $(a, b)$ 上可导，则存在 $c \\in (a, b)$，使得',
      'mock.latexEditor.exampleLatexContent.meanValueTheoremExample': '考虑函数 $f(x) = x^2$ 在区间 $[0, 2]$ 上。根据中值定理，存在 $c \\in (0, 2)$ 使得',
      'mock.latexEditor.exampleLatexContent.meanValueTheoremExampleConclusion': '因此 $c = 1$。',
      'mock.latexEditor.exampleLatexContent.conclusionTitle': '总结',
      'mock.latexEditor.exampleLatexContent.conclusionContent': 'MetaDoc 提供了完整的 LaTeX 编辑和编译支持，让您能够轻松创建专业的学术文档。本文档展示了：',
      'mock.latexEditor.exampleLatexContent.conclusionItem1': '定理环境的使用（见方程 \\eqref{eq:emc2} 和图 \\ref{fig:functions}）',
      'mock.latexEditor.exampleLatexContent.conclusionItem2': '复杂数学公式（见方程 \\eqref{eq:matrix} 和 \\eqref{eq:newton}）',
      'mock.latexEditor.exampleLatexContent.conclusionItem3': '表格和代码块的展示（见表 \\ref{tab:example} 和算法 \\ref{alg:quicksort}）',
      'mock.latexEditor.exampleLatexContent.conclusionItem4': '交叉引用和超链接功能',
      'mock.latexEditor.exampleLatexContent.conclusionItem5': 'TikZ 图形绘制',
      'mock.latexEditor.exampleLatexContent.conclusionItem6': '多列布局和浮动体',
      'mock.latexEditor.exampleLatexContent.conclusionItem7': '物理和化学公式',
      'mock.latexEditor.exampleLatexContent.corollaryContent': 'MetaDoc 提供了完整的 LaTeX 编辑和编译支持，让您能够轻松创建专业的学术文档。'
    },
    en_US: {
      'mock.latexEditor.exampleLatexContent.title': 'MetaDoc LaTeX Example Document',
      'mock.latexEditor.exampleLatexContent.author': 'MetaDoc Team',
      'mock.latexEditor.exampleLatexContent.team': 'MetaDoc Team',
      'mock.latexEditor.exampleLatexContent.theorem': 'Theorem',
      'mock.latexEditor.exampleLatexContent.lemma': 'Lemma',
      'mock.latexEditor.exampleLatexContent.proposition': 'Proposition',
      'mock.latexEditor.exampleLatexContent.corollary': 'Corollary',
      'mock.latexEditor.exampleLatexContent.definition': 'Definition',
      'mock.latexEditor.exampleLatexContent.example': 'Example',
      'mock.latexEditor.exampleLatexContent.abstract': 'This document demonstrates MetaDoc\'s complete support for LaTeX, including complex mathematical formulas, tables, charts, code blocks, and other elements. LaTeX is a professional document typesetting system widely used in academic papers, technical reports, and other scenarios.',
      'mock.latexEditor.exampleLatexContent.introductionTitle': 'Introduction',
      'mock.latexEditor.exampleLatexContent.introductionContent': 'This document demonstrates MetaDoc\'s support for LaTeX. LaTeX is a professional document typesetting system widely used in academic papers, technical reports, and other scenarios.',
      'mock.latexEditor.exampleLatexContent.introductionContent2': 'This document will demonstrate the following:',
      'mock.latexEditor.exampleLatexContent.item1': 'Complex mathematical formulas and theorem environments',
      'mock.latexEditor.exampleLatexContent.item2': 'Professional tables and charts',
      'mock.latexEditor.exampleLatexContent.item3': 'Code blocks and algorithm demonstrations',
      'mock.latexEditor.exampleLatexContent.item4': 'Multi-column layouts and floating objects',
      'mock.latexEditor.exampleLatexContent.item5': 'Cross-references and hyperlinks',
      'mock.latexEditor.exampleLatexContent.featuresTitle': 'Features',
      'mock.latexEditor.exampleLatexContent.feature1Title': 'Mathematical Formula Support',
      'mock.latexEditor.exampleLatexContent.feature1Content': 'MetaDoc supports complete LaTeX mathematical formula syntax, including inline and block-level formulas. For example,',
      'mock.latexEditor.exampleLatexContent.famousEquation': 'the famous mass-energy equation:',
      'mock.latexEditor.exampleLatexContent.einsteinTheorem': 'Einstein\'s Mass-Energy Equation',
      'mock.latexEditor.exampleLatexContent.einsteinTheoremContent': 'For any object with mass $m$, its energy $E$ satisfies:',
      'mock.latexEditor.exampleLatexContent.einsteinTheoremNote': 'where $c$ is the speed of light.',
      'mock.latexEditor.exampleLatexContent.feature2Title': 'Complex Mathematical Expressions',
      'mock.latexEditor.exampleLatexContent.feature2Content': 'Supports complex mathematical expressions, such as integrals and series:',
      'mock.latexEditor.exampleLatexContent.importantMathResults': 'The following are some important mathematical results:',
      'mock.latexEditor.exampleLatexContent.gaussianIntegral': 'Gaussian Integral',
      'mock.latexEditor.exampleLatexContent.gaussianIntegralContent': 'Equation \\eqref{eq:gaussian} is known as the Gaussian integral and has important applications in probability theory and statistics.',
      'mock.latexEditor.exampleLatexContent.feature3Title': 'Matrix Operations',
      'mock.latexEditor.exampleLatexContent.feature3Content': 'Supports matrix representation and operations:',
      'mock.latexEditor.exampleLatexContent.complexTableTitle': 'Complex Table Example',
      'mock.latexEditor.exampleLatexContent.complexTableIntro': 'Table \\ref{tab:example} demonstrates a complex table:',
      'mock.latexEditor.exampleLatexContent.complexTableCaption': 'Complex Table Example',
      'mock.latexEditor.exampleLatexContent.category': 'Category',
      'mock.latexEditor.exampleLatexContent.year2023': '2023',
      'mock.latexEditor.exampleLatexContent.year2024': '2024',
      'mock.latexEditor.exampleLatexContent.count': 'Count',
      'mock.latexEditor.exampleLatexContent.share': 'Share',
      'mock.latexEditor.exampleLatexContent.categoryA': 'Category A',
      'mock.latexEditor.exampleLatexContent.categoryB': 'Category B',
      'mock.latexEditor.exampleLatexContent.categoryC': 'Category C',
      'mock.latexEditor.exampleLatexContent.codeExampleTitle': 'Code Example',
      'mock.latexEditor.exampleLatexContent.codeExampleIntro': 'The following is a Python code example:',
      'mock.latexEditor.exampleLatexContent.codeExampleCaption': 'Example Code',
      'mock.latexEditor.exampleLatexContent.fibonacciDocstring': 'Calculate the nth Fibonacci number',
      'mock.latexEditor.exampleLatexContent.usageExample': 'Usage example',
      'mock.latexEditor.exampleLatexContent.algorithmExampleTitle': 'Algorithm Example',
      'mock.latexEditor.exampleLatexContent.algorithmExampleIntro': 'The following is an algorithmic pseudocode example:',
      'mock.latexEditor.exampleLatexContent.quicksortTitle': 'QuickSort Algorithm',
      'mock.latexEditor.exampleLatexContent.algorithmRequire': 'Array $A[1..n]$',
      'mock.latexEditor.exampleLatexContent.algorithmEnsure': 'Sorted array',
      'mock.latexEditor.exampleLatexContent.algorithmStep1': 'Choose pivot element $pivot = A[\\lfloor n/2 \\rfloor]$',
      'mock.latexEditor.exampleLatexContent.algorithmStep2': 'Partition $A$ into three parts: $L = \\{x | x < pivot\\}$, $E = \\{x | x = pivot\\}$, $R = \\{x | x > pivot\\}$',
      'mock.latexEditor.exampleLatexContent.graphicsExampleTitle': 'Graphics Drawing Example',
      'mock.latexEditor.exampleLatexContent.graphicsExampleIntro': 'A graphics example drawn using TikZ:',
      'mock.latexEditor.exampleLatexContent.tikzDrawAxes': 'Draw coordinate axes',
      'mock.latexEditor.exampleLatexContent.tikzDrawCurve1': 'Draw function curve y = x^2',
      'mock.latexEditor.exampleLatexContent.tikzDrawCurve2': 'Draw function curve y = sqrt(x)',
      'mock.latexEditor.exampleLatexContent.tikzMarkIntersection': 'Mark intersection point',
      'mock.latexEditor.exampleLatexContent.tikzAddGrid': 'Add grid',
      'mock.latexEditor.exampleLatexContent.graphicsCaption': 'Function Plot Example: $y = x^2$ and $y = \\sqrt{x}$',
      'mock.latexEditor.exampleLatexContent.multicolTitle': 'Multi-column Layout Example',
      'mock.latexEditor.exampleLatexContent.multicolIntro': 'Here is an example of a multi-column layout:',
      'mock.latexEditor.exampleLatexContent.column1Title': 'Content of Column One:',
      'mock.latexEditor.exampleLatexContent.column1Content': 'LaTeX is a professional document typesetting system developed by Leslie Lamport. It is based on the TeX typesetting system and provides higher-level commands for document structure.',
      'mock.latexEditor.exampleLatexContent.column2Title': 'Content of Column Two:',
      'mock.latexEditor.exampleLatexContent.column2Content': 'MetaDoc offers full LaTeX support, including syntax highlighting, real-time preview, and auto-completion, enabling you to efficiently write LaTeX documents.',
      'mock.latexEditor.exampleLatexContent.physicsFormulasTitle': 'Physics Formula Example',
      'mock.latexEditor.exampleLatexContent.physicsFormulasIntro': 'Here are some physics formula examples:',
      'mock.latexEditor.exampleLatexContent.physicsFormulasExplanation': 'Equation \\eqref{eq:newton} is Newton\'s second law, Equation \\eqref{eq:energy} is the mechanical energy formula, and Equation \\eqref{eq:maxwell} is one of Maxwell\'s equations.',
      'mock.latexEditor.exampleLatexContent.chemistryFormulasTitle': 'Chemistry Formula Example',
      'mock.latexEditor.exampleLatexContent.chemistryFormulasIntro': 'Here are some chemistry formula examples:',
      'mock.latexEditor.exampleLatexContent.waterMolecule': 'Water molecule',
      'mock.latexEditor.exampleLatexContent.carbonDioxide': 'Carbon dioxide',
      'mock.latexEditor.exampleLatexContent.chemicalReaction': 'Chemical reaction',
      'mock.latexEditor.exampleLatexContent.equilibriumReaction': 'Equilibrium reaction',
      'mock.latexEditor.exampleLatexContent.moreMathEnvironmentsTitle': 'More Math Environments',
      'mock.latexEditor.exampleLatexContent.continuousFunction': 'Continuous Function',
      'mock.latexEditor.exampleLatexContent.continuousFunctionDef': 'Let a function $f: \\mathbb{R} \\to \\mathbb{R}$. If for any $x_0 \\in \\mathbb{R}$, we have',
      'mock.latexEditor.exampleLatexContent.continuousFunctionConclusion': 'then $f$ is said to be continuous at $x_0$.',
      'mock.latexEditor.exampleLatexContent.meanValueTheorem': 'Mean Value Theorem',
      'mock.latexEditor.exampleLatexContent.meanValueTheoremContent': 'If a function $f$ is continuous on the closed interval $[a, b]$ and differentiable on the open interval $(a, b)$, then there exists some $c \\in (a, b)$ such that',
      'mock.latexEditor.exampleLatexContent.meanValueTheoremExample': 'Consider the function $f(x) = x^2$ on the interval $[0, 2]$. According to the Mean Value Theorem, there exists $c \\in (0, 2)$ such that',
      'mock.latexEditor.exampleLatexContent.meanValueTheoremExampleConclusion': 'Thus $c = 1$.',
      'mock.latexEditor.exampleLatexContent.conclusionTitle': 'Conclusion',
      'mock.latexEditor.exampleLatexContent.conclusionContent': 'MetaDoc provides complete LaTeX editing and compilation support, allowing you to easily create professional academic documents. This document demonstrates:',
      'mock.latexEditor.exampleLatexContent.conclusionItem1': 'Use of theorem environments (see Equation \\eqref{eq:emc2} and Figure \\ref{fig:functions})',
      'mock.latexEditor.exampleLatexContent.conclusionItem2': 'Complex mathematical formulas (see Equations \\eqref{eq:matrix} and \\eqref{eq:newton})',
      'mock.latexEditor.exampleLatexContent.conclusionItem3': 'Table and code block presentations (see Table \\ref{tab:example} and Algorithm \\ref{alg:quicksort})',
      'mock.latexEditor.exampleLatexContent.conclusionItem4': 'Cross-reference and hyperlink functionality',
      'mock.latexEditor.exampleLatexContent.conclusionItem5': 'TikZ graphics drawing',
      'mock.latexEditor.exampleLatexContent.conclusionItem6': 'Multi-column layout and floating objects',
      'mock.latexEditor.exampleLatexContent.conclusionItem7': 'Physics and chemistry formulas',
      'mock.latexEditor.exampleLatexContent.corollaryContent': 'MetaDoc provides complete LaTeX editing and compilation support, allowing you to easily create professional academic documents.'
    }
  }
  
  const t = (key) => {
    return translations[locale]?.[key] || key
  }
  
  return t
}

// 输出目录
const outputDir = path.join(__dirname, '../public/pdfs')
const ensureOutputDir = () => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
}

// 编译函数
async function compileLatex(tex, outputFile) {
  try {
    console.log(`正在编译: ${path.basename(outputFile)}...`)
    
    const result = await compile({
      tex: tex,
      compiler: 'xelatex', // 使用 xelatex 支持中文（xelatex 会自动嵌入字体）
      outputDir: path.dirname(outputFile),
      outputFile: outputFile,
      args: ['-interaction=nonstopmode', '-halt-on-error'],
      onStdout: (data) => {
        process.stdout.write(data)
      },
      onStderr: (data) => {
        process.stderr.write(data)
      }
    })
    
    if (result.status === 'success') {
      console.log(`✓ 编译成功: ${path.basename(outputFile)}`)
      return true
    } else {
      console.error(`✗ 编译失败: ${path.basename(outputFile)}`)
      console.error(`退出代码: ${result.exitCode}`)
      if (result.error) {
        console.error(`错误信息: ${result.error}`)
      }
      if (result.log) {
        console.error(`日志: ${result.log}`)
      }
      return false
    }
  } catch (error) {
    console.error(`✗ 编译出错: ${path.basename(outputFile)}`)
    console.error(error)
    return false
  }
}

// 主函数
async function main() {
  console.log('开始编译示例 LaTeX 文档...\n')
  
  // 确保输出目录存在
  ensureOutputDir()
  
  // 创建中文和英文的 t 函数
  const zhT = createTFunction('zh_CN')
  const enT = createTFunction('en_US')
  
  // 编译所有版本：中英文各两个（浅色和暗色）
  const tasks = [
    { name: '中文浅色版', latex: getExampleLatex(zhT, 'zh_CN', false), file: 'example-zh.pdf' },
    { name: '中文暗色版', latex: getExampleLatex(zhT, 'zh_CN', true), file: 'example-zh-dark.pdf' },
    { name: '英文浅色版', latex: getExampleLatex(enT, 'en_US', false), file: 'example-en.pdf' },
    { name: '英文暗色版', latex: getExampleLatex(enT, 'en_US', true), file: 'example-en-dark.pdf' }
  ]
  
  const results = []
  for (const task of tasks) {
    const outputFile = path.join(outputDir, task.file)
    const success = await compileLatex(task.latex, outputFile)
    results.push({ name: task.name, success })
    console.log('')
  }
  
  const allSuccess = results.every(r => r.success)
  if (allSuccess) {
    console.log('✓ 所有 PDF 编译完成！')
    console.log(`  共编译 ${results.length} 个 PDF 文件`)
    process.exit(0)
  } else {
    console.error('✗ 部分 PDF 编译失败')
    results.forEach(r => {
      if (!r.success) {
        console.error(`  - ${r.name} 编译失败`)
      }
    })
    process.exit(1)
  }
}

// 运行
main().catch((error) => {
  console.error('脚本执行失败:', error)
  process.exit(1)
})
