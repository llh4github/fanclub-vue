# 🎨 FanClub Vue

一个基于 Vue 3 + TypeScript + Vite 的粉丝俱乐部网站前端项目。

## 🔧 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - JavaScript的超集，提供类型检查
- **Vite** - 新一代前端构建工具
- **Tailwind CSS** - 功能优先的CSS框架
- **Naive UI** - Vue 3 的高质量UI组件库
- **Vue Router** - Vue.js官方路由管理器
- **pnpm** - 快速、节省空间的包管理器

## 项目结构

```
src/
├── api/                  # API接口服务
│   ├── auth.ts          # 认证相关API
│   ├── captcha.ts       # 验证码API
│   ├── follower.ts       # 粉丝相关API
│   ├── oss.ts           # 对象存储API
│   ├── schedule.ts      # 日程管理API
│   ├── song.ts          # 歌曲管理API
│   ├── treehole.ts      # 树洞API
│   └── request.ts       # 请求封装
├── assets/              # 静态资源
│   ├── avatar/          # 头像资源
│   ├── fullbody/        # 全身像资源
│   └── icons/           # 图标资源
├── components/          # 公共组件
│   ├── admin/           # 管理后台组件
│   │   ├── AdminLayout.vue        # 管理后台布局
│   │   ├── AdminNavBar.vue        # 管理后台导航栏
│   │   ├── ChangePasswordModal.vue # 修改密码弹窗
│   │   ├── SonglistManagement.vue  # 歌曲列表管理
│   │   ├── SubmissionManagement.vue# 投稿管理
│   │   ├── SubmissionNavigate.vue # 投稿导航
│   │   └── TreeholeManagement.vue # 树洞管理
│   ├── FooterSection.vue # 页脚组件
│   ├── HeroSection.vue   # 英雄区组件
│   ├── MarkdownEditor.vue# Markdown编辑器
│   ├── ParticleBackground.vue # 粒子背景
│   ├── ScheduleSection.vue    # 日程区组件
│   ├── ScBvChecker.vue       # SC BV检查器
│   └── SonglistSection.vue   # 歌曲列表组件
├── pages/               # 页面组件
│   ├── HomePage.vue     # 首页
│   ├── ContributePage.vue# 投稿页面
│   ├── LoginPage.vue    # 登录页面
│   └── AdminPage.vue    # 管理后台页面
├── router/              # 路由配置
│   └── index.ts
├── types/               # TypeScript类型定义
├── utils/               # 工具函数
│   ├── auth.ts          # 认证工具
│   ├── crypto.ts        # 加密工具
│   ├── holidays.ts      # 节假日工具
│   └── useScrollAnimation.ts # 滚动动画
├── App.vue              # 根组件
├── main.ts              # 入口文件
└── style.css            # 全局样式
```

## 功能特性

### 公共页面
- **首页** - 展示主播介绍、日程安排、歌曲列表等内容
- **投稿页面** - 用户投稿功能
- **粒子背景** - 动态粒子背景动画效果
- **响应式设计** - 支持桌面端和移动端访问
- **毛玻璃效果** - 使用 Glassmorphism 设计风格

### 管理后台
- **树洞管理** - 管理用户的树洞投稿
- **投稿管理** - 管理用户的所有投稿内容
- **歌曲列表管理** - 管理歌曲列表，支持增删改查
- **用户认证** - 登录认证和密码修改功能
- **深色模式** - 使用 Naive UI 的深色主题

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:5173 查看应用。

### 构建生产版本

```bash
pnpm build
```

### 代码检查和格式化

```bash
# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 检查格式化
pnpm format:check
```

### 类型检查

```bash
pnpm typecheck
```

## 📖 开发指南

### 添加新页面

1. 在 `src/pages/` 目录下创建页面组件
2. 在 `src/router/index.ts` 中配置路由
3. 使用 Vue 3 `<script setup>` 语法

### 添加新组件

1. 在 `src/components/` 目录下创建组件
2. 使用 Composition API 和 TypeScript
3. 遵循项目的命名规范

### API 开发

API 接口定义在 `src/api/` 目录下：

```typescript
// 示例：获取歌曲列表
import { songService } from '@/api/services/song'

const response = await songService.getSongPage({
  name: '歌曲名称',
  pageParam: {
    pageIndex: 1,
    pageSize: 10
  }
})
```

## 🚢 部署

### 构建

```bash
pnpm build
```

构建产物位于 `dist/` 目录。

### Nginx 配置

由于项目使用 Vue Router 的 history 模式，需要配置 Nginx：

```nginx
server {
    root /var/www/fanclub-html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
## ⚠️ 免责声明

本站为粉丝自发建设的非官方网站，与莉蔻本人及所属社团无任何关联。 所有内容仅供娱乐交流，如有侵权或不当之处，请联系删除。 本站不对数据的实时性和准确性做出任何保证。
## 📜 许可证

本项目基于 Apache License 2.0 开源，详见 [LICENSE](LICENSE) 文件。
## 开源信息
- 前端代码库：https://github.com/llh4github/fanclub-vue
- 后端代码库：https://github.com/llh4github/fanclub-apiserver
