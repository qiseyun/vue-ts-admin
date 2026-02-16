import {MockMethod} from 'vite-plugin-mock'

const authMock: MockMethod[] = [
  // 登录接口
  {
    url: '/mock-api/auth/login',
    method: 'post',
    response: () => {
      return {
        code: 0,
        msg: '登录成功',
        data: {
          accessToken: 'mock_token_' + Date.now(),
          expiresTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7天后过期
        },
      }
    },
  },
  // 获取用户信息
  {
    url: '/mock-api/auth/getInfo',
    method: 'get',
    response: () => {
      return {
        code: 0,
        msg: '获取成功',
        data: {
          id: 1,
          username: 'admin',
          telephone: '13800138000',
          realName: '系统管理员',
          headPortrait: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          email: 'admin@mikuyun.com',
          userType: 1,
          lastLoginTime: new Date().toISOString(),
          lastLoginIp: '127.0.0.1',
        },
      }
    },
  },
  // 获取权限列表
  {
    url: '/mock-api/auth/permissions',
    method: 'get',
    response: () => {
      return {
        code: 0,
        msg: '获取成功',
        data: ['*:*:*'], // 超级管理员拥有所有权限
      }
    },
  },
  // 退出登录
  {
    url: '/mock-api/auth/logout',
    method: 'post',
    response: () => {
      return {
        code: 0,
        msg: '退出成功',
        data: null,
      }
    },
  },
]

export default authMock
