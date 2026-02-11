import {type RouteRecordRaw} from 'vue-router'

// 权限管理页面组件
const Layout = () => import('@/layout/index.vue')
const User = () => import('@/views/system/sys_user/sys_user_index.vue')
const Role = () => import('@/views/system/sys_role/sys_role_index.vue')
const Menu = () => import('@/views/system/sys_menu/sys_menu_index.vue')

// 权限管理路由配置
export const permissionRoutes: RouteRecordRaw[] = [
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
          permission: 'system:user:page_view',
        },
      },
      {
        path: '/permission/role',
        name: 'Role',
        component: Role,
        meta: {
          title: '角色管理',
          icon: 'Avatar',
          permission: 'system:role:page_view',
        },
      },
      {
        path: '/permission/menu',
        name: 'Menu',
        component: Menu,
        meta: {
          title: '权限管理',
          icon: 'Menu',
          permission: 'system:menu:page_view',
        },
      },
    ],
  },
]