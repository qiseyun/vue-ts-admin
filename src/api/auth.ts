import {post, get} from '@/utils/request'
import type {LoginForm, LoginResponse, UserInfo, ApiResponse} from '@/types'

// 登录接口
export function login(data: LoginForm) {
  return post<ApiResponse<LoginResponse>>('/auth/login', data)
}

// 获取用户信息
export function getUserInfo() {
  return get<ApiResponse<UserInfo>>('/auth/getInfo')
}

// 获取权限列表
export function getPermissions() {
  return get<ApiResponse<string[]>>('/auth/permissions')
}

// 退出登录
export function logout() {
  return post<ApiResponse<null>>('/auth/logout')
}
