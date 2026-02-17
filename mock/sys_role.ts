import {MockMethod} from 'vite-plugin-mock'

// 模拟角色数据
const mockRoles = [
  {
    id: 1,
    roleName: '超级管理员',
    roleCode: 'admin',
    roleDesc: '拥有系统所有权限',
    status: 0,
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: 2,
    roleName: '普通用户',
    roleCode: 'user',
    roleDesc: '普通用户权限',
    status: 0,
    createTime: '2024-01-02 10:00:00',
  },
  {
    id: 3,
    roleName: '测试角色',
    roleCode: 'test',
    roleDesc: '测试人员权限',
    status: 1,
    createTime: '2024-01-03 10:00:00',
  },
]

const sysRoleMock: MockMethod[] = [
  // 获取角色列表
  {
    url: '/mock-api/sysRole/getRoleList',
    method: 'get',
    response: ({query}) => {
      const {roleName, roleCode, current = 1, size = 10} = query
      let list = [...mockRoles]
      
      // 根据角色名筛选
      if (roleName) {
        list = list.filter(role => role.roleName.includes(roleName))
      }
      
      // 根据角色编码筛选
      if (roleCode) {
        list = list.filter(role => role.roleCode.includes(roleCode))
      }
      
      return {
        code: 0,
        msg: '获取成功',
        data: list,
      }
    },
  },
  // 新增角色
  {
    url: '/mock-api/sysRole/add',
    method: 'post',
    response: ({body}) => {
      const newRole = {
        id: mockRoles.length + 1,
        ...body,
        status: 0,
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      }
      mockRoles.push(newRole)
      return {
        code: 0,
        msg: '新增成功',
        data: null,
      }
    },
  },
  // 更新角色
  {
    url: '/mock-api/sysRole/update',
    method: 'post',
    response: ({body}) => {
      const index = mockRoles.findIndex(role => role.id === body.id)
      if (index > -1) {
        mockRoles[index] = {...mockRoles[index], ...body}
      }
      return {
        code: 0,
        msg: '更新成功',
        data: null,
      }
    },
  },
  // 删除角色
  {
    url: '/mock-api/sysRole/del',
    method: 'post',
    response: ({body}) => {
      const index = mockRoles.findIndex(role => role.id === body.id)
      if (index > -1) {
        mockRoles.splice(index, 1)
      }
      return {
        code: 0,
        msg: '删除成功',
        data: null,
      }
    },
  },
  // 编辑角色权限
  {
    url: '/mock-api/sysRP/edit',
    method: 'post',
    response: () => {
      return {
        code: 0,
        msg: '编辑成功',
        data: null,
      }
    },
  },
  // 获取角色权限列表
  {
    url: '/mock-api/sysPermissions/rolePermissions/:roleId',
    method: 'get',
    response: ({query}) => {
      // 模拟返回权限ID列表
      return {
        code: 0,
        msg: '获取成功',
        data: [1, 2, 3, 4, 5, 6, 7], // 返回所有菜单权限
      }
    },
  },
]

export default sysRoleMock
