import {type RouteRecordRaw} from 'vue-router'

// 核心页面组件
const Layout = () => import('@/layout/index.vue')
const ERROR_404 = () => import('@/views/error/404.vue')
const Login = () => import('@/views/login/login_index.vue')
const Redirect = () => import('@/views/redirect/redirect_index.vue')

// 核心路由配置
export const coreRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  // 重定向页面（用于刷新）
  {
    path: '/redirect',
    component: Layout,
    meta: {
      hidden: true,
    },
    children: [
      {
        path: '/redirect/:path(.*)',
        component: Redirect,
        meta: {
          hidden: true,
        },
      },
    ],
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: ERROR_404,
    meta: {
      title: '404',
      hidden: true,
    },
  },
  // 登录页面
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      hidden: true,
    },
  },
]