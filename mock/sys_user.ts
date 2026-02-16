import {MockMethod} from 'vite-plugin-mock'

// 模拟用户数据
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    realName: '系统管理员',
    phone: '13800138000',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    deptId: 1,
    lockFlag: 0,
    email: 'admin@mikuyun.com',
    gmtCreated: '2024-01-01 10:00:00',
  },
  {
    id: 2,
    username: 'test',
    realName: '测试用户',
    phone: '13800138001',
    avatar: '',
    deptId: 2,
    lockFlag: 0,
    email: 'test@mikuyun.com',
    gmtCreated: '2024-01-02 10:00:00',
  },
  {
    id: 3,
    username: 'user1',
    realName: '普通用户1',
    phone: '13800138002',
    avatar: '',
    deptId: 2,
    lockFlag: 0,
    email: 'user1@mikuyun.com',
    gmtCreated: '2024-01-03 10:00:00',
  },
]

const sysUserMock: MockMethod[] = [
  // 获取用户列表
  {
    url: '/mock-api/sysUser/list',
    method: 'get',
    response: ({query}) => {
      const {phone, current = 1, size = 10} = query
      let list = [...mockUsers]
      
      // 根据手机号筛选
      if (phone) {
        list = list.filter(user => user.phone.includes(phone))
      }
      
      return {
        code: 0,
        msg: '获取成功',
        data: list,
      }
    },
  },
  // 新增用户
  {
    url: '/mock-api/sysUser/add',
    method: 'post',
    response: ({body}) => {
      const newUser = {
        id: mockUsers.length + 1,
        ...body,
        gmtCreated: new Date().toISOString().replace('T', ' ').substring(0, 19),
      }
      mockUsers.push(newUser)
      return {
        code: 0,
        msg: '新增成功',
        data: null,
      }
    },
  },
  // 更新用户
  {
    url: '/mock-api/sysUser/update',
    method: 'post',
    response: ({body}) => {
      const index = mockUsers.findIndex(user => user.id === body.id)
      if (index > -1) {
        mockUsers[index] = {...mockUsers[index], ...body}
      }
      return {
        code: 0,
        msg: '更新成功',
        data: null,
      }
    },
  },
  // 删除用户
  {
    url: '/mock-api/sysUser/del',
    method: 'post',
    response: ({body}) => {
      const index = mockUsers.findIndex(user => user.id === body.id)
      if (index > -1) {
        mockUsers.splice(index, 1)
      }
      return {
        code: 0,
        msg: '删除成功',
        data: null,
      }
    },
  },
  // 获取用户角色列表
  {
    url: '/mock-api/sysUserRole/getRoles/:sysUserId',
    method: 'get',
    response: ({query}) => {
      // 模拟返回角色ID列表
      return {
        code: 0,
        msg: '获取成功',
        data: [1, 2], // 默认分配admin和user角色
      }
    },
  },
  // 编辑用户角色
  {
    url: '/mock-api/sysUserRole/editRoles',
    method: 'post',
    response: () => {
      return {
        code: 0,
        msg: '编辑成功',
        data: null,
      }
    },
  },
  // 个人信息修改
  {
    url: '/mock-api/sysUser/updateMy',
    method: 'post',
    response: () => {
      return {
        code: 0,
        msg: '修改成功',
        data: null,
      }
    },
  },
]

export default sysUserMock
