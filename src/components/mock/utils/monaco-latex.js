/**
 * Monaco Editor LaTeX 语言支持
 * 为 Monaco 编辑器注册 LaTeX 语法高亮和自动补全
 */

import * as monaco from 'monaco-editor'

/**
 * LaTeX 常用命令列表
 */
const LATEX_COMMANDS = [
  // 文档结构
  'documentclass', 'usepackage', 'begin', 'end', 'document', 'input', 'include',
  // 章节命令
  'part', 'chapter', 'section', 'subsection', 'subsubsection', 'paragraph', 'subparagraph',
  // 文本格式
  'textbf', 'textit', 'textsl', 'texttt', 'textsc', 'textsf', 'textrm', 'textmd', 'textup',
  'emph', 'underline', 'sout', 'textcolor', 'colorbox', 'fcolorbox',
  // 字体大小
  'tiny', 'scriptsize', 'footnotesize', 'small', 'normalsize', 'large', 'Large', 'LARGE', 'huge', 'Huge',
  // 对齐和换行
  'centering', 'raggedright', 'raggedleft', 'newline', 'linebreak', 'pagebreak', 'newpage', 'clearpage',
  // 列表
  'itemize', 'enumerate', 'description', 'item',
  // 表格
  'table', 'tabular', 'hline', 'cline', 'multicolumn', 'multirow',
  // 图片和浮动体
  'includegraphics', 'figure', 'caption', 'label', 'ref', 'pageref',
  // 数学环境
  'equation', 'align', 'alignat', 'gather', 'multline', 'eqnarray',
  'math', 'displaymath', 'equation*', 'align*', 'gather*',
  // 数学命令
  'frac', 'sqrt', 'sum', 'prod', 'int', 'oint', 'iint', 'iiint',
  'lim', 'sup', 'inf', 'max', 'min', 'det', 'exp', 'log', 'ln', 'sin', 'cos', 'tan',
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
  'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma', 'tau', 'phi', 'psi', 'omega',
  'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Phi', 'Psi', 'Omega',
  'cdot', 'cdots', 'ldots', 'pm', 'mp', 'times', 'div', 'leq', 'geq', 'neq',
]

/**
 * LaTeX 自动补全提供器
 */
function createLatexCompletionProvider() {
  return {
    provideCompletionItems: (model, position) => {
      const lineText = model.getLineContent(position.lineNumber)
      const textUntilPosition = lineText.substring(0, position.column - 1)
      
      // 检查是否在输入命令（以 \ 开头）
      const commandMatch = textUntilPosition.match(/\\([a-zA-Z]*)$/)
      
      if (!commandMatch) {
        return { suggestions: [] }
      }

      const prefix = commandMatch[1].toLowerCase()
      const matchedCommands = prefix === ''
        ? LATEX_COMMANDS
        : LATEX_COMMANDS.filter(cmd => 
            cmd.toLowerCase().startsWith(prefix)
          )

      if (matchedCommands.length === 0) {
        return { suggestions: [] }
      }

      const backslashPos = textUntilPosition.lastIndexOf('\\')
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: backslashPos + 1,
        endColumn: position.column
      }

      const suggestions = matchedCommands.map(cmd => {
        const insertText = `\\${cmd}`
        
        return {
          label: insertText,
          kind: monaco.languages.CompletionItemKind.Function,
          detail: 'LaTeX Command',
          documentation: `LaTeX command: \\${cmd}`,
          insertText: insertText,
          range: range,
          sortText: cmd.toLowerCase(),
        }
      })

      suggestions.sort((a, b) => {
        const aText = a.insertText
        const bText = b.insertText
        return aText.localeCompare(bText)
      })

      return { suggestions }
    },
    triggerCharacters: ['\\']
  }
}

/**
 * 注册 LaTeX 语言支持
 */
export function registerLatexLanguage() {
  // 如果已经注册过，则跳过
  if (monaco.languages.getLanguages().find(l => l.id === 'latex')) {
    return
  }

  monaco.languages.register({ id: 'latex' })
  
  // 设置语法高亮
  monaco.languages.setMonarchTokensProvider('latex', {
    defaultToken: '',
    tokenPostfix: '.tex',
    tokenizer: {
      root: [
        [/\\[a-zA-Z@]+/, 'keyword'],           // LaTeX 命令（包括 @ 符号）
        [/%.*$/, 'comment'],                    // 注释
        [/\$\$[\s\S]*?\$\$/, 'string'],        // 块级公式
        [/\$[^$]*\$/, 'string'],                // 行内公式
        [/\[|\]/, 'delimiter.bracket'],         // 中括号
        [/{|}/, 'delimiter.brace'],             // 花括号
        [/[0-9]+/, 'number'],                   // 数字
        [/[^\s\\$%{}[\]]+/, '']                 // 其他文本
      ]
    }
  })

  // 设置主题规则（语法高亮颜色）
  monaco.languages.setLanguageConfiguration('latex', {
    comments: {
      lineComment: '%'
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '$', close: '$' }
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '$', close: '$' }
    ]
  })

  // 注册自动补全提供器
  monaco.languages.registerCompletionItemProvider('latex', createLatexCompletionProvider())
}

