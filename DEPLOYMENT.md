# 部署说明

## GitHub Pages 部署

本网站配置了自动部署到GitHub Pages的工作流。

### 前置条件

1. 在GitHub仓库设置中启用GitHub Pages
   - 进入仓库 Settings > Pages
   - Source 选择 "GitHub Actions"

2. 确保仓库有正确的权限
   - 仓库需要允许GitHub Actions运行
   - 需要Pages写入权限

### 自动部署

当代码推送到 `main` 分支时，GitHub Actions会自动：
1. 安装依赖
2. 构建项目
3. 部署到GitHub Pages

### 手动触发

也可以在Actions标签页手动触发部署工作流。

### 访问地址

部署成功后，网站将可通过以下地址访问：
- `https://[username].github.io/MetaDoc-Releases/`

注意：由于网站配置了base路径为 `/MetaDoc-Releases/`，确保GitHub Pages的仓库名称匹配。

## 本地开发

```bash
cd website
npm install
npm run dev
```

## 本地构建

```bash
cd website
npm install
npm run build
```

构建产物在 `website/dist` 目录。

