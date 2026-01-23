// 示例 LaTeX 内容 - 支持 i18n 和主题
// 接受 i18n 的 t 函数、locale 和 isDark 作为参数
export const getExampleLatex = (t, locale = 'zh_CN', isDark = false) => {
  // 确保 t 函数正确工作，如果翻译不存在则使用键本身（不应该发生）
  // 注意：翻译键的路径是 mock.latexEditor.exampleLatexContent.xxx
  const tc = (key) => {
    const fullKey = `mock.latexEditor.exampleLatexContent.${key}`
    let translated = t(fullKey)
    // 如果返回的是键本身（说明翻译不存在），记录警告
    if (translated === fullKey) {
      console.warn(`Translation key not found: ${fullKey}`)
    }
    // 替换 HTML 实体编码为实际的花括号，避免 vue-i18n 解析错误
    // 使用 HTML 实体编码来避免与 vue-i18n 的插值语法冲突
    translated = translated.replace(/&#123;/g, '{')
    translated = translated.replace(/&#125;/g, '}')
    return translated
  }
  const isChinese = locale === 'zh_CN' || locale === 'zh'
  
  // 根据主题设置颜色
  const pageColor = isDark ? '\\pagecolor[rgb]{0.13,0.13,0.13}\\color[rgb]{0.9,0.9,0.9}' : ''
  const textColor = isDark ? '\\color[rgb]{0.9,0.9,0.9}' : ''
  const linkColor = isDark ? 'cyan' : 'blue'
  const fileColor = isDark ? 'magenta' : 'magenta'
  const urlColor = isDark ? 'cyan' : 'cyan'
  
  return `\\documentclass[12pt,a4paper]{article}
${isChinese ? '\\usepackage[UTF8]{ctex}' : ''}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{amsthm}
\\usepackage{graphicx}
\\usepackage{geometry}
\\usepackage{xcolor}
\\usepackage{booktabs}
\\usepackage{multirow}
\\usepackage{array}
\\usepackage{listings}
\\usepackage{tikz}
\\usepackage{pgfplots}
\\usepackage{fancyhdr}
\\usepackage{hyperref}
\\usepackage{float}
\\usepackage{caption}
\\usepackage{subcaption}
\\usepackage{enumitem}
\\usepackage{algorithm}
\\usepackage{algorithmic}
\\usepackage{multicol}
\\usepackage{wrapfig}
\\usepackage{siunitx}
\\usepackage{chemformula}
\\usepackage{physics}

\\geometry{a4paper,left=2.5cm,right=2.5cm,top=3cm,bottom=3cm}
${pageColor}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[C]{${textColor}${tc('title')}}
\\fancyfoot[C]{${textColor}\\thepage}

\\hypersetup{
    colorlinks=true,
    linkcolor=${linkColor},
    filecolor=${fileColor},      
    urlcolor=${urlColor},
    pdftitle={${tc('title')}},
    pdfauthor={${tc('author')}},
    pdfencoding=auto,
    pdfproducer={XeLaTeX with ctex},
    pdfcreator={MetaDoc}
}

\\newtheorem{theorem}{${tc('theorem')}}[section]
\\newtheorem{lemma}[theorem]{${tc('lemma')}}
\\newtheorem{proposition}[theorem]{${tc('proposition')}}
\\newtheorem{corollary}[theorem]{${tc('corollary')}}
\\newtheorem{definition}[theorem]{${tc('definition')}}
\\newtheorem{example}[theorem]{${tc('example')}}

\\title{${textColor}\\textbf{\\Large ${tc('title')}}}
\\author{${textColor}${tc('author')}\\\\ ${textColor}\\textit{${tc('team')}}}
\\date{${textColor}\\today}

\\begin{document}
${textColor}

\\maketitle

\\begin{abstract}
${tc('abstract')}
\\end{abstract}

\\tableofcontents
\\newpage

\\section{${tc('introductionTitle')}}

${tc('introductionContent')} ${tc('introductionContent2')}

\\begin{itemize}
    \\item ${tc('item1')}
    \\item ${tc('item2')}
    \\item ${tc('item3')}
    \\item ${tc('item4')}
    \\item ${tc('item5')}
\\end{itemize}

\\section{${tc('featuresTitle')}}

\\subsection{${tc('feature1Title')}}

${tc('feature1Content')} ${tc('famousEquation')}

\\begin{theorem}[${tc('einsteinTheorem')}]
${tc('einsteinTheoremContent')}
\\begin{equation}
E = mc^2
\\label{eq:emc2}
\\end{equation}
${tc('einsteinTheoremNote')}
\\end{theorem}

\\subsection{${tc('feature2Title')}}

${tc('feature2Content')} ${tc('importantMathResults')}

\\begin{align}
\\int_{-\\infty}^{\\infty} e^{-x^2} dx &= \\sqrt{\\pi} \\label{eq:gaussian} \\\\
\\sum_{i=1}^{n} \\frac{1}{i^2} &= \\frac{\\pi^2}{6} \\label{eq:basel} \\\\
\\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^n &= e \\label{eq:euler}
\\end{align}

\\begin{proposition}[${tc('gaussianIntegral')}]
${tc('gaussianIntegralContent')}
\\end{proposition}

\\subsection{${tc('feature3Title')}}

${tc('feature3Content')} 矩阵运算示例：

\\begin{equation}
\\begin{pmatrix}
a_{11} & a_{12} & \\cdots & a_{1n} \\\\
a_{21} & a_{22} & \\cdots & a_{2n} \\\\
\\vdots & \\vdots & \\ddots & \\vdots \\\\
a_{m1} & a_{m2} & \\cdots & a_{mn}
\\end{pmatrix}
\\begin{pmatrix}
x_1 \\\\
x_2 \\\\
\\vdots \\\\
x_n
\\end{pmatrix}
=
\\begin{pmatrix}
\\sum_{j=1}^{n} a_{1j}x_j \\\\
\\sum_{j=1}^{n} a_{2j}x_j \\\\
\\vdots \\\\
\\sum_{j=1}^{n} a_{mj}x_j
\\end{pmatrix}
\\label{eq:matrix}
\\end{equation}

\\subsection{${tc('complexTableTitle')}}

${tc('complexTableIntro')}

\\begin{table}[H]
\\centering
\\caption{${tc('complexTableCaption')}}
\\label{tab:example}
\\begin{tabular}{l|cc|cc}
\\toprule
\\multirow{2}{*}{\\textbf{${tc('category')}}} & \\multicolumn{2}{c|}{\\textbf{${tc('year2023')}}} & \\multicolumn{2}{c}{\\textbf{${tc('year2024')}}} \\\\
\\cmidrule(lr){2-3} \\cmidrule(lr){4-5}
& ${tc('count')} & ${tc('share')} & ${tc('count')} & ${tc('share')} \\\\
\\midrule
${tc('categoryA')} & 120 & 30\\% & 150 & 35\\% \\\\
${tc('categoryB')} & 180 & 45\\% & 200 & 47\\% \\\\
${tc('categoryC')} & 100 & 25\\% & 80 & 18\\% \\\\
\\bottomrule
\\end{tabular}
\\end{table}

\\subsection{${tc('codeExampleTitle')}}

${tc('codeExampleIntro')}

\\begin{lstlisting}[language=Python, caption=${tc('codeExampleCaption')}, label=lst:example]
def fibonacci(n):
    """${tc('fibonacciDocstring')}"""
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# ${tc('usageExample')}
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\\end{lstlisting}

\\subsection{${tc('algorithmExampleTitle')}}

${tc('algorithmExampleIntro')}

\\begin{algorithm}[H]
\\caption{${tc('quicksortTitle')}}
\\label{alg:quicksort}
\\begin{algorithmic}[1]
\\REQUIRE ${tc('algorithmRequire')}
\\ENSURE ${tc('algorithmEnsure')}
\\IF{$n \\leq 1$}
    \\STATE \\textbf{return} $A$
\\ENDIF
\\STATE ${tc('algorithmStep1')}
\\STATE ${tc('algorithmStep2')}
\\STATE \\textbf{return} $\\text{QuickSort}(L) + E + \\text{QuickSort}(R)$
\\end{algorithmic}
\\end{algorithm}

\\subsection{${tc('graphicsExampleTitle')}}

${tc('graphicsExampleIntro')}

\\begin{figure}[H]
\\centering
\\begin{tikzpicture}[scale=1.2]
    % ${tc('tikzDrawAxes')}
    \\draw[->] (-0.5, 0) -- (4, 0) node[right] {$x$};
    \\draw[->] (0, -0.5) -- (0, 3) node[above] {$y$};
    
    % ${tc('tikzDrawCurve1')}
    \\draw[domain=0:2, smooth, variable=\\x, blue, thick] plot ({\\x}, {\\x*\\x});
    \\node[blue] at (2.5, 3.5) {$y = x^2$};
    
    % ${tc('tikzDrawCurve2')}
    \\draw[domain=0:4, smooth, variable=\\x, red, thick] plot ({\\x}, {sqrt(\\x)});
    \\node[red] at (4.5, 2) {$y = \\sqrt{x}$};
    
    % ${tc('tikzMarkIntersection')}
    \\filldraw[black] (1, 1) circle (2pt) node[above right] {$(1, 1)$};
    
    % ${tc('tikzAddGrid')}
    \\draw[gray, very thin, step=0.5] (0, 0) grid (4, 3);
\\end{tikzpicture}
\\caption{${tc('graphicsCaption')}}
\\label{fig:functions}
\\end{figure}

\\subsection{${tc('multicolTitle')}}

${tc('multicolIntro')}

\\begin{multicols}{2}
\\textbf{${tc('column1Title')}}

${tc('column1Content')}

\\columnbreak

\\textbf{${tc('column2Title')}}

${tc('column2Content')}
\\end{multicols}

\\subsection{${tc('physicsFormulasTitle')}}

${tc('physicsFormulasIntro')}

\\begin{align}
\\vec{F} &= m\\vec{a} \\label{eq:newton} \\\\
E &= \\frac{1}{2}mv^2 + mgh \\label{eq:energy} \\\\
\\nabla \\times \\vec{E} &= -\\frac{\\partial \\vec{B}}{\\partial t} \\label{eq:maxwell}
\\end{align}

${tc('physicsFormulasExplanation')}

\\subsection{${tc('chemistryFormulasTitle')}}

${tc('chemistryFormulasIntro')}

\\begin{itemize}
    \\item ${tc('waterMolecule')}：\\ch{H2O}
    \\item ${tc('carbonDioxide')}：\\ch{CO2}
    \\item ${tc('chemicalReaction')}：\\ch{2H2 + O2 -> 2H2O}
    \\item ${tc('equilibriumReaction')}：\\ch{NH3 + H2O <=> NH4+ + OH-}
\\end{itemize}

\\subsection{${tc('moreMathEnvironmentsTitle')}}

\\begin{definition}[${tc('continuousFunction')}]
${tc('continuousFunctionDef')}
\\[
\\lim_{x \\to x_0} f(x) = f(x_0)
\\]
${tc('continuousFunctionConclusion')}
\\end{definition}

\\begin{lemma}[${tc('meanValueTheorem')}]
${tc('meanValueTheoremContent')}
\\[
f'(c) = \\frac{f(b) - f(a)}{b - a}
\\]
\\end{lemma}

\\begin{example}
${tc('meanValueTheoremExample')}
\\[
f'(c) = 2c = \\frac{f(2) - f(0)}{2 - 0} = \\frac{4 - 0}{2} = 2
\\]
${tc('meanValueTheoremExampleConclusion')}
\\end{example}

\\section{${tc('conclusionTitle')}}

${tc('conclusionContent')}

\\begin{enumerate}[label=\\roman*.]
    \\item ${tc('conclusionItem1')}
    \\item ${tc('conclusionItem2')}
    \\item ${tc('conclusionItem3')}
    \\item ${tc('conclusionItem4')}
    \\item ${tc('conclusionItem5')}
    \\item ${tc('conclusionItem6')}
    \\item ${tc('conclusionItem7')}
\\end{enumerate}

\\begin{corollary}
${tc('corollaryContent')}
\\end{corollary}

\\section*{参考文献}

\\begin{thebibliography}{9}
\\bibitem{einstein}
Einstein, A. (1905). \\textit{On the Electrodynamics of Moving Bodies}. Annalen der Physik, 17(10), 891-921.

\\bibitem{gauss}
Gauss, C. F. (1809). \\textit{Theoria Motus Corporum Coelestium}. Hamburg: Perthes et Besser.
\\end{thebibliography}

\\end{document}
`
}

// 示例编译输出（模拟命令行输出）
export const getExampleCompileOutput = (t) => {
  const tc = (key) => t(`mock.exampleLatexContent.compileOutput.${key}`)
  
  return {
    stdout: `${tc('compiling')}
This is pdfTeX, Version 3.141592653-2.6-1.40.24 (TeX Live 2023)
 restricted \\write18 enabled.
entering extended mode
(./example.tex
LaTeX2e <2022-06-01> patch level 5
L3 programming layer <2023-06-18>
(/usr/local/texlive/2023/texmf-dist/tex/latex/base/article.cls
Document Class: article 2022/07/02 v1.4n Standard LaTeX document class
(/usr/local/texlive/2023/texmf-dist/tex/latex/base/size12.clo))
(/usr/local/texlive/2023/texmf-dist/tex/latex/ctex/ctex.sty
(/usr/local/texlive/2023/texmf-dist/tex/latex/l3kernel/expl3.sty)
(/usr/local/texlive/2023/texmf-dist/tex/latex/l3backend/l3backend-pdftex.def))
(/usr/local/texlive/2023/texmf-dist/tex/latex/amsmath/amsmath.sty
(/usr/local/texlive/2023/texmf-dist/tex/latex/amsmath/amstext.sty
(/usr/local/texlive/2023/texmf-dist/tex/latex/amsmath/amssymb.sty)))
(/usr/local/texlive/2023/texmf-dist/tex/latex/graphics/graphicx.sty
(/usr/local/texlive/2023/texmf-dist/tex/latex/graphics/keyval.sty)
(/usr/local/texlive/2023/texmf-dist/tex/latex/graphics/graphics.sty
(/usr/local/texlive/2023/texmf-dist/tex/latex/graphics/trig.sty)
(/usr/local/texlive/2023/texmf-dist/tex/latex/latexconfig/graphics.cfg)
(/usr/local/texlive/2023/texmf-dist/tex/latex/pdftex-def/pdftex.def))))
(/usr/local/texlive/2023/texmf-dist/tex/latex/geometry/geometry.sty)
(./example.aux) (./example.out) (./example.toc)
[1{/usr/local/texlive/2023/texmf-var/fonts/map/pdftex/updmap/pdftex.map}]
(./example.aux) )
Output written on example.pdf (1 page, 23456 bytes).
Transcript written on example.log.`,
    stderr: ''
  }
}

