# vue+ts管理后台

基于 Vue 3 + TypeScript + Element Plus 构建的现代化管理系统前端解决方案。

## 🌟 项目特色

- 🎯 **现代化技术栈**：Vue 3 Composition API + TypeScript + Vite
- 🎨 **精美UI设计**：Element Plus 组件库 + 自定义主题
- 🔐 **完善的权限控制**：RBAC 权限模型 + 路由守卫
- 📱 **响应式布局**：适配各种屏幕尺寸
- ⚡ **高性能优化**：按需加载 + 代码分割
- 🛠️ **开发体验优秀**：ESLint + Prettier + 自动导入
- 🧪 **Mock 数据支持**：内置 Mock 服务，无需后端即可开发

## 🚀 技术栈

| 类别 | 技术 |
|------|------|
| 核心框架 | Vue 3.5 + TypeScript |
| 构建工具 | Vite 7 |
| 组件库 | Element Plus 2.13 |
| 状态管理 | Pinia 3 |
| 路由管理 | Vue Router 5 |
| HTTP客户端 | Axios 1.13 |
| Mock 服务 | vite-plugin-mock + MockJS |
| CSS预处理器 | Sass |
| 图标库 | Iconify + Element Plus Icons |
| 代码规范 | ESLint + TypeScript ESLint |

## 📁 项目结构

```
.
├── mock/               # Mock 数据目录
│   ├── index.ts        # Mock 入口
│   ├── auth.ts         # 认证相关 Mock
│   ├── sys_user.ts     # 用户管理 Mock
│   ├── sys_menu.ts     # 菜单管理 Mock
│   ├── sys_role.ts     # 角色管理 Mock
│   ├── sys_config.ts   # 系统配置 Mock
│   ├── region.ts       # 地区管理 Mock
│   └── common.ts       # 通用接口 Mock
├── src/
│   ├── api/            # API 接口定义
│   ├── components/     # 全局组件
│   ├── directives/     # 自定义指令
│   ├── layout/         # 页面布局组件
│   ├── router/         # 路由配置
│   ├── store/          # 状态管理
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   ├── views/          # 页面视图
│   │   ├── dashboard/  # 仪表板
│   │   ├── login/      # 登录页面
│   │   ├── system/     # 系统管理模块
│   │   │   ├── sys_user/   # 用户管理
│   │   │   ├── sys_role/   # 角色管理
│   │   │   ├── sys_menu/   # 菜单管理
│   │   │   ├── sys_config/ # 系统配置
│   │   │   └── sys_region/ # 地区管理
│   │   └── error/      # 错误页面
│   ├── App.vue         # 根组件
│   ├── main.ts         # 入口文件
│   └── style.css       # 全局样式
└── ...
```

## 🛠️ 快速开始

### 环境要求

- Node.js: 22.20.0
- pnpm: 10.28.2（推荐）或 npm: 11.10.0

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 开发运行

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 代码检查和修复
pnpm lint
```

### 环境配置

项目支持多环境配置：

- `.env.development` - 开发环境
- `.env.production` - 生产环境

主要配置项：

```env
VITE_APP_TITLE=应用标题
VITE_APP_ENV=环境标识
VITE_API_BASE_URL=API基础地址
VITE_MOCK_ENABLE=true  # 是否启用 Mock 数据（true/false）
```

### 🧪 Mock 数据使用

项目内置了完整的 Mock 数据支持，可在没有后端服务的情况下进行前端开发。

**启用 Mock：**
在 `.env.development` 中设置 `VITE_MOCK_ENABLE=true`

**Mock 接口列表：**
- 认证模块：`/auth/login`、`/auth/getInfo`、`/auth/permissions`、`/auth/logout`
- 用户管理：`/sysUser/list`、`/sysUser/add`、`/sysUser/update`、`/sysUser/del`
- 角色管理：`/sysRole/getRoleList`、`/sysRole/add`、`/sysRole/update`、`/sysRole/del`
- 菜单管理：`/sysMenu/tree`、`/sysMenu/add`、`/sysMenu/update`、`/sysMenu/del`
- 系统配置：`/sysConfig/list`、`/sysConfig/add`、`/sysConfig/update`、`/sysConfig/del`
- 地区管理：`/region/tree`
- 文件上传：`/file/upload/qiniu`

**切换到真实接口：**
将 `VITE_MOCK_ENABLE` 设置为 `false`，请求将自动转发到 `VITE_API_BASE_URL` 配置的地址。

## 🔧 核心功能

### 🔐 权限管理系统

- 基于 RBAC 的权限控制
- 路由级别的权限验证
- 组件级别的按钮权限控制

### 🎨 UI 组件特性

- 表单验证
- 图标自动导入
- 组件自动注册

### 🌐 网络请求

- Axios 封装
- 请求拦截器（自动添加 Token）
- 响应拦截器（统一错误处理）
- API 类型定义

### 📦 状态管理

- 用户信息管理
- 权限管理
- 标签页管理
- Token 过期处理

## 🎯 系统模块

### 🏠 首页仪表板
- 系统信息概览

### 👥 用户管理

### 🎭 角色管理

### 📋 菜单管理

### ⚙️ 系统配置

### 🌍 地区管理

## 🔒 安全特性

- JWT Token 认证
- 权限动态校验
- XSS 防护
- CSRF 防护

## 📱 浏览器支持

- Chrome >= 80
- Firefox >= 74
- Safari >= 13
- Edge >= 80

## 💬 联系方式

如有问题，请提交 Issue 或联系项目维护者。
