# LaTeX 示例编译脚本

此脚本用于编译示例 LaTeX 文档为 PDF，供网站 mock 界面使用。

## 使用方法

1. 确保已安装依赖：
```bash
npm install
# 或
pnpm install
```

2. 运行编译脚本：
```bash
npm run compile-latex
# 或
pnpm compile-latex
```

3. 编译完成后，PDF 文件将保存在 `public/pdfs/` 目录下：
   - `example-zh.pdf` - 中文示例
   - `example-en.pdf` - 英文示例

## 注意事项

- 首次运行时会自动下载 LaTeX 编译器（Tectonic），可能需要一些时间
- 确保网络连接正常，以便下载编译器
- 编译脚本会自动创建 `public/pdfs/` 目录（如果不存在）

