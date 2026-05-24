# AGENTS.md

你必须用中文回答所有问题。

## 项目概览

- **项目名称**: demo-homepage
- **包管理器**: pnpm
- **类型**: Vue 3 + TypeScript + Vite 单页应用

## 技术栈

- **框架**: Vue 3（使用 `<script setup>` 单文件组件）
- **构建工具**: Vite 8.x
- **语言**: TypeScript
- **样式**: Tailwind CSS 4.x（使用 @tailwindcss/vite 插件）
- **UI 库**: Naive UI 2.x
- **动画**: GSAP, AOS, Animate.css, Three.js

## 命令

```bash
pnpm vue-tsc -b  # AI 修改代码后，需要重新运行此命令检查类型
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本（类型检查 + vite build）
pnpm preview      # 预览生产构建
```

## 项目结构

```
src/
├── api/          # API 模块（captcha, crypto, follower, schedule, song, request）
├── assets/       # 静态资源
├── components/   # Vue 组件（UI 区块和模态框）
├── config/       # 配置文件
├── pages/        # 路由页面（Home, Login, Admin）
├── router/       # Vue Router 配置
├── utils/        # 工具函数
├── App.vue
└── main.ts
```

## 路由

| 路径           | 名称  | 组件             |
| -------------- | ----- | ---------------- |
| `/`            | home  | HomePage.vue     |
| `/admin/login` | login | LoginPage.vue    |
| `/admin`       | admin | AdminPage.vue    |
| `/demo`        | demo  | TailwindDemo.vue |

## API 代理

- Vite 开发服务器代理 `/api/*` → `http://localhost:8080`（保留 `/api` 前缀）

## 关键依赖

- **状态管理**: @vueuse/core
- **图表**: （通过组件）
- **加密**: go-captcha-vue
- **3D**: three.js

## 开发注意事项

- 所有 Vue 组件使用 `<script setup>` 语法
- 外部组件优先使用按需导入。
- Tailwind CSS v4 使用 `@tailwindcss/vite` 插件（无 tailwind.config.js）
- 启用 TypeScript 严格模式
- 环境类型定义在 `src/env.d.ts`
- **类型约束**：严禁使用 `any`！如果遇到类型不确定的情况，使用 `unknown` 并做类型守卫。
- 修改完vue ts 代码后，需要重新运行 `pnpm run format` 和 `pnpm vue-tsc -b` 来检查代码是否有误。
- 项目内的导入组件禁止使用 `../` 相对路径，所有源码内导入统一使用 `@/` , 如`import { formatTime } from '@/utils/time'`
- 禁止在vue组件使用多行ts代码，所有代码必须在 `<script setup>` 中。
  禁止:
  ```vue
  <button
    @click="
      auditStatusFilter = undefined
      pagination.page = 1
      loadSubmissions()
    "
  />
  ```
  使用:
  ```vue
  <button @click="clickHandler" />
  <script setup lang="ts">
  const clickHandler = () => {
    auditStatusFilter = undefined
    pagination.page = 1
    loadSubmissions()
  }
  </script>
  ```
- 所有 API 调用后用，必须使用 `api/types/isSuccess` 函数判断后再提示成功或失败。