# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

请始终使用简体中文与用户对话，并在回答时保持专业、简洁。

## 常用命令

```bash
pnpm dev           # 启动开发服务器 (Vite, 端口 3000, Mock 由 .env 中的 VITE_MOCK_ENABLE 控制)
pnpm build         # vue-tsc 类型检查 + Vite 生产构建
pnpm build:dev     # vue-tsc 类型检查 + Vite 开发环境构建
pnpm preview       # 预览生产构建
pnpm lint          # ESLint 检查并修复 .vue/.js/.ts/.jsx/.tsx
```

## 技术栈

Vue 3.5 (Composition API) + TypeScript + Vite 7 + Pinia 3 + Vue Router 5
Element Plus 2.13 + Sass + Iconify
Axios 1.13 + Mock 服务 (vite-plugin-mock + mockjs)

## 项目架构

```
src/
├── api/          # 按模块拆分的 API 函数，统一调用 @/utils/request 的封装方法
├── router/modules/  # 路由按功能拆分: core / dashboard / permission / system
├── store/        # Pinia store: user（用户/权限/登录态）、tagsView（标签页导航）
├── views/        # 页面视图，按模块分目录: login / dashboard / system / error / profile / redirect
├── layout/       # 主布局: 侧边栏菜单 + 顶栏(用户头像/下拉) + TagsView + <router-view>
├── components/   # 全局复用组件: HelloWorld, TagsView
├── directives/   # v-permission / v-role（无权限时移除 DOM 元素）
├── types/        # TypeScript 接口，每个业务模块一个文件，公共类型在 common_types.ts
├── utils/        # request.ts（Axios 主实例）、upload_files_request.ts（文件上传实例）、common_utils.ts、env.ts
mock/             # Mock 数据目录，文件路径与真实接口路径对应
```

## 关键设计

### 路径别名与类型约束
- `@` → `src/`
- TypeScript strict 模式开启：`noUnusedLocals`、`noUnusedParameters` 均开启；`erasableSyntaxOnly: true`，不允许遗留的 TS 专用语法（如 enum、namespace、constructor parameter properties）

### API 响应格式
所有接口返回统一格式：`{ code: number, msg: string, data: T }`
- `code === 0` 表示成功，其他值表示错误
- 特定 token 异常码（401, 11011–11016）会触发自动登出并跳转登录页
- 类型定义在 `src/types/common_types.ts` 的 `ApiResponse<T>`

### Axios 实例
- **主实例** (`src/utils/request.ts`): 请求拦截器自动注入 Bearer Token；Mock 开启时 baseURL 为 `/mock-api`，否则为 `/api`。导出 `get`/`post`/`put`/`del` 封装方法
- **上传实例** (`src/utils/upload_files_request.ts`): baseURL 使用 `VITE_UPLOAD_FILES_API_BASE_URL`，超时 30s，适合文件上传场景

### 登录流程
`login` API → `userStore.login()` 存储 token → 自动调用 `fetchUserInfo()` + `fetchPermissions()` → 写入 localStorage → 路由跳转 `/`
路由守卫 (`src/router/index.ts`) 在每次导航时检查 `userStore.isLogin` 和页面级权限 (`meta.permission`)

### 权限模型
- 格式：`system:module:action`（如 `system:user:page_view`），三段式，支持 `*` 通配符（如 `*:*:*` 表示超级管理员）
- 页面级：路由 `meta.permission` 字段
- 元素级：`v-permission="'system:user:add'"` 或 `v-role="'admin'"` 指令

### 环境变量
- `.env.development` / `.env.production`
- `VITE_MOCK_ENABLE` 控制 Mock 开关（true/false），`VITE_API_BASE_URL` 控制后端地址
- `VITE_SERVER_TYPE` 区分后端类型（boot: 单体 / cloud: 微服务）
- `VITE_APP_TITLE` 控制页面标题，通过 `src/utils/env.ts` 中的 `getAppTitle()` 读取
- 类型声明在 `src/env.d.ts` 的 `ImportMetaEnv` 接口中

### 自动导入
- `unplugin-auto-import`: Vue/Pinia/Vue-Router API 无需手动 import
- `unplugin-vue-components`: Element Plus 组件按需自动注册
- `unplugin-icons`: Iconify 图标自动导入
