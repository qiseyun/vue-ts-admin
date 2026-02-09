import {type RouteRecordRaw} from 'vue-router'

// 系统管理页面组件
const Layout = () => import('@/layout/index.vue')
const Setting = () => import('@/views/system/sys_config/sys_config_index.vue')
const Region = () => import('@/views/system/sys_region/sys_region_index.vue')

// 系统管理路由配置
export const systemRoutes: RouteRecordRaw[] = [
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
          permission: 'system:config:page',
        },
      },
      {
        path: '/system/region',
        name: 'Region',
        component: Region,
        meta: {
          title: '城市地区信息',
          icon: 'Location',
          permission: 'system:region:page',
        },
      },
    ],
  },
]