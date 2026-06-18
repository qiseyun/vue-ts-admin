import { type RouteRecordRaw } from 'vue-router'

// 流程管理页面组件
const Layout = () => import('@/layout/index.vue')
const FlowDefinition = () => import('@/views/flow/definition_index.vue')
const FlowInstance = () => import('@/views/flow/instance_index.vue')
const FlowTodo = () => import('@/views/flow/todo_index.vue')
const FlowDone = () => import('@/views/flow/done_index.vue')
const WarmFlow = () => import('@/views/flow/warm_flow.vue')

// 流程管理路由配置
export const flowRoutes: RouteRecordRaw[] = [
  {
    path: '/flow',
    component: Layout,
    redirect: '/flow/definition',
    meta: {
      title: '流程管理',
      icon: 'Promotion',
      multiMenu: true,
    },
    children: [
      {
        path: '/flow/definition',
        name: 'FlowDefinition',
        component: FlowDefinition,
        meta: {
          title: '流程定义',
          icon: 'Document',
          permission: 'system:flow:def:list',
        },
      },
      {
        path: '/flow/instance',
        name: 'FlowInstance',
        component: FlowInstance,
        meta: {
          title: '流程实例',
          icon: 'List',
          permission: 'system:flow:ins:list',
        },
      },
      {
        path: '/flow/todo',
        name: 'FlowTodo',
        component: FlowTodo,
        meta: {
          title: '我的待办',
          icon: 'Clock',
          permission: 'system:flow:task:list',
        },
      },
      {
        path: '/flow/done',
        name: 'FlowDone',
        component: FlowDone,
        meta: {
          title: '我的已办',
          icon: 'Checked',
          permission: 'system:flow:task:list',
        },
      },
      {
        path: '/flow/warmFlow',
        name: 'WarmFlow',
        component: WarmFlow,
        meta: {
          title: '流程设计',
          icon: 'Tools',
          hidden: true,
          permission: 'system:flow:def:list',
        },
      },
    ],
  },
]
