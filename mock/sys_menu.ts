import {MockMethod} from 'vite-plugin-mock'

// 模拟菜单数据
const mockMenus = [
  {
    id: 1,
    pid: 0,
    name: '系统管理',
    permission: 'sys:manage',
    keepAlive: '0',
    type: 0,
    children: [
      {
        id: 2,
        pid: 1,
        name: '用户管理',
        permission: 'sys:user:list',
        keepAlive: '1',
        type: 1,
      },
      {
        id: 3,
        pid: 1,
        name: '角色管理',
        permission: 'sys:role:list',
        keepAlive: '1',
        type: 1,
      },
      {
        id: 4,
        pid: 1,
        name: '菜单管理',
        permission: 'sys:menu:list',
        keepAlive: '1',
        type: 1,
      },
    ],
  },
  {
    id: 5,
    pid: 0,
    name: '系统监控',
    permission: 'sys:monitor',
    keepAlive: '0',
    type: 0,
    children: [
      {
        id: 6,
        pid: 5,
        name: '在线用户',
        permission: 'sys:online:list',
        keepAlive: '1',
        type: 1,
      },
      {
        id: 7,
        pid: 5,
        name: '操作日志',
        permission: 'sys:log:list',
        keepAlive: '1',
        type: 1,
      },
    ],
  },
]

const sysMenuMock: MockMethod[] = [
  // 获取菜单树列表
  {
    url: '/mock-api/sysMenu/tree',
    method: 'get',
    response: () => {
      return {
        code: 0,
        msg: '获取成功',
        data: mockMenus,
      }
    },
  },
  // 新增菜单
  {
    url: '/mock-api/sysMenu/add',
    method: 'post',
    response: ({body}) => {
      return {
        code: 0,
        msg: '新增成功',
        data: null,
      }
    },
  },
  // 编辑菜单
  {
    url: '/mock-api/sysMenu/update',
    method: 'post',
    response: ({body}) => {
      return {
        code: 0,
        msg: '更新成功',
        data: null,
      }
    },
  },
  // 删除菜单
  {
    url: '/mock-api/sysMenu/del',
    method: 'post',
    response: ({body}) => {
      return {
        code: 0,
        msg: '删除成功',
        data: null,
      }
    },
  },
]

export default sysMenuMock
