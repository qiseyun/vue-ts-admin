import {type RouteRecordRaw} from 'vue-router'

// 控制台页面组件
const Layout = () => import('@/layout/index.vue')
const Dashboard = () => import('@/views/dashboard/dashboard_index.vue')

// 控制台路由配置
export const dashboardRoutes: RouteRecordRaw[] = [
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
]