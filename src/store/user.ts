import {defineStore} from 'pinia'
import type {UserInfo} from '@/types/auth.ts'
import {getUserInfo, getPermissions, logout as logoutApi} from '@/api/auth'

interface UserState {
  token: string
  expiresTime: number
  userInfo: UserInfo | null
  roles: string[]
  permissions: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => {
    const userInfoStr = localStorage.getItem('userInfo')
    const permissionsStr = localStorage.getItem('permissions')
    let userInfo: UserInfo | null = null
    let roles: string[] = []
    let permissions: string[] = []

    if (userInfoStr) {
      try {
        userInfo = JSON.parse(userInfoStr)
      } catch (e) {
        console.error('Failed to parse userInfo from localStorage', e)
      }
    }

    if (permissionsStr) {
      try {
        permissions = JSON.parse(permissionsStr)
      } catch (e) {
        console.error('Failed to parse permissions from localStorage', e)
      }
    }

    return {
      token: localStorage.getItem('token') || '',
      expiresTime: Number(localStorage.getItem('expiresTime')) || 0,
      userInfo,
      roles,
      permissions,
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
    setToken(token: string, expiresTime: number) {
      this.token = token
      this.expiresTime = expiresTime
      localStorage.setItem('token', token)
      localStorage.setItem('expiresTime', String(expiresTime))
    },

    // 设置用户信息
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },

    // 设置权限
    setPermissions(permissions: string[]) {
      this.permissions = permissions
      localStorage.setItem('permissions', JSON.stringify(permissions))
    },

    // 登录
    async login(token: string, expiresTime: number) {
      this.setToken(token, expiresTime)
      // 获取用户信息
      await this.fetchUserInfo()
      // 获取权限列表
      await this.fetchPermissions()
    },

    // 获取用户信息
    async fetchUserInfo() {
      try {
        const res = await getUserInfo()
        this.setUserInfo(res.data)
        return res.data
      } catch (error) {
        console.error('获取用户信息失败：', error)
        throw error
      }
    },

    // 获取权限列表
    async fetchPermissions() {
      try {
        const res = await getPermissions()
        this.setPermissions(res.data)
        return res.data
      } catch (error) {
        console.error('获取权限列表失败：', error)
        throw error
      }
    },

    // 退出登录
    async logout() {
      try {
        await logoutApi()
      } catch (error) {
        console.error('退出登录接口调用失败：', error)
      } finally {
        this.token = ''
        this.expiresTime = 0
        this.userInfo = null
        this.permissions = []
        localStorage.removeItem('token')
        localStorage.removeItem('expiresTime')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('permissions')
      }
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

    // 初始化用户信息（页面刷新时调用）
    async initUserInfo() {
      if (this.isLogin && this.token) {
        try {
          // 尝试获取最新的用户信息
          await this.fetchUserInfo()
          // 尝试获取最新的权限列表
          await this.fetchPermissions()
          return true
        } catch (error) {
          console.error('初始化用户信息失败:', error)
          // 如果获取失败，清除本地存储并重定向到登录页
          await this.logout()
          return false
        }
      }
      return false
    },
  },
})
