// 用户信息类型
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  roles: string[]
  permissions: string[]
}

// 登录表单类型
export interface LoginForm {
  username: string
  password: string
}

// 登录响应类型
export interface LoginResponse {
  token: string
  userInfo: UserInfo
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 菜单项类型
export interface MenuItem {
  id: number
  path: string
  name: string
  title: string
  icon?: string
  component?: string
  redirect?: string
  children?: MenuItem[]
  hidden?: boolean
  permission?: string
}
