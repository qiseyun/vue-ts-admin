# mikuyun管理后台

基于 Vue 3 + TypeScript + Element Plus 构建的现代化管理系统前端解决方案。

## 🌟 项目特色

- 🎯 **现代化技术栈**：Vue 3 Composition API + TypeScript + Vite
- 🎨 **精美UI设计**：Element Plus 组件库 + 自定义主题
- 🔐 **完善的权限控制**：RBAC 权限模型 + 路由守卫
- 📱 **响应式布局**：适配各种屏幕尺寸
- ⚡ **高性能优化**：按需加载 + 代码分割
- 🛠️ **开发体验优秀**：ESLint + Prettier + 自动导入

## 🚀 技术栈

| 类别 | 技术 |
|------|------|
| 核心框架 | Vue 3.5 + TypeScript |
| 构建工具 | Vite 7 |
| 组件库 | Element Plus 2.13 |
| 状态管理 | Pinia 3 |
| 路由管理 | Vue Router 5 |
| HTTP客户端 | Axios 1.13 |
| CSS预处理器 | Sass |
| 图标库 | Iconify + Element Plus Icons |
| 代码规范 | ESLint + TypeScript ESLint |

## 📁 项目结构

```
src/
├── api/                 # API 接口定义
├── components/          # 全局组件
├── directives/          # 自定义指令
├── layout/             # 页面布局组件
├── router/             # 路由配置
├── store/              # 状态管理
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
├── views/              # 页面视图
│   ├── dashboard/      # 仪表板
│   ├── login/          # 登录页面
│   ├── system/         # 系统管理模块
│   │   ├── sys_user/   # 用户管理
│   │   ├── sys_role/   # 角色管理
│   │   ├── sys_menu/   # 菜单管理
│   │   ├── sys_config/ # 系统配置
│   │   └── sys_region/ # 地区管理
│   └── error/          # 错误页面
├── App.vue             # 根组件
├── main.ts             # 入口文件
└── style.css           # 全局样式
```

## 🛠️ 快速开始

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0（推荐）或 npm >= 8.0.0

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
```

## 🔧 核心功能

### 🔐 权限管理系统

- 基于 RBAC 的权限控制
- 路由级别的权限验证
- 组件级别的按钮权限控制
- 动态菜单生成

### 🎨 UI 组件特性

- 响应式表格组件（分页、搜索、排序）
- 弹窗表单组件
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
- 快捷操作入口
- 系统信息概览

### 👥 用户管理
- 用户列表展示
- 用户增删改查
- 手机号、邮箱验证
- 状态管理（启用/禁用）

### 🎭 角色管理
- 角色权限分配
- 角色成员管理
- 权限继承机制

### 📋 菜单管理
- 动态路由配置
- 菜单层级管理
- 权限标识绑定

### ⚙️ 系统配置
- 系统参数设置
- 配置项管理
- 热更新支持

### 🌍 地区管理
- 省市区三级联动
- 地区数据维护
- 地理位置信息管理

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

常见的 type：
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具变动

## 💬 联系方式

如有问题，请提交 Issue 或联系项目维护者。
