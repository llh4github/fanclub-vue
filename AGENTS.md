# AGENTS
所有AI编码工具都应遵守本文档规范。
1. 你必须使用中文回答我的问题。
2. vue组件使用 Composition API + <script setup lang="ts"> 风格。
3. 


## 开发流程
1. 本项目使用pnpm作为包管理器。
2. 本项目使用Vue 3 + TypeScript 开发。
3. 修改完代码文件后，使用 `pnpm typecheck && pnpm format` 检查并格式化代码。

## 项目结构

```
├── .trae/                 # Trae相关配置
├── .vscode/               # VS Code配置
├── public/                # 公共静态文件
├── src/                   # 源代码目录
│   ├── admin/             # 管理后台
│   │   ├── router/        # 管理后台路由
│   │   └── AdminIndex.vue # 管理后台入口组件
│   ├── api/               # API相关代码
│   │   ├── services/      # API服务
│   │   ├── client.ts      # API客户端
│   │   ├── index.ts       # API入口
│   │   └── types.ts       # API类型定义
│   ├── assets/            # 静态资源
│   │   ├── avatar/        # 头像资源
│   │   ├── fullbody/      # 全身像资源
│   │   ├── texts/         # 文本资源
│   │   └── texture/       # 纹理资源
│   ├── common/            # 通用组件和工具
│   │   ├── assets/        # 通用资源
│   │   ├── components/    # 通用组件
│   │   ├── constants/     # 常量定义
│   │   ├── router/        # 通用路由
│   │   └── stores/        # 状态管理
│   ├── public/            # 公共页面
│   │   ├── components/    # 公共组件
│   │   ├── pages/         # 公共页面
│   │   └── router/        # 公共路由
│   ├── types/             # TypeScript类型定义
│   ├── websocket/         # WebSocket相关代码
│   ├── App.vue            # 主应用组件
│   └── main.ts            # 入口文件
├── .editorconfig          # 编辑器配置
├── .env                   # 环境变量
├── .gitattributes         # Git属性配置
├── .gitignore             # Git忽略文件
├── .oxfmtrc.json          # Oxlint格式化配置
├── .oxlintrc.json         # Oxlint配置
├── AGENTS.md              # AI编码工具规范
├── LICENSE                # 许可证
├── README.md              # 项目说明
├── env.d.ts               # 环境类型定义
├── eslint.config.ts       # ESLint配置
├── index.html             # HTML入口
├── package.json           # 项目配置和依赖
├── pnpm-lock.yaml         # pnpm依赖锁文件
├── pnpm-workspace.yaml    # pnpm工作区配置
├── postcss.config.js      # PostCSS配置
├── tailwind.config.js     # Tailwind CSS配置
├── tsconfig.app.json      # TypeScript应用配置
├── tsconfig.json          # TypeScript配置
├── tsconfig.node.json     # TypeScript Node配置
├── uno.config.ts          # UnoCSS配置
└── vite.config.ts         # Vite配置
```

### 目录说明

- **src/admin/**: 管理后台相关代码，包含管理后台的路由和入口组件。
- **src/api/**: API相关代码，包含API服务、客户端、入口和类型定义。
- **src/assets/**: 静态资源，包含头像、全身像、文本和纹理资源。
- **src/common/**: 通用组件和工具，包含通用资源、组件、常量、路由和状态管理。
- **src/public/**: 公共页面，包含公共组件、页面和路由。
- **src/types/**: TypeScript类型定义，包含项目中使用的类型。
- **src/websocket/**: WebSocket相关代码，处理实时通信。

### 核心文件

- **src/App.vue**: 主应用组件，应用的根组件。
- **src/main.ts**: 入口文件，初始化Vue应用。
- **package.json**: 项目配置和依赖管理。
- **vite.config.ts**: Vite构建工具配置。
- **tsconfig.json**: TypeScript配置。
- **tailwind.config.js**: Tailwind CSS配置。

