# 🚀 GitHub Pages 部署指南

## 📋 部署步骤

### 1. 创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角的 "+" → "New repository"
3. 填写仓库信息：
   - **Repository name**: `xiyou-shizi` 或您喜欢的名字
   - **Description**: `西游识字 - 基于西游记故事的汉字学习游戏`
   - **Public**: 选择 Public（GitHub Pages 免费版需要公开仓库）
   - **Initialize**: 不要勾选任何初始化选项

### 2. 连接本地仓库到 GitHub

```bash
# 添加远程仓库（替换为您的用户名和仓库名）
git remote add origin https://github.com/YOUR_USERNAME/xiyou-shizi.git

# 推送代码到 GitHub
git branch -M main
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 进入您的 GitHub 仓库页面
2. 点击 "Settings" 标签
3. 在左侧菜单中找到 "Pages"
4. 在 "Source" 部分选择：
   - **Source**: Deploy from a branch
   - **Branch**: main
   - **Folder**: / (root)
5. 点击 "Save"

### 4. 等待部署完成

- GitHub 会自动构建和部署您的网站
- 通常需要几分钟时间
- 部署完成后，您会看到绿色的 ✅ 标记

## 🌐 访问地址

部署成功后，您的游戏将在以下地址可用：

```
https://YOUR_USERNAME.github.io/xiyou-shizi/
```

### 具体页面地址

- **游戏主页**: `https://YOUR_USERNAME.github.io/xiyou-shizi/index.html`
- **语音测试**: `https://YOUR_USERNAME.github.io/xiyou-shizi/test/test-speech-optimization.html`
- **本地文件测试**: `https://YOUR_USERNAME.github.io/xiyou-shizi/test/test-local-file-access.html`

## 🔧 自动部署

我们已经配置了 GitHub Actions 自动部署：

- **触发条件**: 每次推送到 main 分支
- **部署文件**: `.github/workflows/deploy.yml`
- **部署内容**: 整个项目根目录

## 📱 移动端优化

GitHub Pages 部署的游戏支持：

- ✅ **响应式设计**: 自适应手机和平板
- ✅ **PWA 功能**: 可添加到主屏幕
- ✅ **离线支持**: 内置数据回退机制
- ✅ **语音功能**: 支持移动端语音合成

## 🛠️ 更新部署

每次更新代码后：

```bash
git add .
git commit -m "更新描述"
git push origin main
```

GitHub Pages 会自动重新部署最新版本。

## 🔍 故障排除

### 常见问题

1. **404 错误**: 检查文件路径是否正确
2. **样式丢失**: 确保 CSS 文件路径使用相对路径
3. **JavaScript 错误**: 检查浏览器控制台的错误信息
4. **语音不工作**: 确保使用 HTTPS 访问（GitHub Pages 自动提供）

### 调试方法

1. **检查 Actions**: 在 GitHub 仓库的 "Actions" 标签查看部署状态
2. **浏览器控制台**: F12 查看 JavaScript 错误
3. **网络面板**: 检查资源加载情况

## 📊 性能优化

GitHub Pages 部署的优势：

- ✅ **CDN 加速**: 全球 CDN 分发
- ✅ **HTTPS 支持**: 自动 SSL 证书
- ✅ **缓存优化**: 静态资源缓存
- ✅ **压缩传输**: 自动 Gzip 压缩

## 🎯 SEO 优化

已包含的 SEO 优化：

- ✅ **Meta 标签**: 完整的页面描述
- ✅ **语义化 HTML**: 搜索引擎友好
- ✅ **结构化数据**: 教育类应用标记
- ✅ **移动友好**: 响应式设计

## 📝 自定义域名（可选）

如果您有自己的域名：

1. 在仓库根目录创建 `CNAME` 文件
2. 文件内容为您的域名（如：`xiyou.yourdomain.com`）
3. 在域名提供商处设置 CNAME 记录指向 `YOUR_USERNAME.github.io`

## 🎉 部署完成

部署成功后，您的西游识字游戏将：

- 🌍 **全球访问**: 任何人都可以通过网址访问
- 📱 **移动友好**: 支持手机和平板设备
- 🔊 **语音功能**: 完整的拼音发音支持
- 🎮 **完整体验**: 所有游戏功能正常工作
- 🚀 **自动更新**: 代码更新后自动重新部署

享受您的在线汉字学习游戏吧！🎊
