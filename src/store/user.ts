import { defineStore } from 'pinia'
import type { UserInfo } from '@/types'

interface UserState {
  token: string
  userInfo: UserInfo | null
  permissions: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => {
    const userInfoStr = localStorage.getItem('userInfo')
    let userInfo: UserInfo | null = null
    if (userInfoStr) {
      try {
        userInfo = JSON.parse(userInfoStr)
      } catch (e) {
        console.error('Failed to parse userInfo from localStorage', e)
      }
    }
    return {
      token: localStorage.getItem('token') || '',
      userInfo,
      permissions: userInfo?.permissions || [],
    }
  },

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
      localStorage.setItem('token', 'Bearer ' + token)
    },

    // 设置用户信息
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
      this.permissions = userInfo.permissions || []
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
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
      // 直接匹配
      if (this.permissions.includes(permission)) {
        return true
      }
      // 处理通配符权限 "*:*:*" 形式
      const parts = permission.split(':')
      if (parts.length !== 3) {
        return false
      }
      return this.permissions.some(userPerm => {
        const userParts = userPerm.split(':')
        if (userParts.length !== 3) {
          return false
        }
        // 逐级匹配，支持通配符 *
        for (let i = 0; i < 3; i++) {
          if (userParts[i] !== '*' && userParts[i] !== parts[i]) {
            return false
          }
        }
        return true
      })
    },

    // 检查是否有任一个权限
    hasAnyPermission(permissions: string[]): boolean {
      return permissions.some(permission => this.permissions.includes(permission))
    },

    // 检查是否有所有权限
    hasAllPermissions(permissions: string[]): boolean {
      return permissions.every(permission => this.permissions.includes(permission))
    },
  },
})
