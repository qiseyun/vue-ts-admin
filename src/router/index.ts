import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
import {useUserStore} from '@/store/user'
import {ElMessage} from 'element-plus'

// 导入各模块路由
import {coreRoutes} from './modules/core'
import {dashboardRoutes} from './modules/dashboard'
import {permissionRoutes} from './modules/permission'
import {systemRoutes} from './modules/system'

// 合并所有路由
const routes: RouteRecordRaw[] = [
  ...coreRoutes,
  ...dashboardRoutes,
  ...permissionRoutes,
  ...systemRoutes,
]


// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})


// 路由守卫
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  document.title = `${to.meta.title || '管理后台'} - Vue Admin`

  // 如果是首次访问或刚登录，初始化用户信息
  if (to.path !== '/login') {
    try {
      await userStore.initUserInfo()
    } catch (error) {
      console.error('初始化用户信息失败:', error)
      next('/login')
      return
    }
  }

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
