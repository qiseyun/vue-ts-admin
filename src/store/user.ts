import { defineStore } from 'pinia'
import type { UserInfo } from '@/types'

interface UserState {
  token: string
  userInfo: UserInfo | null
  permissions: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    permissions: [],
  }),

  getters: {
    // 是否已登录
    isLogin: (state) => !!state.token,
    
    // 获取用户权限
    getPermissions: (state) => state.permissions,
  },

  actions: {
    // 设置token
    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },

    // 设置用户信息
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
      this.permissions = userInfo.permissions || []
    },

    // 登录
    async login(token: string, userInfo: UserInfo) {
      this.setToken(token)
      this.setUserInfo(userInfo)
    },

    // 退出登录
    logout() {
      this.token = ''
      this.userInfo = null
      this.permissions = []
      localStorage.removeItem('token')
    },

    // 检查是否有权限
    hasPermission(permission: string): boolean {
      return this.permissions.includes(permission)
    },

    // 检查是否有任一权限
    hasAnyPermission(permissions: string[]): boolean {
      return permissions.some(permission => this.permissions.includes(permission))
    },

    // 检查是否有所有权限
    hasAllPermissions(permissions: string[]): boolean {
      return permissions.every(permission => this.permissions.includes(permission))
    },
  },
})
