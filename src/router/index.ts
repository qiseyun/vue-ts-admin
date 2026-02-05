import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
import {useUserStore} from '@/store/user'
import {ElMessage} from 'element-plus'

// 核心页面
const Layout = () => import('@/layout/index.vue')
const ERROR_404 = () => import('@/views/error/404.vue')
const Login = () => import('@/views/login/index.vue')
const Redirect = () => import('@/views/redirect/index.vue')
// 控制台
const Dashboard = () => import('@/views/dashboard/index.vue')
// 权限管理
const User = () => import('@/views/system/user/index.vue')
const Role = () => import('@/views/system/role/index.vue')
const Menu = () => import('@/views/system/menu/index.vue')
// 系统管理
const Setting = () => import('@/views/system/setting/index.vue')


// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  //   重定向页面（用于刷新）
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
  //   404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: ERROR_404,
    meta: {
      title: '404',
      hidden: true,
    },
  },
  //   登录页面
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      hidden: true,
    },
  },
  //   控制台
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard',
    meta: {
      title: '控制台',
      icon: 'HomeFilled',
      multiMenu: false,
    },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: '控制台',
          icon: 'HomeFilled',
        },
      },
    ],
  },
  //   权限管理
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/user',
    meta: {
      title: '权限管理',
      icon: 'Lock',
      multiMenu: true,
    },
    children: [
      {
        path: '/permission/user',
        name: 'User',
        component: User,
        meta: {
          title: '用户管理',
          icon: 'User',
          permission: 'system:user:list',
        },
      },
      {
        path: '/permission/role',
        name: 'Role',
        component: Role,
        meta: {
          title: '角色管理',
          icon: 'Avatar',
          permission: 'system:role:list',
        },
      },
      {
        path: '/permission/menu',
        name: 'Menu',
        component: Menu,
        meta: {
          title: '菜单管理',
          icon: 'Menu',
          permission: 'system:menu:list',
        },
      },
    ],
  },
  //   系统管理
  {
    path: '/system',
    component: Layout,
    redirect: '/system/setting',
    meta: {
      title: '系统管理',
      icon: 'Setting',
      multiMenu: true,
    },
    children: [
      {
        path: '/system/setting',
        name: 'Setting',
        component: Setting,
        meta: {
          title: '系统设置',
          icon: 'Setting',
        },
      },
    ],
  },
]


// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})


// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  // 设置页面标题
  document.title = `${to.meta.title || '管理后台'} - Vue Admin`
  // 判断是否需要登录
  if (to.path !== '/login') {
    if (!userStore.isLogin) {
      // 未登录，跳转到登录页
      next('/login')
      return
    }

    // 检查权限
    const permission = to.meta.permission as string
    if (permission && !userStore.hasPermission(permission)) {
      // 没有权限，显示提示
      ElMessage.error('您没有权限访问该页面')
      next(false)
      return
    }
  }

  next()
})

export default router
