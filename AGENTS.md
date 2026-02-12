# Vue-TS-Admin 代理编码指南

## 项目概述
Vue-TS-Admin 是一个基于 Vue 3 + TypeScript + Element Plus 构建的现代化管理系统。该项目遵循 Vue 3 Composition API 模式，使用严格的 TypeScript 类型，并使用 Vite 作为构建工具。

## 构建/检查/测试命令

### 开发与构建
```bash
# 安装依赖（推荐使用 pnpm）
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 本地预览生产构建
pnpm preview

# 构建开发版本（用于调试）
pnpm build:dev
```

### 代码检查与类型检查
```bash
# 使用 ESLint 检查和修复代码风格问题
pnpm lint

# 类型检查 TypeScript 文件
pnpm exec vue-tsc --noEmit
```

### 测试
**注意：** 该项目目前没有配置测试框架。如果将来需要添加测试，请考虑：
- 使用 Jest 和 Vue Test Utils 进行单元测试
- 使用 Cypress 进行端到端测试
- 使用 Vitest 作为轻量级替代方案（符合 Vite 生态）

## 代码风格指南

### TypeScript 配置
- 遵循严格 TypeScript 设置 (`strict: true`)
- 启用未使用变量检查 (`noUnusedLocals: true`, `noUnusedParameters: true`)
- 使用路径别名：`@/*` 映射到 `src/*`
- 启用 `noUncheckedSideEffectImports` 和 `noFallthroughCasesInSwitch`
- Vue SFC 文件应在 `src/env.d.ts` 中使用模块声明进行正确类型化

### 导入规则
- 使用 `@` 别名对 `src/` 目录中的文件进行绝对导入：`import Something from '@/components/Something'`
- 在可能的情况下，使用显式的 `type` 导入类型
- 按以下顺序分组导入：
  1. 外部包（vue、element-plus 等）
  2. 内部模块（@/api、@/utils 等）
  3. 相对导入（./Something）
- 对 Composition API 函数（ref、computed 等）使用 Vue 自动导入功能

### 格式化
- 使用单引号表示字符串（`'` 而不是 `"`）
- 使用分号（`;`）终止语句
- 使用 2 空格缩进
- 对 Vue 3 Composition API 使用 `<script setup>` 语法
- Vue 组件名称使用帕斯卡命名法（PascalCase）
- 模板元素和属性使用短横线命名法（kebab-case）
- 使用 SCSS 进行样式设计，适当使用作用域样式

### 命名约定
- **组件**：使用帕斯卡命名法（例如，`UserProfile.vue`，`DataTable.vue`）
- **文件**：始终一致地使用短横线命名法（kebab-case）或驼峰命名法（camelCase）
- **变量/函数**：使用驼峰命名法（例如，`fetchUserData`，`isLoading`）
- **类型/接口**：使用帕斯卡命名法，不推荐使用 `I` 前缀；首选直接命名（例如，`User`，`ApiRequest`）
- **常量**：使用大写蛇形命名法（例如，`MAX_FILE_SIZE`）
- **组件 Props**：使用驼峰命名法（例如，`userName`，`isDisabled`）

### Vue 组件结构
- 模板 → 脚本 → 样式（标准顺序）
- 使用 `<script setup lang="ts">` 语法进行 Composition API 组件
- 在可能的情况下，使用 TypeScript 接口定义 props 和 emits
- 在 setup 块顶部放置组合式函数和响应式变量
- 明确分离模板逻辑和业务逻辑

### TypeScript 最佳实践
- 为函数参数和返回值使用显式类型注释
- 利用 `Partial<T>`、`Pick<T, K>` 等实用类型
- 对复杂条件类型使用判别联合
- 始终正确处理可空类型
- 当类型完全未知时使用 `unknown` 而不是 `any`
- 为所有 API 响应结构定义接口
- 在 `env.d.ts` 中包含 Vue SFC 模块声明，以解决导入 `.vue` 文件时的 TypeScript 错误

### 错误处理
- 使用 Element Plus Message 和 MessageBox 组件处理面向用户的提示
- 在响应拦截器中处理 API 错误（参见 `/src/utils/request.ts`）
- 在异步操作中适当使用 try/catch 块
- 在开发过程中将错误记录到控制台，但避免在生产环境中暴露敏感细节
- 优雅地处理权限错误（令牌过期时重定向到登录）

### API 设计模式
- 在 `/src/api/` 目录中组织 API 调用
- 使用一致的命名：`get<Entity>List`，`add<Entity>`，`update<Entity>`，`delete<Entity>`
- 在 `/src/types/` 中为所有请求/响应类型定义 TypeScript 接口
- 使用 axios 拦截器进行身份验证头和错误处理
- 为所有 API 调用包含类型定义

### 安全注意事项
- 使用存储在 localStorage 中的 JWT 令牌认证
- 为受保护路由实现路由守卫
- 在客户端和服务器端都验证用户输入
- 使用自定义指令（例如 `v-permission`）实现适当的权限检查
- 清理用户输入以防止 XSS 攻击

### 性能优化
- 使用 v-loading 指令处理加载状态
- 为大型数据集实现分页
- 适用时为路由使用懒加载
- 为列表渲染实现适当的 key 属性
- 使用计算属性进行昂贵的计算
- 在组件生命周期钩子中实现适当的清理

### 组件架构
- 保持组件专注且单一用途
- 使用插槽进行灵活的组件组合
- 使用 Element Plus 验证实现适当的表单验证
- 使用 Pinia 进行状态管理（存储在 `/src/store/` 中）
- 使用 Vue Router 进行导航和路由级权限

### 环境配置
- 使用 `.env.development` 和 `.env.production` 进行环境特定变量
- 使用 `import.meta.env.VITE_*` 模式访问环境变量
- 在 .env 文件中配置 API 基础 URL 和其他环境特定设置