# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

请始终使用简体中文对话，保持专业、简洁。

## 常用命令

```bash
pnpm install          # 安装依赖（使用 pnpm）
pnpm dev              # 开发服务器（vite --mode development）
pnpm build            # 生产构建（先 vue-tsc -b 类型检查，再 vite build）
pnpm build:dev        # 开发构建
pnpm preview          # 本地预览生产构建
pnpm lint             # ESLint 检查并修复
pnpm exec vue-tsc --noEmit  # TypeScript 类型检查
```

## 技术栈

Vue 3 + TypeScript + Element Plus + Pinia + Vue Router + Vite 7

## 架构要点

### 自动导入（unplugin）

以下无需手动 import，可直接在 `.vue` 文件中使用：
- **Vue API**：`ref`、`computed`、`watch` 等（`unplugin-auto-import`，生成 `src/auto-imports.d.ts`）
- **Vue Router**：`useRouter`、`useRoute`
- **Pinia**：`defineStore`、`storeToRefs`
- **Element Plus 组件**：所有 El 组件按需自动导入（`unplugin-vue-components`，生成 `src/components.d.ts`）
- **Element Plus Icons**：从 `@element-plus/icons-vue` 全局注册（见 `main.ts`）

### 路由结构 (`src/router/`)

路由按模块拆分到 `modules/` 目录：
- `core.ts` — 首页 `/`、登录 `/login`、404、个人中心 `/profile`
- `dashboard.ts` — 控制台 `/dashboard`
- `permission.ts` — 权限管理 `/permission`（用户/角色/权限菜单）
- `system.ts` — 系统管理 `/system`（系统设置/城市信息）

所有需 Layout 的路由都使用 `() => import('@/layout/index.vue')` 懒加载。路由元信息 `meta.permission` 定义页面级权限（格式 `模块:资源:操作`，如 `system:user:page_view`）。路由守卫在 `beforeEach` 中通过 `userStore.initUserInfo()` 初始化用户信息和权限。

### 权限系统

**三级通配符匹配**（`store/user.ts:hasPermission`）：权限格式为 `a:b:c`，`*:*:*` 表示超级管理员。逐级匹配，每级 `*` 匹配任意值。

**自定义指令**（`src/directives/permission.ts`）：
- `v-permission="'system:user:add'"` — 单个权限检查，无权限则移除 DOM 元素
- `v-permission="['system:user:add', 'system:user:edit']"` — 数组形式，任意满足即可
- `v-role="'admin'"` / `v-role="['admin', 'user']"` — 角色检查

### API 层 (`src/api/` + `src/utils/request.ts`)

- Axios 实例 `baseURL` 根据 `VITE_MOCK_ENABLE` 切换 `/mock-api` 或 `/api`
- 开发服务器代理 `/api` → `VITE_API_BASE_URL`（`vite.config.ts`）
- 响应拦截器：`code !== 0` 视为失败；特定错误码（401, 11011-11016）触发 Token 失效 → 清空登录态并跳转登录页
- 封装 `get/post/put/del` 方法，所有 API 调用返回 `ApiResponse<T>`
- 文件上传使用独立的 `uploadService`（`src/utils/upload_files_request.ts`），baseURL 为 `VITE_UPLOAD_FILES_API_BASE_URL`

### 状态管理 (`src/store/`)

- `user.ts` — 用户认证、权限。Token/用户信息/权限列表持久化到 localStorage。`initUserInfo()` 在路由守卫中调用，恢复登录态。
- `tagsView.ts` — 标签页导航，支持访问记录、缓存、删除（单个/其他/全部）

### Mock 系统

使用 `vite-plugin-mock`，mock 文件在 `/mock/` 目录，由 `mock/index.ts` 聚合导出。开启方式：`.env.development` 中设置 `VITE_MOCK_ENABLE=true`。Mock 接口路径以 `/mock-api` 为前缀。

### 路径别名与 TypeScript

- `@/` 映射到 `src/`
- TypeScript 严格模式：`strict: true`、`noUnusedLocals: true`、`noUnusedParameters: true`、`erasableSyntaxOnly: true`
- ESLint 规则：不允许未使用变量（前缀 `_` 除外）、`no-explicit-any` 警告、不禁用 `v-html`、允许单字组件名

### 环境变量（`src/env.d.ts` 定义类型）

| 变量 | 说明 |
|------|------|
| `VITE_APP_TITLE` | 应用标题（mikuyun管理后台） |
| `VITE_APP_ENV` | 环境标识（dev/prod） |
| `VITE_API_BASE_URL` | API 基础地址 |
| `VITE_UPLOAD_FILES_API_BASE_URL` | 文件上传 API 地址 |
| `VITE_MOCK_ENABLE` | 是否启用 mock（true/false） |
