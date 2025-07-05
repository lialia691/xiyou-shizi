# 🐒 西游识字 - 跟随孙悟空学汉字

> 基于西游记故事的汉字学习游戏，让孩子在经典故事中快乐学习中文

## 🎮 在线体验

**🌐 GitHub Pages 部署地址**: `https://YOUR_USERNAME.github.io/xiyou-shizi/`

*（请将 YOUR_USERNAME 替换为您的 GitHub 用户名）*

## ✨ 游戏特色

### 🎯 核心功能
- **📚 西游记故事背景**: 花果山、龙宫、天宫等经典场景
- **🔊 真人语音发音**: 纯正普通话拼音教学
- **🤖 AI智能推荐**: 个性化学习路径规划
- **📊 学习进度跟踪**: 详细的学习数据分析
- **🎨 精美游戏界面**: 沉浸式学习体验

### 🛠️ 技术特色
- **📱 响应式设计**: 支持手机、平板、电脑
- **🔄 离线支持**: 内置数据，无网络也能学习
- **⚡ 高性能**: 优化的数据结构和算法
- **♿ 无障碍访问**: 支持屏幕阅读器和键盘导航
- **🌐 PWA 就绪**: 可安装到设备主屏幕

## 🚀 快速开始

### 在线访问
直接访问 GitHub Pages 地址即可开始游戏，无需安装。

### 本地运行
```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/xiyou-shizi.git
cd xiyou-shizi

# 启动本地服务器
npx http-server -p 3000
# 或者
python -m http.server 3000

# 访问 http://localhost:3000
```

## 📁 项目结构

```
xiyou-shizi/
├── index.html              # 游戏主页
├── style.css              # 主样式文件
├── app.js                 # 主应用逻辑
├── speech-system.js       # 语音系统（优化版）
├── character-provider.js  # 汉字数据提供者
├── data-processor.js      # 数据处理器
├── ai-puti-system.js      # AI菩提系统
├── user-data-manager.js   # 用户数据管理
├── review-scheduler.js    # 复习调度器
├── generate-levels.js     # 关卡生成器
├── chinaword2500.json     # 汉字数据库
├── stories.json           # 故事模板
├── images/                # 游戏图片资源
├── test/                  # 测试文件
└── .github/workflows/     # GitHub Actions 部署配置
```

## 🎯 学习内容

### 📚 汉字范围
- **基础汉字**: 2500个常用汉字
- **拼音系统**: 完整的声母韵母组合
- **频率排序**: 按使用频率科学排列
- **难度分级**: 适合不同年龄段学习

### 📖 故事场景
1. **花果山水帘洞** - 石猴出世
2. **龙宫借宝** - 金箍棒传说
3. **大闹天宫** - 齐天大圣威名
4. **五行山下** - 五百年等待
5. **观音点化** - 取经路开始

## 🔧 技术架构

### 前端技术栈
- **HTML5**: 语义化结构
- **CSS3**: 现代样式和动画
- **JavaScript ES6+**: 模块化开发
- **Web Speech API**: 语音合成
- **PWA**: 渐进式Web应用

### 核心模块
- **SpeechSystem**: 语音系统（依赖注入架构）
- **CharacterProvider**: 汉字数据管理
- **DataProcessor**: 游戏数据处理
- **AIPutiSystem**: AI学习助手
- **UserDataManager**: 用户数据持久化

### 性能优化
- **动态数据映射**: 废除硬编码，基于JSON动态生成
- **Map数据结构**: O(1)查找性能
- **懒加载**: 按需加载资源
- **缓存策略**: 智能数据缓存

## 🎨 界面预览

### 主界面
- 🗺️ **关卡路线图**: 西游记取经路线
- 🧘‍♂️ **AI菩提助手**: 智能学习建议
- 📊 **进度显示**: 实时学习统计

### 游戏界面
- 🎭 **场景展示**: 精美的西游记场景
- 🔤 **汉字学习**: 大字显示，清晰易读
- 🎵 **拼音选择**: 四选一拼音测试
- 🔊 **语音播放**: 点击即可听发音

## 📊 学习数据

### 智能分析
- **学习时长**: 详细的时间统计
- **正确率**: 实时准确率计算
- **难点识别**: AI识别学习难点
- **复习提醒**: 智能复习调度

### 进度跟踪
- **关卡进度**: 可视化进度条
- **汉字掌握**: 已学汉字统计
- **成就系统**: 学习成就解锁
- **历史记录**: 完整学习历史

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 开发环境
```bash
# 安装依赖（如果有）
npm install

# 启动开发服务器
npm start
# 或
npx http-server

# 运行测试
npm test
```

### 贡献方式
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- **西游记**: 经典文学作品提供故事背景
- **现代汉语常用字表**: 提供科学的汉字频率数据
- **Web Speech API**: 提供语音合成功能
- **GitHub Pages**: 提供免费的静态网站托管

## 📞 联系方式

- **项目地址**: https://github.com/YOUR_USERNAME/xiyou-shizi
- **在线体验**: https://YOUR_USERNAME.github.io/xiyou-shizi/
- **问题反馈**: [GitHub Issues](https://github.com/YOUR_USERNAME/xiyou-shizi/issues)

---

**🎉 让我们一起在西游记的世界中快乐学习汉字吧！**
