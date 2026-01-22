# GitHub Actions 工作流说明

## 工作流列表

### 1. deploy.yml - 自动部署
当代码推送到 `main` 分支时，自动构建并部署到 GitHub Pages。

### 2. update-assets.yml - 更新许可证文件
自动从 MetaDoc 仓库同步最新的许可证文件。

**触发方式：**
- 手动触发（workflow_dispatch）
- 定时触发（每天 UTC 0点，北京时间8点）

**功能：**
- 从 `JaredYe04/MetaDoc` 仓库获取最新的许可证文件
- 如果有更新，自动提交到 website 仓库
- 使用 `[skip ci]` 标记避免触发部署循环

## 配置说明

### 公开仓库（默认）
如果 MetaDoc 仓库是公开的，无需额外配置，使用默认的 `GITHUB_TOKEN` 即可。

### 私有仓库
如果 MetaDoc 仓库是私有的，需要在 GitHub Secrets 中配置：

1. 进入仓库 Settings > Secrets and variables > Actions
2. 点击 "New repository secret"
3. 添加以下 Secret：
   - **Name**: `METADOC_REPO_TOKEN`
   - **Value**: 一个具有访问 MetaDoc 仓库权限的 Personal Access Token (PAT)

**如何创建 PAT：**
1. 进入 GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 选择权限：
   - `repo` (完整仓库访问权限)
4. 生成并复制 token
5. 将 token 添加到 Secrets 中

## 注意事项

- 工作流使用 `[skip ci]` 标记提交，避免触发部署循环
- 如果文件没有变化，不会创建新的提交
- 定时任务每天运行一次，也可以手动触发

