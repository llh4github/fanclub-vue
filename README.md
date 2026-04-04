# 莉蔻的兔子窝 - fanclub-vue

本项目是虚拟主播莉蔻（Liko）的非官方粉丝站，致力于收集和展示莉蔻的直播数据、精彩语录和成长历程。

## 项目技术栈

- **前端框架**：Vue 3
- **构建工具**：Vite
- **类型系统**：TypeScript
- **UI 组件库**：Naive UI
- **CSS 框架**：UnoCSS
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **图表库**：ECharts
- **3D 效果**：Three.js
- **实时通信**：WebSocket
- **图标库**：Lucide Vue Next

## 主要模块

### 1. 导航栏（Navigation）
- 响应式设计，支持桌面端和移动端
- 包含首页和关于本站的路由导航
- 滚动时自动调整背景透明度

### 2. 主页区（Hero）
- 展示莉蔻的基本信息和统计数据
- 动态切换莉蔻的经典语录
- 点击语录可跳转到对应的 B 站视频
- 显示直播时长热力图
- 显示粉丝数据图表

### 3. 历程（Timeline）
- 展示莉蔻的重要事件时间线
- 按时间顺序排列的里程碑事件

### 4. 关于本站（AboutSite）
- 站点介绍和技术栈展示
- 数据来源说明
- 免责声明
- 联系方式
- 开源信息（前后端代码仓库链接）

## 本地开发指南

### 环境要求
- Node.js 18+（推荐使用 20+）
- pnpm 8+（或 npm、yarn）

### 项目设置

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 代码检查
pnpm lint
```

### 开发服务器
- **本地访问**：http://localhost:5173/
- **Vue DevTools**：http://localhost:5173/__devtools__/
- **UnoCSS Inspector**：http://localhost:5173/__unocss/

## 项目结构

```
src/
├── public/                  # 公共资源
│   ├── components/         # 公共组件
│   │   ├── Navigation.vue  # 导航栏
│   │   ├── Hero.vue        # 主页区
│   │   ├── Timeline.vue    # 历程
│   │   └── Footer.vue      # 页脚
│   ├── pages/              # 页面
│   │   ├── index.vue       # 首页
│   │   └── about-site.vue  # 关于本站
│   ├── router/             # 路由配置
│   └── assets/             # 静态资源
├── common/                 # 通用代码
│   ├── api/                # API 接口
│   ├── store/              # 状态管理
│   └── utils/              # 工具函数
└── App.vue                 # 应用根组件
```

## 数据来源

- **粉丝数据**：Bilibili API
- **直播时长**：Bilibili 直播间数据
- **语录收集**：粉丝投稿整理

## 免责声明

本站为粉丝自发建设的非官方网站，与莉蔻本人及所属社团无任何关联。
所有内容仅供娱乐交流，如有侵权或不当之处，请联系删除。
本站不对数据的实时性和准确性做出任何保证。

## 开源信息

- **前端代码库**：[https://github.com/llh4github/fanclub-vue](https://github.com/llh4github/fanclub-vue)
- **后端代码库**：[https://github.com/llh4github/fanclub-apiserver](https://github.com/llh4github/fanclub-apiserver)

本项目采用 Apache License 开源协议，欢迎 Star 和贡献代码。
